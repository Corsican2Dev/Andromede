document.addEventListener("DOMContentLoaded", function () {
    const flipbook = document.getElementById("flipbook");
    if (!flipbook) {
        console.error("❌ L'élément flipbook n'a pas été trouvé.");
        return;
    }
    let currentPage = 0;
    let currentFace = "front"; // Pour suivre si nous sommes sur la face "front" ou "back" de la page
    let audio = new Audio();
    let isMusicMuted = false;
    let musicVolume = 0.3; // Définir le volume par défaut à 30%

    // Liste des sons par page et face, suivant la même logique que narration.js
    // Pour chaque index de page:
    // front = page paire (4, 6, 8...)
    // back = page impaire (3, 5, 7...)
    const pageSounds = {
        // Pages 2 (index 1)
        "1_front": "./assets/audio/page2.mp3",
        "1_back": "./assets/audio/page1.mp3",

        // Pages 3-4 (index 2)
        "2_back": "./assets/audio/page3.mp3",
        "2_front": "./assets/audio/page6.mp3",
        
        // Pages 5-6 (index 3)
        "3_back": "./assets/audio/page5.mp3",
        "3_front": "./assets/audio/page8.mp3",
        
        // Pages 7-8 (index 4)
        "4_back": "./assets/audio/page7.mp3",
        "4_front": "./assets/audio/page10.mp3",
        
        // Pages 9-10 (index 5)
        "5_back": "./assets/audio/page9.mp3",
        "5_front": "./assets/audio/page12.mp3",
        
        // Pages 11-12 (index 6)
        "6_back": "./assets/audio/page11.mp3",
        "6_front": "./assets/audio/page14.mp3",
        
        // Pages 13-14 (index 7)
        "7_back": "./assets/audio/page13.mp3",
        "7_front": "./assets/audio/page16.mp3",
        
        // Pages 15-16 (index 8)
        "8_back": "./assets/audio/page15.mp3",
        "8_front": "./assets/audio/page16.mp3"
    };

    /**
     * Joue le son associé à la page et face actuelles
     * @param {number} pageIndex - L'index de la page (--c)
     * @param {string} face - La face de la page ('front' ou 'back')
     */
    function playPageSound(pageIndex, face) {
        if (isMusicMuted) return; // Ne pas jouer de son si la musique est coupée
        
        const audioKey = `${pageIndex}_${face}`;
        const pageNumber = pageIndex * 2 + (face === "back" ? 1 : 2);
        
        console.log(`🔍 Tentative de lecture audio pour la page ${pageNumber} (${face}), clé: ${audioKey}`);
        
        if (pageSounds[audioKey]) {
            audio.pause(); // Arrête l'audio en cours
            audio.src = pageSounds[audioKey]; // Définit la source
            audio.volume = musicVolume; // Appliquer le volume actuel
            audio.load(); // Recharge le fichier
            audio.play()
                .then(() => console.log(`✅ Lecture du son: ${pageSounds[audioKey]} (Page ${pageNumber}, ${face}) - Volume: ${audio.volume * 100}%`))
                .catch(error => console.error("❌ Erreur de lecture audio:", error));
        } else {
            console.log(`⚠️ Aucun son trouvé pour la page ${pageNumber} (${face})`);
        }
    }

    /**
     * Détecte lorsque la page du flipbook a tourné et joue un son pour la nouvelle page.
     */
    function detectPageTurn() {
        const newPage = parseInt(getComputedStyle(flipbook).getPropertyValue("--c"), 10);
        
        if (newPage !== currentPage) {
            currentPage = newPage;
            
            // Lorsqu'on tourne la page, on commence toujours par la face back (impaire)
            currentFace = "back";
            
            console.log(`Page tournée vers: ${currentPage}, face: ${currentFace}`);
            
            // Petite pause pour laisser le temps à l'animation de page de se terminer
            setTimeout(() => {
                playPageSound(currentPage, currentFace);
            }, 500);
        }
    }

    // Mettre en place un observateur pour détecter les changements de page
    function setupPageTurnObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style') {
                    detectPageTurn();
                }
            });
        });
        
        observer.observe(flipbook, { attributes: true });

        // Écouter aussi les événements spécifiques au mode responsive
        document.addEventListener('flipbookPageChanged', function(e) {
            if (window.innerWidth <= 1200) {  // Mode tablette/mobile
                const pageIndex = e.detail.pageIndex;
                const face = e.detail.face || 'front';
                playPageSound(pageIndex, face);
            }
        });
    }

    // Installer l'observateur de changement de page
    setupPageTurnObserver();

    // Amélioration de la gestion des événements de clic pour les pages 'front'
    flipbook.querySelectorAll(".page.front").forEach(page => {
        page.addEventListener("click", () => {
            const pageIndex = parseInt(page.style.getPropertyValue("--i"), 10) + 1;
            console.log(`Clic sur page front: ${pageIndex}`);
            currentPage = pageIndex;
            currentFace = "front";
            playPageSound(pageIndex, "front");
        });
    });

    // Amélioration de la gestion des événements de clic pour les pages 'back'
    flipbook.querySelectorAll(".page.back").forEach(page => {
        page.addEventListener("click", () => {
            const pageIndex = parseInt(page.style.getPropertyValue("--i"), 10) + 1;
            console.log(`Clic sur page back: ${pageIndex}`);
            currentPage = pageIndex;
            currentFace = "back";
            playPageSound(pageIndex, "back");
        });
    });

    /**
     * Active ou désactive la musique de fond pour la page.
     * 
     * Cette fonction coupe ou réactive la musique de fond en basculant la variable `isMusicMuted`.
     * Lorsque la musique est coupée, elle met en pause l'audio et ajoute une décoration de texte barré
     * au bouton de bascule de la musique. Lorsque la musique est réactivée, elle supprime la décoration de texte barré.
     * 
     * @global {boolean} isMusicMuted - Indique si la musique est actuellement coupée.
     * @global {HTMLAudioElement} audio - L'élément audio qui joue la musique de fond.
     */
    function togglePageMusic() {
        isMusicMuted = !isMusicMuted;
        if (isMusicMuted) {
            audio.pause();
            document.getElementById('music-toggle-btn').classList.add('active');
            console.log("🔇 Musique désactivée");
        } else {
            document.getElementById('music-toggle-btn').classList.remove('active');
            console.log("🔊 Musique activée");
        }
    }

    // Gestionnaire pour le contrôle du volume
    function setupVolumeControl() {
        // Références aux éléments DOM
        const volumeBtn = document.getElementById('page-volume-btn');
        const volumeControl = document.getElementById('page-music-volume');
        const volumeLabel = document.querySelector('.volume-label');
        const volumeContainer = document.querySelector('.volume-control-container');
        
        // Initialiser la valeur du volume
        volumeControl.value = musicVolume;
        updateVolumeLabel();
        
        // Configuration du tooltip Bootstrap avec contenu personnalisé
        const tooltip = new bootstrap.Tooltip(volumeBtn, {
            html: true,
            title: function() {
                // Déplacer le contrôle de volume dans le tooltip
                volumeContainer.classList.remove('d-none');
                return volumeContainer;
            }
        });
        
        // Gérer le changement de volume
        volumeControl.addEventListener('input', function() {
            musicVolume = parseFloat(this.value);
            audio.volume = musicVolume;
            updateVolumeLabel();
            console.log(`Volume défini à ${musicVolume * 100}%`);
        });
        
        // Mettre à jour l'étiquette du volume
        function updateVolumeLabel() {
            volumeLabel.textContent = `${Math.round(musicVolume * 100)}%`;
            
            // Mettre à jour l'icône du bouton en fonction du volume
            const volumeIcon = volumeBtn.querySelector('i');
            if (musicVolume === 0) {
                volumeIcon.className = 'bi bi-volume-mute';
            } else if (musicVolume <= 0.5) {
                volumeIcon.className = 'bi bi-volume-down';
            } else {
                volumeIcon.className = 'bi bi-volume-up';
            }
        }
        
        // Lors de la fermeture du tooltip, remettre le contrôle de volume dans son conteneur d'origine
        volumeBtn.addEventListener('hidden.bs.tooltip', function () {
            volumeContainer.classList.add('d-none');
            document.body.appendChild(volumeContainer);
        });
    }

    // Ajouter une fonction pour trouver l'élément de page avec circle-number 1
    function findCircleNumberOnePage() {
        const circles = document.querySelectorAll('.circle-number');
        for (let circle of circles) {
            if (circle.textContent.trim() === '1') {
                // Trouver la page qui contient ce cercle
                let pageElement = circle.closest('.page');
                if (pageElement) {
                    // Déterminer l'index de cette page dans le flipbook
                    const pages = Array.from(document.querySelectorAll('#flipbook .page'));
                    const pageIndex = pages.indexOf(pageElement);
                    
                    // Déterminer si le cercle est sur le front ou le back de la page
                    const isFront = circle.closest('.front') !== null;
                    const isBack = circle.closest('.back') !== null;
                    
                    const face = isFront ? 'front' : (isBack ? 'back' : 'unknown');
                    
                    console.log(`Cercle numéro 1 trouvé sur la page d'index ${pageIndex}, face: ${face}`);
                    return { pageIndex, face };
                }
            }
        }
        return null;
    }

    // Fonction initiale pour jouer la musique à partir du cercle numéro 1 en mode mobile
    function initMobileMusicFromCircleOne() {
        if (window.innerWidth <= 1200) {  // Mode tablette/mobile
            const circleOne = findCircleNumberOnePage();
            if (circleOne) {
                playPageSound(circleOne.pageIndex, circleOne.face);
                console.log(`Musique initialisée à partir du cercle numéro 1: page ${circleOne.pageIndex}, face ${circleOne.face}`);
            } else {
                console.log("Cercle numéro 1 non trouvé, musique non initialisée automatiquement");
            }
        }
    }

    // Ajouter un événement de clic pour les boutons de musique
    document.getElementById('music-toggle-btn').addEventListener('click', togglePageMusic);
    
    if (document.getElementById('musicToggleButton')) {
        document.getElementById('musicToggleButton').addEventListener('click', togglePageMusic);
    }

    // Configurer le contrôle de volume
    if (document.getElementById('page-volume-btn')) {
        setupVolumeControl();
    }

    /**
     * Gère les clics sur les boutons de musique dans le contenu des pages
     * 
     * @param {Event} event - L'événement de clic
     * @param {number} pageNumber - Le numéro de page associé au bouton (numéro réel de la page, pas l'index)
     * @param {string} face - La face de la page ('front' ou 'back')
     */
    function handleMusicButtonClick(event, pageNumber, face = "front") {
        event.stopPropagation(); // Empêche le déclenchement du clic sur la page
        
        // Convertir le numéro de page réel (1-16) en index de page pour le flipbook (1-8)
        let pageIndex;
        
        // Si une page frontale (paire), calculer l'index correctement
        if (face === "front" || pageNumber % 2 === 0) {
            pageIndex = Math.ceil(pageNumber / 2);
            face = "front";
        } 
        // Si une page dorsale (impaire)
        else {
            pageIndex = Math.floor(pageNumber / 2) + 1;
            face = "back";
        }
        
        console.log(`Bouton de musique cliqué pour la page ${pageNumber} => Convertie en pageIndex ${pageIndex} (${face})`);
        playPageSound(pageIndex, face);
    }
    
    // Attacher les gestionnaires d'événements aux boutons de musique
    document.querySelectorAll('.music-button').forEach(button => {
        const pageNumber = parseInt(button.getAttribute('data-page'), 10);
        const face = button.getAttribute('data-face');
        
        if (pageNumber) {
            button.addEventListener('click', (event) => handleMusicButtonClick(event, pageNumber, face));
            console.log(`Bouton musique configuré: page ${pageNumber}, face ${face || 'automatique'}`);
        }
    });

    // Teste si le premier fichier se charge correctement
    setTimeout(() => {
        let testAudio = new Audio(pageSounds["1_back"] || "./assets/audio/page1.mp3");
        testAudio.play()
            .then(() => console.log("✅ Le fichier audio de test fonctionne !"))
            .catch(error => console.error("❌ Impossible de jouer le fichier audio de test:", error));
    }, 3000);

    // Exposer les fonctions pour qu'elles soient disponibles globalement
    window.pageSound = {
        togglePageMusic,
        playSound: function(pageIndex, face) {
            playPageSound(pageIndex, face || currentFace);
        },
        setVolume: function(volume) {
            musicVolume = Math.min(Math.max(volume, 0), 1); // Garantit que le volume est entre 0 et 1
            audio.volume = musicVolume;
            if (document.getElementById('page-music-volume')) {
                document.getElementById('page-music-volume').value = musicVolume;
            }
            return musicVolume;
        },
        getVolume: function() {
            return musicVolume;
        },
        findCircleNumberOnePage,
        initMobileMusicFromCircleOne
    };

    // Écouter les événements du mode responsive
    document.addEventListener('responsiveModeEnabled', function() {
        console.log("Mode responsive activé, initialisation de la musique...");
        // Délai court pour laisser le temps au DOM de se mettre à jour
        setTimeout(initMobileMusicFromCircleOne, 300);
    });

    // Initialiser la musique une fois que tout est chargé, mais seulement en mode responsive
    setTimeout(function() {
        if (window.innerWidth <= 1200) {
            initMobileMusicFromCircleOne();
        }
    }, 1000);
});