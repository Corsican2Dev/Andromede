# FlipBook Interactif

Ce projet est un flipbook interactif qui permet de visualiser des pages avec des vidéos et du texte. Il inclut des fonctionnalités telles que le zoom, le changement de vue, le plein écran, et la sélection de fonds d'écran et d'audio.

![FlipBook](./flip-book-roko.gif)

## Fonctionnalités

- **Vue de dessus** : Affiche le flipbook en vue de dessus.
- **Vue 3D** : Affiche le flipbook en vue 3D.
- **Plein écran** : Affiche le flipbook en mode plein écran.
- **Zoom** : Agrandit le flipbook de 80% et le centre verticalement dans la fenêtre.
- **Couper le son de la page** : Active ou désactive le son de changement de page.
- **Sélection de fond d'écran et d'audio** : Permet de choisir différents fonds d'écran et audios d'ambiance.
- **Synopsis** : Affiche une vidéo de synopsis dans un modal.
- **Carte galactique** : Affiche une vidéo de carte galactique dans un modal.

## Prérequis

- Navigateur web moderne (Chrome, Firefox, Edge, Safari) à jour
- Connexion internet pour charger les dépendances externes
- Résolution d'écran minimale recommandée : 1280x720

## Installation

1. Clonez le dépôt :
    ```bash
    git clone https://github.com/votre-utilisateur/flipbook-interactif.git
    ```
    
2. Accédez au répertoire du projet :
    ```bash
    cd flipbook-interactif
    ```

3. Vérifiez que la structure de dossiers suivante est présente :
    ```
    flipbook-interactif/
    ├── assets/
    │   ├── img/
    │   ├── audio/
    │   └── videos/
    ├── css/
    ├── js/
    └── index.html
    ```

4. Assurez-vous que les fichiers d'image suivants existent dans le répertoire `assets/img` :
    - `default_background.png`
    - `background_forest_clearing.png`
    - `background_mountain.png`
    - `background_sea.png`
    - `background_city.png`

5. Ouvrez le fichier `index.html` dans votre navigateur ou utilisez un serveur local comme Live Server pour Visual Studio Code.

## Utilisation

- Utilisez les boutons en haut de la page pour basculer entre les vues, activer le plein écran, zoomer sur le flipbook, et couper le son de la page.
- Utilisez le sélecteur de fond d'écran pour changer le fond d'écran et l'audio d'ambiance.
- Cliquez sur le bouton "Synopsis" pour afficher la vidéo de synopsis.
- Cliquez sur le bouton de menu hamburger à droite pour afficher la vidéo de carte galactique.
- Naviguez dans le flipbook en cliquant sur les coins des pages ou en utilisant les flèches du clavier.

## Dépendances

- [Bootstrap 5.3.3](https://getbootstrap.com/)
- [JavaScript](https://developer.mozilla.org/fr/docs/Web/JavaScript)

## Résolution des problèmes courants

- Si les vidéos ne se chargent pas, vérifiez que les formats sont compatibles avec votre navigateur (MP4, WebM).
- Pour les problèmes d'affichage, essayez d'actualiser la page ou de vider le cache du navigateur.
- Si les sons ne fonctionnent pas, vérifiez les paramètres audio de votre navigateur.

## Contribuer

Les contributions sont les bienvenues ! Veuillez soumettre une pull request ou ouvrir une issue pour discuter des changements que vous souhaitez apporter.

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.