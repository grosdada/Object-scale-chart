import { removeBackground } from '@imgly/background-removal';

window.LocalAICutout = Object.freeze({
  async remove(blob, progress) {
    return removeBackground(blob, {
      model: 'isnet_quint8',
      device: 'cpu',
      output: { format: 'image/png', quality: 1, type: 'foreground' },
      progress: (key, current, total) => progress?.({ key, current, total })
    });
  }
});
