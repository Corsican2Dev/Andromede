// Ajouter au début du fichier

// Récupérer l'ID du livre depuis l'URL
function getBookIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Fonction à exécuter au chargement pour initialiser le livre approprié
document.addEventListener('DOMContentLoaded', function() {
    const bookId = getBookIdFromUrl();
    if (bookId) {
        console.log(`Chargement du livre ID: ${bookId} en mode immersion`);
        // Charger les données du livre spécifique si nécessaire
        // loadBookData(bookId);
    }
    
    // Le reste de votre code d'initialisation existant...
});

// Classe FlipBook pour gérer les interactions avec le livre interactif
class FlipBook {
    constructor(elBook) {
        this.elBook = elBook;
        this.pageTurnSound = new Audio('assets/audio/page-turn.mp3'); // Son de changement de page
        this.isPageTurnSoundMuted = false; // Indicateur pour savoir si le son de changement de page est coupé
        this.init();
        
        // Rendre l'instance accessible globalement pour la version responsive
        window.flipBookInstance = this;
    }

    // Initialisation du FlipBook
    init() {
        this.elBook.style.setProperty("--c", 0); // Définir la page actuelle à la première page
        this.elBook.querySelectorAll(".page").forEach((page, i) => {
            page.style.setProperty("--i", i);
            page.addEventListener("click", (evt) => this.handlePageClick(evt, i));
        });
    }

    // Gestion du clic sur une page
    handlePageClick(evt, i) {
        // Vérifier si on est en mode mobile ou tablette (responsive)
        if (window.innerWidth < 1200) {
            // En mode responsive, la navigation est gérée par le script responsive-flipbook.js
            return;
        }
        
        // Vérifier si le clic est à l'intérieur du menu déroulant, des boutons hamburger ou du bouton de musique
        if (evt.target.closest('.dropdown') || evt.target.closest('.dropdown-menu') || evt.target.closest('#hamburgerButtonRight') || evt.target.closest('#dropdownMenuButtonLeft') || evt.target.closest('.music-button')) {
            return; // Ne rien faire si le clic est à l'intérieur du menu déroulant, des boutons hamburger ou du bouton de musique
        }
        const c = !!evt.target.closest(".back") ? i : i + 1;
        this.elBook.style.setProperty("--c", c);
        if (!this.isPageTurnSoundMuted) {
            this.pageTurnSound.play(); // Jouer le son de changement de page
        }
    }

    // Basculer le son de changement de page
    togglePageTurnSound() {
        this.isPageTurnSoundMuted = !this.isPageTurnSoundMuted;
    }

    // Nouvelle méthode pour obtenir le statut du son
    getPageTurnSoundStatus() {
        return this.isPageTurnSoundMuted ? 'off' : 'on';
    }
}
// Path: FlipBook_interactif/script/index.js
// Classe BackgroundManager pour gérer les arrière-plans et les audios
class BackgroundManager {
    constructor() {
        this.backgrounds = {
            ambiance: {
                image: "./assets/img/default_background.png", // Vérifiez ce chemin
                audio: "./assets/audio/ambiance.mp3",
                explanationImage: "./assets/img/person_explaining.png",
                explanationAudio: "./assets/audio/ambiance_explanation.mp3",
                hotspots: [
                    {
                        id: 'hotspot1',
                        x: 38.4, // % from left
                        y: 39.95, // % from top
                        width: 4, // % of container width
                        height: 8, // % of container height
                        action: 'openModal',
                        target: 'videoModal',
                        tooltip: 'Carte galactique'
                    },
                    {
                        id: 'hotspot2',
                        x: 55.5,
                        y: 38,
                        width: 3,
                        height: 6,
                        action: 'openPhotoGallery',
                        target: './vue/photoGallery.html',
                        tooltip: 'Galerie photo'
                    }
                ]
            },
            forest: {
                image: "./assets/img/background_forest_clearing.png", // Vérifiez ce chemin
                audio: "./assets/audio/forest.mp3"
            },
            mountain: {
                image: "./assets/img/background_mountain.png", // Vérifiez ce chemin
                audio: "./assets/audio/mountain.mp3"
            },
            sea: {
                image: "./assets/img/background_sea.png", // Vérifiez ce chemin
                audio: "./assets/audio/sea.mp3"
            },
            city: {
                image: "./assets/img/background_city.png", // Vérifiez ce chemin
                audio: "./assets/audio/city.mp3"
            }
        };
        this.currentAudio = null;
        this.explanationAudio = null;
        this.activeHotspots = [];
        this.hotspotsContainer = null;
    }

