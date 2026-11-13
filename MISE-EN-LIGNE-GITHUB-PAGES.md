# Mise en ligne de test sur GitHub Pages

Le site se publie seul à chaque modification enregistrée sur GitHub. Adresse de test obtenue : `https://[compte].github.io/[dépôt]/`.

## 1. Créer le dépôt

1. Se connecter sur https://github.com (compte au nom d'iao senn de préférence, pas un compte personnel).
2. Bouton « + » en haut à droite, puis « New repository ».
3. Nom du dépôt : `iaosenn-site` (sans espace ni accent). Cocher **Public** : avec un compte gratuit, GitHub Pages ne publie que les dépôts publics. Ne cocher aucune option d'initialisation.
4. « Create repository ».

## 2. Déposer les fichiers

1. Dans le dépôt vide, cliquer sur le lien « uploading an existing file ».
2. Décompresser l'archive sur l'ordinateur, ouvrir le dossier, tout sélectionner et glisser l'ensemble dans la page GitHub.
3. En bas : « Commit changes ».

Windows et le navigateur ignorent souvent les dossiers dont le nom commence par un point. Vérifier qu'un dossier `.github` apparaît dans la liste des fichiers du dépôt. S'il manque :

1. « Add file », puis « Create new file ».
2. Nom du fichier : taper exactement `.github/workflows/publier.yml` (les barres créent les dossiers).
3. Coller le contenu du fichier `.github/workflows/publier.yml` de l'archive (l'ouvrir avec le Bloc-notes).
4. « Commit changes ».

## 3. Activer GitHub Pages

1. Dans le dépôt : « Settings », puis « Pages » dans le menu de gauche.
2. Rubrique « Build and deployment », champ « Source » : choisir **GitHub Actions**.

## 4. Lancer la publication

1. Onglet « Actions » du dépôt, ligne « Publier le site ».
2. Si la première exécution est en échec (rouge), c'est qu'elle a démarré avant l'étape 3 : bouton « Run workflow » pour la relancer.
3. Au bout de deux minutes environ, la pastille passe au vert. L'adresse du site s'affiche dans « Settings », « Pages ».

## Modifier un contenu pendant le test

Les contenus sont dans `src` (une fiche par fichier : `src/equipe`, `src/references`, `src/actualites`, etc.). Ouvrir le fichier sur GitHub, cliquer sur le crayon, modifier, puis « Commit changes ». Le site se republie seul.

Pour ajouter une photo : ouvrir `src/medias`, « Add file », « Upload files ».

L'interface `/admin/` ne fonctionne pas sur GitHub Pages : elle a besoin d'un service de connexion que GitHub Pages ne fournit pas. Elle sera rétablie lors du passage sur IONOS.

## Passage sur IONOS (plus tard)

La version de test ajoute le nom du dépôt aux adresses. Pour IONOS, construire sans la variable `PREFIXE` (`npx @11ty/eleventy`) : le site est alors généré pour la racine du domaine.
