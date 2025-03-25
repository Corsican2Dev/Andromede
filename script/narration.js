/**
 * Script de narration automatique pour le FlipBook
 * Ce script permet de lancer la lecture automatique des pages du flipbook
 * avec lecture audio et changement de page automatique
 */

document.addEventListener("DOMContentLoaded", function () {
    // Références des éléments du DOM
    const flipbook = document.getElementById("flipbook");
    const narrationBtn = document.getElementById("narration-btn");
    
    // Variables de contrôle
    let isNarrationActive = false;
    let narrationInterval = null;
    let currentPage = 0;
    let currentFace = "front"; // Pour suivre si nous sommes sur la face "front" ou "back" de la page
    let narrationAudio = new Audio();
    let pageReadingTime = 3000; // Temps par défaut en ms pour lire une page (10s)
    
    // Page de début et de fin (indices de pages)
    const startPage = 1; // Index 1 correspond aux pages 3-4
    const endPage = 8;   // Index 8 correspond à la dernière page
    
    // Mapping des narrations audio pour chaque page et face
    // Pour chaque index de page:
    // front = page paire (4, 6, 8...)
    // back = page impaire (3, 5, 7...)
    const narrationSources = {
        // Pages 3-4 (index 2)
        "2_back": "./assets/audio/narration/page3.mp3",
        "2_front": "./assets/audio/narration/page3bis.mp3",
        
        // Pages 5-6 (index 3)
        "3_back": "./assets/audio/narration/page5.mp3",
        "3_front": "./assets/audio/narration/page6.mp3",
        
        // Pages 7-8 (index 4) 
        "4_back": "./assets/audio/narration/page7.mp3",
        "4_front": "./assets/audio/narration/page8.mp3",
        
        // Pages 9-10 (index 5)
        "5_back": "./assets/audio/narration/page9.mp3",
        "5_front": "./assets/audio/narration/page10.mp3",
        
        // Pages 11-12 (index 6)
        "6_back": "./assets/audio/narration/page11.mp3",
        "6_front": "./assets/audio/narration/page12.mp3",
        
        // Pages 13-14 (index 7)
        "7_back": "./assets/audio/narration/page13.mp3",
        "7_front": "./assets/audio/narration/page14.mp3",
        
        // Pages 15-16 (index 8)
        "8_back": "./assets/audio/narration/page15.mp3",
        "8_front": "./assets/audio/narration/page16.mp3",
        
    };

    /**
     * Active ou désactive la narration automatique
     */
    function toggleNarration() {
        isNarrationActive = !isNarrationActive;
        
        if (isNarrationActive) {
            startNarration();
            narrationBtn.classList.add("active");
            // Ajouter une classe au flipbook pour masquer les textes
            flipbook.classList.add("narration-active");
            console.log("📖 Narration activée");
        } else {
            stopNarration();
            narrationBtn.classList.remove("active");
            // Supprimer la classe pour réafficher les textes
            flipbook.classList.remove("narration-active");
            console.log("🛑 Narration désactivée");
        }
    }

    /**
     * Démarre la narration automatique
     */
    function startNarration() {
        // Obtenir la page actuelle du flipbook
        currentPage = parseInt(getComputedStyle(flipbook).getPropertyValue("--c"), 10);
        
        // Si on est avant la première page narrative ou après la dernière, aller à la première page narrative
        if (currentPage < startPage || currentPage > endPage) {
            currentPage = startPage;
            flipbook.style.setProperty("--c", currentPage);
        }
        
        // On commence par la face back de la page (page 3)
        currentFace = "back";
        
        // Démarrer la narration à partir de la page actuelle
        playCurrentPageNarration();
        
        // Observer les changements de page pour activer la narration
        setupPageTurnObserver();
    }

    /**
     * Met en place un observateur pour détecter les changements de page
     */
    function setupPageTurnObserver() {
        // Observer les changements de style pour détecter les tournages de page
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style' && isNarrationActive) {
                    const newPage = parseInt(getComputedStyle(flipbook).getPropertyValue("--c"), 10);
                    
                    if (newPage !== currentPage) {
                        // La page a changé
                        // Arrêter l'audio en cours s'il y en a un
                        narrationAudio.pause();
                        narrationAudio.currentTime = 0;
                        
                        currentPage = newPage;
                        
                        // Lorsqu'on tourne la page, on commence toujours par la face back (impaire)
                        currentFace = "back";
                        
                        // Petite pause pour laisser le temps à l'animation de page de se terminer
                        setTimeout(() => {
                            playCurrentPageNarration();
                        }, 500);
                    }
                }
            });
        });
        
        observer.observe(flipbook, { attributes: true });
    }

    /**
     * Arrête la narration automatique
     */
    function stopNarration() {
        if (narrationInterval) {
            clearInterval(narrationInterval);
            narrationInterval = null;
        }
        
        narrationAudio.pause();
        narrationAudio.removeEventListener("ended", handleNarrationEnded);
    }

    /**
     * Gère la fin de la narration audio
     */
    function handleNarrationEnded() {
        if (!isNarrationActive) return;
        
        if (currentFace === "back") {
            // Après la narration de la face back (page impaire), passer à la narration front (page paire)
            currentFace = "front";
            
            // Vérifier si nous avons un audio pour la face front
            const audioKey = `${currentPage}_${currentFace}`;
            if (narrationSources[audioKey]) {
                // Enchainement automatique de la narration front après la narration back
                // Sans changer de page physiquement
                playCurrentPageNarration();
            } else {
                // S'il n'y a pas de narration pour la face front, passer à la page suivante
                currentPage++;
                
                if (currentPage > endPage) {
                    finishNarration();
                    return;
                }
                
                // Pour la nouvelle page, on commence par la face back (impaire)
                currentFace = "back";
                moveToNextPage();
            }
        } else {
            // Après la narration front (page paire), passer à la page suivante
            currentPage++;
            
            if (currentPage > endPage) {
                finishNarration();
                return;
            }
            
            // Pour la nouvelle page, on commence toujours par la face back (impaire)
            currentFace = "back";
            moveToNextPage();
        }
    }

    /**
     * Termine la narration et retourne à la couverture
     */
    function finishNarration() {
        setTimeout(() => {
            flipbook.style.setProperty("--c", 0); // Retour à la couverture
            console.log("📚 Fin de la narration - Retour à la couverture");
            
            // Arrêter la musique du flipbook si disponible
            if (window.pageSound) {
                if (!document.getElementById('music-toggle-btn').classList.contains('active')) {
                    window.pageSound.togglePageMusic();
                }
                console.log("🔇 Musique désactivée à la fin de la narration");
            }
            
            // Réafficher les textes à la fin de la narration
            flipbook.classList.remove("narration-active");
        }, 3000);
        
        stopNarration();
        narrationBtn.classList.remove("active");
        isNarrationActive = false;
    }

    /**
     * Joue la narration pour la page et face actuelles
     */
    function playCurrentPageNarration() {
        const audioKey = `${currentPage}_${currentFace}`;
        const pageNumber = currentPage * 2 + (currentFace === "back" ? 1 : 2);
        
        console.log(`🔍 Tentative de lecture pour la page ${pageNumber} (${currentFace}), clé: ${audioKey}`);
        
        // Si nous avons un fichier audio de narration pour cette page et face
        if (narrationSources[audioKey]) {
            narrationAudio.src = narrationSources[audioKey];
            narrationAudio.load();
            
            // Supprimer les écouteurs précédents pour éviter les doublons
            narrationAudio.removeEventListener("ended", handleNarrationEnded);
            narrationAudio.addEventListener("ended", handleNarrationEnded);
            
            narrationAudio.play()
                .then(() => console.log(`✅ Lecture de la narration pour la page ${pageNumber} (${currentFace})`))
                .catch(error => {
                    console.error(`❌ Erreur de lecture de la narration: ${error}`);
                    // En cas d'erreur, simuler la fin de la narration
                    setTimeout(handleNarrationEnded, pageReadingTime);
                });
        } else {
            console.log(`⚠️ Aucune narration trouvée pour la page ${pageNumber} (${currentFace})`);
            // S'il n'y a pas d'audio pour cette page/face, simuler la fin de narration
            setTimeout(handleNarrationEnded, pageReadingTime / 2);
        }
    }

    /**
     * Passe à la page suivante du flipbook
     */
    function moveToNextPage() {
        // Vérifier si nous sommes en mode responsive
        if (window.innerWidth < 1200 && window.responsiveFlipbook) {
            // Utilisez les fonctions du flipbook responsive pour changer de page
            window.responsiveFlipbook.goToPage(currentPage, currentFace);
        } else {
            // Mettre à jour la page du flipbook en mode desktop
            flipbook.style.setProperty("--c", currentPage);
        }
        
        // Attendre que l'animation de transition de page soit terminée
        setTimeout(() => {
            // Jouer la narration de la nouvelle page
            playCurrentPageNarration();
        }, 1000); // Temps estimé pour la transition de page
    }

    // Ajouter l'écouteur d'événement au bouton de narration
    if (narrationBtn) {
        narrationBtn.addEventListener("click", toggleNarration);
    }

    // Exposer les fonctions pour qu'elles soient disponibles globalement
    window.narration = {
        toggle: toggleNarration,
        start: startNarration,
        stop: stopNarration
    };
});
