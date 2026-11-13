# Site internet iao senn

Site statique construit avec Eleventy. Le contenu se modifie dans l'interface en ligne, à l'adresse `/admin/` du site.

## Modifier le site (usage courant)

1. Ouvrir `https://www.iaosenn.fr/admin/` et se connecter.
2. Choisir une rubrique dans la colonne de gauche : Actualités, Références, Équipe, Métiers et compétences, Nos pôles, Principaux dossiers : définitions, Pages, Réglages du site.
3. Modifier le formulaire, ajouter une photo si besoin, puis cliquer sur **Publier > Publier maintenant**.
4. Le site se reconstruit seul. La modification est en ligne après une à deux minutes.

| Ce que je veux changer | Où |
|---|---|
| Ajouter une actualité | Actualités > Nouveau |
| Ajouter ou modifier une référence, la placer sur la carte | Références (cliquer sur la carte du formulaire pour placer le point) |
| Ajouter ou retirer un type de dossier du filtre | Réglages du site > Types de dossiers |
| Dossiers affichés par commune sur la carte (nom de la commune, position, liste des dossiers) | Réglages du site > Carte : dossiers par commune |
| Photo, fonction, ordre d'une personne | Équipe |
| Pôles : nom, icône, liste des métiers | Nos pôles |
| Rubriques de la page Principaux dossiers et leurs listes | Réglages du site > Principaux dossiers : rubriques |
| Coordonnées de l'agence de Morlaix, ajout d'une agence | Réglages du site > Couleurs, accueil et coordonnées > Autres agences |
| Texte de la présentation, de Nos pôles, des mentions légales, de l'accueil | Pages |
| Couleurs, filigrane, thèmes de l'accueil, adresse, téléphone, LinkedIn | Réglages du site > Couleurs, accueil et coordonnées |
| Entrées du menu | Réglages du site > Menus |

Les photos sont réduites automatiquement à la publication. Photos d'équipe en format portrait (4:5) de préférence.

Ce qui ne se modifie pas depuis l'interface : la disposition des pages (grille de l'équipe, blocs de l'accueil, carte), la carte simplifiée des agences (`src/_includes/carte-simplifiee.njk`), les cours d'eau et les villes de la carte des références (`src/_data/fondcarte.json`). Ces changements passent par les fichiers du dossier `src/_includes/`.

## Organisation des fichiers

- `src/equipe/`, `src/metiers/`, `src/dossiers/`, `src/references/`, `src/actualites/`, `src/pages/` : une fiche par fichier texte.
- `src/poles/` : une fiche par pôle.
- `src/_data/` : réglages, menus, types de dossiers, rubriques de dossiers, dossiers par commune (`dossierscommunes.json`), cours d'eau et villes de la carte (`fondcarte.json`, tracés schématiques).
- `src/medias/` : photos et images ajoutées depuis l'interface.
- `src/_includes/` : gabarits des pages. `src/assets/` : feuille de style, logo, motifs, police, carte.
- `src/admin/config.yml` : configuration de l'interface de modification.

## Mise en ligne (une seule fois)

1. Créer un dépôt GitHub au nom d'iao senn et y déposer ce dossier.
2. Indiquer ce dépôt dans `src/admin/config.yml`, ligne `repo:` [À COMPLÉTER].
3. Relier le dépôt à un hébergeur de sites statiques. Commande de construction : `npx @11ty/eleventy`. Dossier publié : `_site`.
4. Activer la connexion GitHub pour l'interface `/admin/` (fournisseur OAuth : intégré chez Netlify, à ajouter chez les autres hébergeurs) [À vérifier selon l'hébergeur retenu].
5. Créer un compte GitHub pour chaque personne qui modifie le site et lui donner accès au dépôt.
6. Rattacher le nom de domaine. Vérifier avant tout changement DNS que la messagerie contact@iaosenn.fr n'en dépend pas.

## Tester sur un ordinateur (facultatif)

Avec Node.js 20 ou plus : `npm install`, puis `npx @11ty/eleventy --serve` (site sur http://localhost:8080) et, dans un second terminal, `npx decap-server` pour utiliser `/admin/` sans compte.