    setBackgroundAndAudio(bgKey, playExplanationAudio = false) {
        if (this.backgrounds[bgKey]) {
            const { image, audio, explanationImage, explanationAudio: explanationAudioSrc, hotspots } = this.backgrounds[bgKey];
            console.log(`Setting background image to: ${image}`); // Debug message
            document.body.style.backgroundImage = `url(${image})`;

            // Remove existing hotspots
            this.clearHotspots();
            
            // Add new hotspots if available
            if (hotspots && hotspots.length > 0) {
                this.addHotspots(hotspots);
            }

            if (this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
            }

            this.currentAudio = new Audio(audio);
            this.currentAudio.loop = true;
            this.currentAudio.volume = document.getElementById('volumeControl').value; // Set volume to current value of volume control
            this.currentAudio.play();

            // Handle explanation image and audio
            const explanationElement = document.getElementById('explanation');
            if (explanationImage && explanationAudioSrc) {
                explanationElement.style.display = 'block';
                explanationElement.src = explanationImage;

                if (this.explanationAudio) {
                    this.explanationAudio.pause();
                    this.explanationAudio.currentTime = 0;
                }

                if (playExplanationAudio) {
                    this.explanationAudio = new Audio(explanationAudioSrc);
                    this.explanationAudio.play();
                    this.explanationAudio.addEventListener('ended', () => {
                        this.explanationAudio.pause();
                        this.explanationAudio.currentTime = 0;
                    });
                }

                // Add click event to toggle explanation audio
                explanationElement.onclick = () => {
                    if (this.explanationAudio) {
                        if (this.explanationAudio.paused) {
                            this.explanationAudio.play();
                        } else {
                            this.explanationAudio.pause();
                        }
                    }
                };
            } else {
                explanationElement.style.display = 'none';
                if (this.explanationAudio) {
                    this.explanationAudio.pause();
                    this.explanationAudio.currentTime = 0;
                }
            }
        } else {
            console.log(`No background found for key: ${bgKey}`); // Debug message
        }
    }

