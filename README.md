# Installation directe sur GitHub Pages

Décompressez l’archive et déposez **son contenu** à la racine du dépôt : `index.html`, `style.css`, `app.js`, `assets/` et `vendor/` doivent être côte à côte. Ne déposez pas seulement le ZIP.

Dans **Settings → Pages**, choisissez **Deploy from a branch**, votre branche principale et **/(root)**. Cette version contient une vraie page d’accueil à la racine et ne nécessite aucune compilation.

Le workflow GitHub Actions inclus est une autre méthode si vous préférez choisir **GitHub Actions** comme source.

Pour vérifier localement : `python3 -m http.server 8000`, puis ouvrir http://localhost:8000.

---

# Les premières nuits — Chicago 1940

Assistant statique, en français, pour créer un infant de Vampire : La Mascarade V5 à partir du livre de base fourni. Douze écrans, un fond commun, import/export JSON, sauvegarde dans le navigateur et génération d’un dossier récapitulatif PDF.

## Fonctionnement

Les fichiers publiés sont dans `./`. HTML, CSS et modules JavaScript natifs. pdf-lib 1.17.1 et fontkit 1.1.1 sont fournis localement et chargés uniquement pour le dossier PDF. Aucune donnée du personnage n’est transmise à un service de génération. L'application conserve le personnage uniquement sur l'appareil et dans les fichiers JSON téléchargés. L'hébergement est privé par défaut.

## Validation

`node tests.mjs` teste les règles de répartition, les pouvoirs, les budgets, les incompatibilités, les imports, les exports rechargés, les douze rendus HTML et l'impression via un environnement DOM minimal. La page Se nourrir, la reprise après rechargement, le changement de style, les pouvoirs de niveau 3 et la répartition Osiris ont aussi été vérifiés dans le navigateur d’aperçu.

`node dossier-tests.mjs` génère cinq dossiers de contrôle (complet, textes longs, Lamproie, Nosferatu, brouillon), puis vérifie avec PyMuPDF les données, les effets de prédation, les scores représentés et les débordements. Définir `DOSSIER_QA_DIR` pour conserver les fichiers de contrôle. Les rendus ont également été inspectés visuellement.

## Références et cadre

Livre de base français V5 fourni, fiche officielle en deux pages et infographie « Crée ton vampire », filtrée pour exclure les suppléments. Les résumés sont des aides originales ; aucun PDF du livre n'est distribué.

Ce parcours utilise les sept clans, des infants de 12e ou 13e génération, une Puissance du sang de 1, une Humanité de 7 ou 8 avec accord du conteur et aucun XP d'ancienneté. Le style de prédation est différé par défaut pour les novices. L’étape Se nourrir permet de définir avec le conteur l’un des dix styles du livre ; ses effets s’ajoutent séparément aux achats de création. Les disciplines peuvent atteindre 3, et le catalogue de pouvoirs inclut ce niveau. Lamproie porte la Puissance du sang à 2. Caitiffs, Sangs Clairs, Sagas et création collective de coterie sont hors du parcours initial. Les règles et le lore contemporains ne sont pas transposés automatiquement à 1940 : le cas du fléau Tremere appelle une décision explicite du conteur.

## JSON

La sauvegarde native comporte `kind: "vtm-v5-character"` et `schemaVersion: 3`. Elle restaure tous les choix, dont `predator`. Les sauvegardes de version 1 sont migrées en conservant les choix et en décalant les indices des étapes après les disciplines. Les bonus de prédation sont recalculés ; les points de base restent dans leurs champs d’origine. L'import d'un background externe reconnaît des alias usuels, affiche un aperçu avant remplacement et conserve l'objet original dans `originalBackground`. Le format du site de background (`fields`, `convictions`) est reconnu explicitement pour l’apparence (silhouette, tenue, singularité), les possessions (équipement et objet précieux) et les couples Conviction/Attache. Les anciennes sauvegardes comportant le dossier original récupèrent ces champs lorsqu’ils sont vides, sans écraser les corrections du joueur.

Les champs non reconnus doivent être reportés manuellement. Les problèmes de quota ou d'accès au stockage local sont signalés ; l'export JSON reste disponible. Le JSON ne contient aucun secret de connexion.

