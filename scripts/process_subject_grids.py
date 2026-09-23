"""Split the 3x3 Ideogram sheets into transparent subject masks used by the app."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "source-grids"
OUTPUT = ROOT / "assets" / "subjects"
PREVIEW = ROOT / "test-results" / "processed-subjects.png"

# Positions are row-major. None marks an extra useful icon that is not in the preset catalogue.
GRID_SLOTS = {
    1: ["human-1", "human-2", "human-3", "human-4", "human-5", "human-6", "animal-7", "animal-8", "animal-9"],
    2: [f"animal-{i}" for i in range(10, 19)],
    3: [f"animal-{i}" for i in range(19, 28)],
    4: [f"animal-{i}" for i in range(28, 37)],
    5: [f"vehicle-{i}" for i in range(37, 46)],
    6: [f"vehicle-{i}" for i in range(46, 55)],
    7: [f"vehicle-{i}" for i in range(55, 64)],
    8: [f"vehicle-{i}" for i in range(64, 73)],
    9: [f"vehicle-{i}" for i in range(73, 82)],
    10: ["vehicle-82", "vehicle-83", "vehicle-84", "vehicle-85", "vehicle-86", "extra-minibus", "extra-mobile-crane", "extra-tank", "extra-submarine"],
    11: [f"building-{i}" for i in range(87, 96)],
    12: [f"building-{i}" for i in range(96, 105)],
    13: [f"building-{i}" for i in range(105, 114)],
    14: [f"building-{i}" for i in range(114, 123)],
    15: [f"building-{i}" for i in range(123, 132)],
    16: ["building-132", "building-133", "building-134", "building-135", "building-136", "extra-radio-telescope", "extra-dam", "extra-harbor-crane", "extra-launch-tower"],
}


def transparent_icon(cell: Image.Image) -> Image.Image:
    """Turn a light-background navy pictogram into a tight, antialiased RGBA mask."""
    rgb = np.asarray(cell.convert("RGB"), dtype=np.float32)
    h, w, _ = rgb.shape
    border = np.concatenate((rgb[:8].reshape(-1, 3), rgb[-8:].reshape(-1, 3), rgb[:, :8].reshape(-1, 3), rgb[:, -8:].reshape(-1, 3)))
    # The brightest border pixels are the most reliable estimate when a subject touches an edge.
    brightness = border.mean(axis=1)
    background = np.median(border[brightness >= np.percentile(brightness, 65)], axis=0)
    color_distance = np.linalg.norm(rgb - background, axis=2)
    darkness = np.maximum(0, background.mean() - rgb.mean(axis=2))
    chroma = rgb.max(axis=2) - rgb.min(axis=2)
    evidence = np.maximum(color_distance, np.maximum(darkness * 1.08, chroma * 1.2))
    alpha = np.clip((evidence - 18.0) / 58.0 * 255.0, 0, 255).astype(np.uint8)
    # Prevent very pale grid residue while preserving the antialiased subject edge.
    alpha[(evidence < 29) & (chroma < 18)] = 0
    # Ideogram sometimes leaves broad, low-opacity blue bands around long subjects.
    # Removing only the faint tail keeps the antialiased ink edge and clears those bands.
    alpha[alpha < 190] = 0
    clear = max(6, round(min(w, h) * .025))
    alpha[:clear, :] = 0; alpha[-clear:, :] = 0; alpha[:, :clear] = 0; alpha[:, -clear:] = 0
    # Remove isolated generation specks before calculating the tight ground-aligned bounds.
    mask = alpha > 0
    visited = np.zeros(mask.shape, dtype=bool)
    minimum_component = max(12, round(mask.size * .00025))
    for seed_y, seed_x in np.argwhere(mask):
        if visited[seed_y, seed_x]:
            continue
        stack = [(int(seed_y), int(seed_x))]
        visited[seed_y, seed_x] = True
        component = []
        while stack:
            cy, cx = stack.pop()
            component.append((cy, cx))
            for ny in range(max(0, cy - 1), min(h, cy + 2)):
                for nx in range(max(0, cx - 1), min(w, cx + 2)):
                    if mask[ny, nx] and not visited[ny, nx]:
                        visited[ny, nx] = True
                        stack.append((ny, nx))
        if len(component) < minimum_component:
            yy, xx = zip(*component)
            alpha[np.asarray(yy), np.asarray(xx)] = 0
    ys, xs = np.where(alpha > 18)
    if not len(xs):
        raise ValueError("No subject pixels detected")
    # Tight bounds are intentional: the last visible pixel must sit on the chart ground line.
    x0, x1 = xs.min(), xs.max() + 1
    y0, y1 = ys.min(), ys.max() + 1
    alpha = alpha[y0:y1, x0:x1]
    # A single, neutral ink colour keeps PNGs compact; the app recolours SourceAlpha at render time.
    rgba = np.full((alpha.shape[0], alpha.shape[1], 4), 255, dtype=np.uint8)
    rgba[:, :, :3] = (255, 255, 255)
    rgba[alpha > 0, :3] = (20, 47, 82)
    rgba[:, :, 3] = alpha
    return Image.fromarray(rgba, "RGBA")


def sheet_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def divider_positions(image: Image.Image) -> tuple[list[int], list[int]]:
    """Detect the two bright separators on each axis instead of assuming equal thirds."""
    rgb = np.asarray(image.convert("RGB"), dtype=np.float32)
    gray = rgb.mean(axis=2)
    inset = max(24, round(min(image.size) * .05))
    row_score = gray[:, inset:-inset].mean(axis=1)
    column_score = gray[inset:-inset, :].mean(axis=0)

    def peaks(score: np.ndarray, length: int) -> list[int]:
        ranges = ((round(length * .24), round(length * .46)), (round(length * .54), round(length * .80)))
        return [start + int(np.argmax(score[start:end])) for start, end in ranges]

    return peaks(column_score, image.width), peaks(row_score, image.height)


def build_preview(files: list[Path]) -> None:
    columns, cell_w, cell_h = 10, 142, 158
    rows = (len(files) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * cell_w, rows * cell_h), (232, 235, 241))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    for index, path in enumerate(files):
        icon = Image.open(path).convert("RGBA")
        icon.thumbnail((cell_w - 24, cell_h - 38), Image.Resampling.LANCZOS)
        x = index % columns * cell_w
        y = index // columns * cell_h
        # Checkerboard makes remaining opaque background immediately visible.
        for cy in range(y + 4, y + cell_h - 25, 12):
            for cx in range(x + 4, x + cell_w - 4, 12):
                shade = 248 if ((cx - x) // 12 + (cy - y) // 12) % 2 else 220
                draw.rectangle((cx, cy, min(cx + 11, x + cell_w - 5), min(cy + 11, y + cell_h - 26)), fill=(shade, shade, shade))
        px = x + (cell_w - icon.width) // 2
        py = y + 5 + (cell_h - 31 - icon.height) // 2
        sheet.paste(icon, (px, py), icon)
        draw.text((x + 7, y + cell_h - 20), path.stem, fill=(38, 52, 75), font=font)
    PREVIEW.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(PREVIEW, optimize=True)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    sources = sorted(SOURCE.glob("*.png"))
    if len(sources) != 16:
        raise SystemExit(f"Expected 16 source grids, found {len(sources)}")
    hashes = {int(path.name[:2]): sheet_hash(path) for path in sources}
    skipped = set()
    if hashes[1] == hashes[2]:
        skipped.add(1)
        print("WARNING: grid 01 is byte-identical to grid 02; grid 01 was skipped.")
    manifest = []
    for source in sources:
        grid = int(source.name[:2])
        if grid in skipped:
            for position, preset_id in enumerate(GRID_SLOTS[grid]):
                manifest.append({"grid": grid, "position": position + 1, "presetId": preset_id, "status": "missing_duplicate_grid"})
            continue
        image = Image.open(source).convert("RGB")
        if image.size != (1024, 1024):
            raise ValueError(f"{source.name}: expected 1024x1024, found {image.size}")
        vertical, horizontal = divider_positions(image)
        x_edges, y_edges = [0, *vertical, image.width], [0, *horizontal, image.height]
        for position, preset_id in enumerate(GRID_SLOTS[grid]):
            row, column = divmod(position, 3)
            left, right = x_edges[column] + 3, x_edges[column + 1] - 3
            top, bottom = y_edges[row] + 3, y_edges[row + 1] - 3
            icon = transparent_icon(image.crop((left, top, right, bottom)))
            directory = OUTPUT / ("extras" if preset_id.startswith("extra-") else "presets")
            directory.mkdir(parents=True, exist_ok=True)
            output = directory / f"{preset_id}.png"
            icon.save(output, optimize=True)
            manifest.append({"grid": grid, "position": position + 1, "presetId": preset_id, "status": "processed", "file": output.relative_to(ROOT).as_posix(), "width": icon.width, "height": icon.height})

    preset_files = sorted((OUTPUT / "presets").glob("*.png"))
    (OUTPUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    build_preview(preset_files)
    print(f"Processed {len(preset_files)} catalogue presets and {len(list((OUTPUT / 'extras').glob('*.png')))} extras.")
    print(f"Preview: {PREVIEW}")


if __name__ == "__main__":
    main()
