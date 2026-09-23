# Échelle — Studio de proportions

Une application bilingue anglais/français pour préparer une référence de proportions pour une vidéo IA : **un tableau gradué + son prompt**, entièrement sur votre appareil, sans API ni compte.

## Lancer l’application

Avec Node.js installé :

```sh
npm start
```

Ouvrir [http://127.0.0.1:4173](http://127.0.0.1:4173). Le serveur écoute uniquement sur la machine locale. Le port peut être modifié avec la variable `PORT`.

Les fichiers sont aussi utilisables sur un hébergement statique. Il est possible d’ouvrir `index.html` directement ; la sauvegarde automatique et le presse-papiers dépendent alors des restrictions du navigateur. Le serveur local est recommandé.

### Application Windows

Téléchargez `Echelle-1.1.0-portable.exe` depuis la [dernière release GitHub](https://github.com/grosdada/Object-scale-chart/releases/latest). L’exécutable portable ne nécessite pas d’installation. Le bouton **Update / Mise à jour** compare sa version avec la dernière release du dépôt et ouvre directement le nouvel exécutable lorsqu’il existe.

## Fonctionnalités

- **136 presets générés et vectorisés** : 6 humains, 30 animaux, 50 véhicules et 50 bâtiments / monuments, tous issus des planches Ideogram fournies. Les cellules sont découpées, détourées puis converties avec Potrace en courbes SVG qui restent nettes à toute échelle. Aucun ancien tracé SVG n’est affiché. Les dimensions sont des valeurs de travail indicatives, modifiables, pas des mesures certifiées de modèles commerciaux.
- **Alignement au sol précis** : les lignes réelles de chaque grille sont détectées, les pixels parasites sont retirés et chaque contour est recadré au dernier point visible avant vectorisation.
- **Interface bilingue et deux thèmes** : anglais par défaut, bascule française EN/FR et thèmes Light gris pâle / Night. Les préférences restent enregistrées sur l’appareil.
- **Une seule échelle physique** pour tous les sujets, en millimètres, centimètres, mètres ou kilomètres. Une grande construction ou un pétrolier adapte automatiquement le cadrage. Les éléments minuscules restent à leur vraie échelle et leurs étiquettes restent lisibles.
- **Déplacement horizontal et redimensionnement avec poignées**, en conservant les proportions. Tous les sujets reposent sur le même plan au sol. La hauteur ou la longueur peut être renseignée précisément dans l’inspecteur. Les noms complets et dimensions figurent sous les images.
- **Import PNG, JPEG et WebP** : nom, nature et dimension de référence. L’image d’origine représente le sujet, avec son vrai design. Les marges transparentes sont retirées pour que la taille corresponde au contenu visible. Choisissez hauteur ou longueur selon ce que mesure votre valeur.
- **Détourage automatique local**, activé dès l’import, avec précision réglable et comparaison immédiate avec l’original. L’algorithme apprend plusieurs couleurs sur les quatre bords, retire uniquement le fond connecté au cadre, protège un sujet qui touche un seul bord et adoucit le contour. Il fonctionne bien lorsque le fond se distingue du sujet. Il n’utilise ni API, ni modèle téléchargé et ne prétend pas reconnaître sémantiquement une scène complexe ; pour ce cas, un PNG transparent reste la meilleure source.
- **15 sujets humains au maximum** sur un tableau, avec jusqu’à 60 sujets au total.
- **Couleurs du fond et des graduations indépendantes**, couleurs des silhouettes, thèmes clair / sombre / plan bleu, grille activable. Les mêmes réglages sont utilisés dans les exports.
- **Prompt local, déterministe et modifiable**, en français ou en anglais : dimensions, ordre des sujets, référence de hauteur, rapports de proportion et maintien des dimensions pendant la vidéo. Possibilité d’ajouter une action / scène. Les destinations Seedance, MiniMax H3 et Wan 3 utilisent les mêmes instructions physiques universelles ; aucun appel à ces services n’est effectué. Le tableau et le prompt doivent être joints manuellement dans le générateur vidéo. Leur interprétation dépend de ce générateur.
- **Export PNG 1920 ou 3840 px, SVG et prompt TXT**. L’export recadre tous les sujets et masque les poignées, indépendamment du zoom de travail.
- **Sauvegarde automatique IndexedDB**, export et ouverture de projets JSON incluant les images, annuler / rétablir, duplication et alignement.
- Interface adaptée aux ordinateurs, tablettes et mobiles, contrôles au clavier.

Les dimensions secondaires sont déduites des proportions de la silhouette / image. Une photo en perspective reste une représentation 2D : l’application ne peut pas en déduire automatiquement les dimensions physiques cachées.

## Utilisation

1. Cliquer sur une silhouette, ou la glisser sur le tableau. Pour une image personnelle, utiliser **Importer** : le détourage démarre automatiquement. Comparez avec l’original et ajustez la précision si nécessaire.
2. Sélectionner un sujet et régler son nom, sa nature, sa taille, son unité et la dimension mesurée.
3. Tirer une poignée supérieure pour redimensionner ou glisser le sujet horizontalement. **Aligner** redistribue les sujets ; **Ajuster** recadre le tableau. Après un zoom, glisser le fond pour naviguer horizontalement.
4. Le bouton palette ouvre les couleurs du fond et des graduations. Les couleurs personnalisées sont sauvegardées avec le projet.
5. Régler la langue, le sujet de référence et, éventuellement, la scène via les options du prompt. Le texte est modifiable ; un changement de proportions le recalcule.
6. **Exporter la référence** : télécharger l’image puis le prompt. **Projet → Enregistrer le projet** conserve une copie portable de tout le tableau.

Raccourcis : `Ctrl/Cmd+Z` annuler, `Ctrl/Cmd+Maj+Z` ou `Ctrl+Y` rétablir, `Ctrl/Cmd+D` dupliquer, `Suppr` supprimer, `/` rechercher. Un sujet du tableau ayant le focus peut être déplacé avec les flèches et redimensionné avec `+` / `-`.

Les fichiers importés sont limités à 15 Mo / 50 mégapixels puis ramenés à 1400 px sur leur grand côté. Un projet accepte jusqu’à 90 Mo d’images encodées. La sauvegarde automatique est liée à l’adresse et au navigateur utilisés ; un export JSON est recommandé pour conserver un projet durablement.

## Vérification

Les tests du moteur utilisent uniquement Node.js :

```sh
npm test
```

Ils couvrent le catalogue, l’échelle commune, les unités, les rapports du prompt, les projets et la validation des données.

Un parcours de navigateur est fourni dans `tests/browser-smoke.cjs`. Lancer d’abord l’application, puis exécuter le script avec Playwright disponible. Par défaut il utilise Microsoft Edge. `PLAYWRIGHT_MODULE` peut désigner le module Playwright et `BROWSER_PATH` un navigateur Chromium installé. Ce parcours vérifie le redimensionnement, le pétrolier, le détourage, les images importées, la persistance, les exports, la limite de 15 humains et l’absence de débordement sur mobile.

```sh
node tests/browser-smoke.cjs
```

Construire l’exécutable Windows portable :

```sh
npm run dist:win
```

## Organisation

- `index.html`, `styles.css` : interface responsive.
- `app.js` : interactions, import local, export, sauvegarde.
- `catalogue.js` : dimensions et métadonnées des 136 emplacements prévus ; l’interface ne montre que ceux possédant un nouvel asset.
- `subject-vectors.js` : courbes SVG intégrées des silhouettes générées, recolorées par l’application.
- `assets/source-grids/`, `assets/subjects/` : planches originales, découpes transparentes intermédiaires et manifeste de correspondance.
- `scripts/process_subject_grids.py`, `scripts/vectorize_subjects.cjs` : détourage puis vectorisation reproductibles des grilles 3 × 3.
- `core.js` : mesures, mise à l’échelle, étiquettes, prompt et validation des projets.
- `server.cjs` : serveur statique local, sans dépendances.
- `ideogram-prompts.html` : 16 prompts en grilles 3 × 3 pour régénérer les 136 silhouettes dans un style cohérent.

Aucun fichier utilisateur n’est envoyé sur un serveur. Aucun CDN, service de police, outil d’analyse ou SDK IA n’est utilisé.
