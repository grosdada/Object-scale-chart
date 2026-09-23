# Échelle — Studio de proportions

Une petite application en français pour préparer une référence de proportions pour une vidéo IA : **un tableau gradué + son prompt**, entièrement sur votre appareil, sans API, sans compte et sans dépendance à installer.

## Lancer l’application

Avec Node.js installé :

```sh
npm start
```

Ouvrir [http://127.0.0.1:4173](http://127.0.0.1:4173). Le serveur écoute uniquement sur la machine locale. Le port peut être modifié avec la variable `PORT`.

Les fichiers sont aussi utilisables sur un hébergement statique. Il est possible d’ouvrir `index.html` directement ; la sauvegarde automatique et le presse-papiers dépendent alors des restrictions du navigateur. Le serveur local est recommandé.

## Fonctionnalités

- **136 presets** : 3 hommes et 3 femmes de corpulences différentes, 30 animaux, 50 véhicules et 50 bâtiments / monuments. Les planches Ideogram fournies ont été découpées et détourées localement ; 127 nouvelles silhouettes sont intégrées. La planche 01 reçue étant un doublon exact de la planche 02, les 6 humains, le chien, le chat et le gorille gardent temporairement leur SVG de secours. Les dimensions sont des valeurs de travail indicatives, modifiables, pas des mesures certifiées de modèles commerciaux.
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

## Organisation

- `index.html`, `styles.css` : interface responsive.
- `app.js` : interactions, import local, export, sauvegarde.
- `catalogue.js` : 136 presets et dimensions initiales.
- `shapes.js` : tracés SVG des silhouettes.
- `subject-assets.js` : masques PNG intégrés des silhouettes générées, recolorés par l’application.
- `assets/source-grids/`, `assets/subjects/` : planches originales, découpes transparentes et manifeste de correspondance.
- `scripts/process_subject_grids.py` : traitement reproductible des grilles 3 × 3.
- `core.js` : mesures, mise à l’échelle, étiquettes, prompt et validation des projets.
- `server.cjs` : serveur statique local, sans dépendances.
- `ideogram-prompts.html` : 16 prompts en grilles 3 × 3 pour régénérer les 136 silhouettes dans un style cohérent.

Aucun fichier utilisateur n’est envoyé sur un serveur. Aucun CDN, service de police, outil d’analyse ou SDK IA n’est utilisé.