## Dossier de personnage

« Télécharger le dossier PDF » produit un document A4 autonome, dans l’esprit graphique de la fiche fournie : papier ivoire, cadre fin, titres serif et rouge sombre. Il comporte six grandes rubriques : identité ; caractéristiques ; sang et pouvoirs ; prédation et ressources ; liens et objectifs ; existence nocturne. Leur longueur s’adapte au contenu, sans couper les textes. Les avantages indiquent leur provenance et les scores comprennent les effets de prédation. Les points à compléter sont regroupés en fin de brouillon. Le PDF officiel n’est ni rempli ni distribué par cette fonction. La sauvegarde JSON et l’impression HTML du récapitulatif restent disponibles.

La génération et la pagination s’exécutent localement dans le navigateur, avec DejaVu Sans et DejaVu Serif embarquées. Un caractère absent des polices donne une erreur explicite. Les deux polices et leurs licences sont incluses dans `./assets/pdf/` ; le code de génération est `./dossier-pdf.js`.

## Droits

Vampire : La Mascarade et les marques associées appartiennent à leurs ayants droit. Assistant personnel non officiel. Illustrations créées pour ce projet.

## Illustration de Se nourrir

`./assets/fond-11.webp` : image générée pour ce projet avec l’outil intégré de génération d’images. Brief : Chicago 1940, ruelle humide derrière un club de jazz, présence vampirique discrète, noir gothique et lueurs rouge sombre, centre peu chargé pour les formulaires, sans texte ni technologie contemporaine.

## Fond commun du site

`./assets/vicky-miroir.webp` reprend l’illustration validée : Vicky humaine étonnée à gauche, son reflet vampirique pâle et confiant dans un miroir à droite, avec une zone sombre centrale. Ce fond couvre toutes les étapes. Le formulaire et les étapes sont centrés ; le cadrage sur grand écran conserve toute la largeur de l’image. Sur mobile, l’illustration apparaît en tête du parcours pour garder les visages visibles et le formulaire lisible. Les anciennes illustrations sont conservées dans les sources, sans alternance automatique.

## Le Masque et la lecture des textes

Une étape distincte avant le récapitulatif décrit la couverture mortelle : situation actuelle, nom, activité, absences, documents, soutiens et failles. Les précisions sont facultatives. L’historique Masque reste acheté parmi les avantages ; cette page n’ajoute aucun point. Les anciens JSON v1 et v2 sont migrés en v3, y compris les indices des étapes, sans perdre `night.mask`. Les nouveaux champs sont dans `mask` et sont repris dans le dossier PDF et le récapitulatif imprimé.

Les Convictions et leurs liens avec les Attaches sont des zones de texte sur toute la largeur. Les champs longs comportent un bouton Agrandir / Réduire et restent redimensionnables à la souris.

## Dossier illustré personnalisé

La dernière étape accepte le portrait déjà créé du joueur (JPEG, PNG ou WebP, 10 Mo maximum). L’image est réduite localement à 1600 pixels maximum et convertie en JPEG pour la sauvegarde. Le portrait et le fond sont enregistrés dans `artwork` dans le JSON, restaurés à l’import et conservés dans la sauvegarde locale si le quota le permet. Aucun fichier n’est envoyé à un serveur par l’import d’image.

Deux prompts autonomes sont proposés : dossier PDF complet ou illustration seule. Ils décrivent explicitement une scène verticale A4, humain étonné à gauche et reflet vampirique confiant dans un miroir à droite, avec les traits du portrait joint et les informations du personnage. Le prompt complet contient les données de création et les valeurs finales calculées. L’utilisateur copie le prompt puis joint séparément son portrait à son IA. Le site ne lance pas la génération IA.

L’illustration obtenue peut être réimportée pour le PDF généré par le site. Elle est placée sur chaque page A4 à 13 % d’opacité, sans étirement ; le texte reste opaque. Sans illustration importée, le PDF utilise le papier ivoire. Vicky reste uniquement le décor horizontal du site. Changer de portrait efface l’ancienne illustration du dossier. Les JSON v1 à v3 sans `artwork` restent compatibles.