    // Nouvelle méthode pour ajouter les hotspots sur le background
    addHotspots(hotspots) {
        // Créer un conteneur pour les hotspots s'il n'existe pas déjà
        if (!this.hotspotsContainer) {
            this.hotspotsContainer = document.createElement('div');
            this.hotspotsContainer.className = 'background-map-container';
            document.body.appendChild(this.hotspotsContainer);
        }

        hotspots.forEach(hotspot => {
            const hotspotElement = document.createElement('div');
            hotspotElement.id = hotspot.id;
            hotspotElement.className = 'map-hotspot';
            hotspotElement.setAttribute('data-action', hotspot.action);
            hotspotElement.setAttribute('data-target', hotspot.target || '');
            hotspotElement.setAttribute('data-audio-src', hotspot.audioSrc || '');
            hotspotElement.style.left = `${hotspot.x}%`;
            hotspotElement.style.top = `${hotspot.y}%`;
            hotspotElement.style.width = `${hotspot.width}%`;
            hotspotElement.style.height = `${hotspot.height}%`;
            
            // Ajouter un tooltip Bootstrap si défini
            if (hotspot.tooltip) {
                hotspotElement.setAttribute('data-bs-toggle', 'tooltip');
                hotspotElement.setAttribute('data-bs-placement', 'top');
                hotspotElement.setAttribute('title', hotspot.tooltip);
            }
            
            // Gérer les actions au clic
            hotspotElement.addEventListener('click', () => this.handleHotspotClick(hotspot));
            
            this.hotspotsContainer.appendChild(hotspotElement);
            this.activeHotspots.push(hotspotElement);
        });
        
        // Réinitialiser les tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(tooltipTriggerEl => {
            new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Méthode pour nettoyer les hotspots existants
    clearHotspots() {
        if (this.hotspotsContainer) {
            // Supprimer tous les tooltips Bootstrap associés
            this.activeHotspots.forEach(hotspot => {
                const tooltip = bootstrap.Tooltip.getInstance(hotspot);
                if (tooltip) {
                    tooltip.dispose();
                }
            });
            
            // Vider le conteneur
            this.hotspotsContainer.innerHTML = '';
            this.activeHotspots = [];
        }
    }
    
    // Gérer les actions des hotspots
    handleHotspotClick(hotspot) {
        console.log(`Hotspot ${hotspot.id} clicked with action: ${hotspot.action}`);
        
        switch (hotspot.action) {
            case 'openModal':
                if (hotspot.target) {
                    const modal = new bootstrap.Modal(document.getElementById(hotspot.target));
                    modal.show();
                }
                break;
                
            case 'playAudio':
                if (hotspot.audioSrc) {
                    const audio = new Audio(hotspot.audioSrc);
                    audio.volume = document.getElementById('volumeControl').value;
                    audio.play();
                }
                break;
                
            case 'navigateToPage':
                if (hotspot.pageNumber && window.flipBookInstance) {
                    // Naviguer vers une page spécifique
                    const pageIndex = parseInt(hotspot.pageNumber);
                    const book = document.querySelector('.book');
                    book.style.setProperty("--c", pageIndex);
                }
                break;
                
            case 'openPhotoGallery':
                if (hotspot.target) {
                    // Ouvrir la page de la galerie photo dans une nouvelle fenêtre/onglet
                    window.open(hotspot.target, '_blank');
                } else {
                    // URL par défaut si non spécifiée
                    window.open('vue/photoGallery.html', '_blank');
                }
                break;
                
            default:
                console.log(`Action ${hotspot.action} non implémentée`);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll(".book").forEach(elBook => new FlipBook(elBook));

    const backgroundManager = new BackgroundManager();

    document.getElementById('backgroundSelect').addEventListener('change', function() {
        const bgKey = this.value;
        console.log(`Selected background: ${bgKey}`); // Debug message
        backgroundManager.setBackgroundAndAudio(bgKey, bgKey === 'ambiance');
    });

    document.getElementById('muteButton').addEventListener('click', function() {
        if (backgroundManager.currentAudio) {
            if (backgroundManager.currentAudio.muted) {
                backgroundManager.currentAudio.muted = false;
                this.textContent = '🔊';
            } else {
                backgroundManager.currentAudio.muted = true;
                this.textContent = '🔇';
            }
        }
    });

    document.getElementById('volumeControl').addEventListener('input', function() {
        if (backgroundManager.currentAudio) {
            backgroundManager.currentAudio.volume = this.value;
        }
    });

    // Set default background and audio on page load
    window.addEventListener('load', () => {
        console.log('Setting default background to ambiance'); // Debug message
        backgroundManager.setBackgroundAndAudio('ambiance', true); // Set to 'ambiance' by default and play explanation audio
    });

    // Gestion de la vidéo du modal synopsis
    const synopsisModal = document.getElementById('synopsisModal');
    const synopsisVideo = document.getElementById('synopsisVideo');
    if (synopsisModal && synopsisVideo) {
        synopsisModal.addEventListener('shown.bs.modal', () => {
            synopsisVideo.play().catch(error => {
                console.error('Erreur lors de la lecture de la vidéo:', error);
            });
        });

        synopsisModal.addEventListener('hidden.bs.modal', () => {
            synopsisVideo.pause();
            synopsisVideo.currentTime = 0;
        });
    }

    // Gestion de la vidéo du modal hamburger
    const videoModal = document.getElementById('videoModal');
    const hamburgerVideo = document.getElementById('hamburgerVideo');
    if (videoModal && hamburgerVideo) {
        videoModal.addEventListener('shown.bs.modal', () => {
            hamburgerVideo.play().catch(error => {
                console.error('Erreur lors de la lecture de la vidéo:', error);
            });
        });

        videoModal.addEventListener('hidden.bs.modal', () => {
            hamburgerVideo.pause();
            hamburgerVideo.currentTime = 0;
        });
    }

    // Gestion des boutons de vue
    const flipbook = document.getElementById('flipbook');
    const toggleViewButton = document.getElementById('toggleViewButton');
    
    if (flipbook && toggleViewButton) {
        let is3DView = false; // Par défaut, on est en vue de dessus
        
        toggleViewButton.addEventListener('click', function() {
            if (is3DView) {
                // Passer à la vue de dessus
                flipbook.classList.remove('flipbook-3d');
                flipbook.classList.add('flipbook-top');
                toggleViewButton.textContent = 'Vue 3D';
            } else {
                // Passer à la vue 3D
                flipbook.classList.remove('flipbook-top');
                flipbook.classList.add('flipbook-3d');
                toggleViewButton.textContent = 'Vue de dessus';
            }
            is3DView = !is3DView; // Inverser l'état
        });
    } else {
        console.error('Flipbook ou bouton de vue non trouvé');
    }

    // Gestion du bouton plein écran
    const fullscreenButton = document.getElementById('fullscreenButton');
    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.error(`Erreur lors de l'activation du mode plein écran: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        });
    } else {
        console.error('Bouton plein écran non trouvé');
    }

    // Gestion du bouton de zoom - ajuster pour le responsive
    const zoomButton = document.getElementById('zoomButton');
    if (zoomButton && flipbook) {
        zoomButton.addEventListener('click', () => {
            if (window.innerWidth < 1200) {
                // Sur mobile/tablette, on n'active pas le zoom standard
                alert('Le zoom n\'est pas disponible en mode responsive. Le contenu est déjà optimisé pour votre écran.');
                return;
            }
            flipbook.classList.toggle('book-zoomed');
        });
    } else {
        console.error('Bouton de zoom ou flipbook non trouvé');
    }

    // Explanation video modal handling
    const explanationElement = document.getElementById('explanation');
    const explanationVideoModal = new bootstrap.Modal(document.getElementById('explanationVideoModal'));
    const explanationVideo = document.getElementById('explanationVideo');

    explanationElement.addEventListener('click', () => {
        explanationVideoModal.show();
        explanationVideo.play().catch(error => console.error('Error playing explanation video:', error));
    });

    explanationVideo.addEventListener('ended', () => {
        explanationVideoModal.hide();
    });

    explanationVideoModal._element.addEventListener('hidden.bs.modal', () => {
        explanationVideo.pause();
        explanationVideo.currentTime = 0;
    });
});

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
});