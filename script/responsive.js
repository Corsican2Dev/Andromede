/**
 * Script responsable du comportement responsive du FlipBook
 * Adapte l'affichage et les contrôles selon la taille de l'écran (desktop, tablette, mobile)
 */

document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const flipbook = document.getElementById('flipbook');
    const body = document.body;
    let currentPageIndex = 0;
    let showingBackFace = false; // Pour suivre quelle face est affichée
    let touchStartX = 0;
    let touchEndX = 0;
    let swipeThreshold = 50; // Seuil de distance pour considérer un swipe
    let isResponsiveMode = false;
    let mobileNavControls = null;
    let pageIndicator = null;
    let swipeHint = null;
    let hasInteracted = false; // Pour suivre si l'utilisateur a déjà interagi avec le livre

    // Initialisation
    initialize();

    /**
     * Initialise le FlipBook responsive
     */
    function initialize() {
        checkViewportSize();
        createMobileControls();
        setupEventListeners();
        
        // Vérifier immédiatement l'état initial
        window.setTimeout(() => {
            checkViewportSize();
        }, 100);
    }

    /**
     * Crée les éléments de contrôle pour la navigation mobile
     */
    function createMobileControls() {
        // Vérifier si les contrôles existent déjà pour éviter les duplications
        if (document.querySelector('.mobile-nav-controls')) {
            return;
        }
        
        console.log("Création des contrôles de navigation mobile");
        
        // Créer les contrôles de navigation mobile
        mobileNavControls = document.createElement('div');
        mobileNavControls.className = 'mobile-nav-controls';
        mobileNavControls.style.display = 'none'; // Caché par défaut
        
        const prevBtn = document.createElement('button');
        prevBtn.className = 'mobile-nav-btn prev-btn';
        prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
        prevBtn.setAttribute('aria-label', 'Page précédente');
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            navigatePrevious();
        });
        
        const toggleFaceBtn = document.createElement('button');
        toggleFaceBtn.className = 'mobile-nav-btn toggle-face-btn';
        toggleFaceBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i>';
        toggleFaceBtn.setAttribute('aria-label', 'Retourner la page');
        toggleFaceBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            togglePageFace();
        });
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'mobile-nav-btn next-btn';
        nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
        nextBtn.setAttribute('aria-label', 'Page suivante');
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            navigateNext();
        });

        // Ajouter les boutons au conteneur
        mobileNavControls.appendChild(prevBtn);
        mobileNavControls.appendChild(toggleFaceBtn);
        mobileNavControls.appendChild(nextBtn);
        
        // Ajouter à la page
        document.body.appendChild(mobileNavControls);
        console.log("Contrôles de navigation mobile ajoutés au document");

        // Créer l'indicateur de page s'il n'existe pas déjà
        if (!document.querySelector('.mobile-page-indicator')) {
            pageIndicator = document.createElement('div');
            pageIndicator.className = 'mobile-page-indicator';
            pageIndicator.style.display = 'none'; // Caché par défaut
            document.body.appendChild(pageIndicator);
            console.log("Indicateur de page mobile créé");
        }

        // Créer l'indice de swipe s'il n'existe pas déjà
        if (!document.querySelector('.swipe-hint')) {
            swipeHint = document.createElement('div');
            swipeHint.className = 'swipe-hint';
            swipeHint.innerHTML = '<div class="swipe-arrow">↔️</div>';
            swipeHint.style.display = 'none'; // Caché par défaut
            document.body.appendChild(swipeHint);
            console.log("Indice de swipe créé");
        }
    }

    /**
     * Configure les écouteurs d'événements
     */
    function setupEventListeners() {
        // Redimensionnement de la fenêtre
        window.addEventListener('resize', checkViewportSize);
        
        // Événements tactiles pour le swipe
        flipbook.addEventListener('touchstart', handleTouchStart, {passive: true});
        flipbook.addEventListener('touchend', handleTouchEnd, {passive: true});
    }

    /**
     * Vérifie la taille de la fenêtre et adapte l'affichage en conséquence
     */
    function checkViewportSize() {
        if (window.innerWidth < 1200) {
            // Mode responsive (tablette/mobile)
            if (!isResponsiveMode) {
                enableResponsiveMode();
            }
        } else {
            // Mode desktop
            if (isResponsiveMode) {
                disableResponsiveMode();
            }
        }
    }

    /**
     * Active le mode responsive
     */
    function enableResponsiveMode() {
        isResponsiveMode = true;
        
        // Ajuster les classes du flipbook
        flipbook.classList.add('responsive-mode');
        
        // Masquer les faces arrière au début
        updatePageFaceVisibility();
        
        // S'assurer que les contrôles sont créés
        createMobileControls();
        
        // Afficher les contrôles de navigation mobile
        if (mobileNavControls) {
            mobileNavControls.style.display = 'flex';
            console.log("Affichage des contrôles de navigation mobile");
        } else {
            console.error("Erreur: mobileNavControls est null ou undefined");
        }
        
        // Afficher l'indicateur de page
        if (pageIndicator) {
            pageIndicator.style.display = 'block';
            updatePageIndicator();
        }
        
        // Afficher l'indice de swipe si l'utilisateur n'a pas encore interagi
        if (!hasInteracted && swipeHint) {
            swipeHint.style.display = 'flex';
            // Cacher l'indice après 5 secondes
            setTimeout(() => {
                swipeHint.style.display = 'none';
            }, 5000);
        }
        
        // S'assurer que la barre de progression est correctement configurée
        if (window.bookProgress) {
            // Vérifier si la barre de progression est visible
            const progressContainer = document.querySelector('.book-progress-container');
            const isVisible = !progressContainer.classList.contains('hidden');
            
            if (isVisible) {
                document.body.classList.remove('progress-hidden');
            } else {
                document.body.classList.add('progress-hidden');
            }
            
            // Ajuster la position des contrôles de navigation
            adjustControlsPositions();
        }
        
        console.log('Mode responsive activé');
    }

    /**
     * Désactive le mode responsive
     */
    function disableResponsiveMode() {
        isResponsiveMode = false;
        
        // Retirer les classes du mode responsive
        flipbook.classList.remove('responsive-mode');
        flipbook.classList.remove('showing-back');
        
        // Masquer les contrôles de navigation mobile
        if (mobileNavControls) {
            mobileNavControls.style.display = 'none';
        }
        
        // Masquer l'indicateur de page
        if (pageIndicator) {
            pageIndicator.style.display = 'none';
        }
        
        // Masquer l'indice de swipe
        if (swipeHint) {
            swipeHint.style.display = 'none';
        }
        
        // Réinitialiser la transformation CSS du flipbook pour le mode desktop
        console.log('Mode responsive désactivé, retour au mode desktop');
    }

    /**
     * Gère l'événement tactile de début
     * @param {TouchEvent} event - L'événement tactile
     */
    function handleTouchStart(event) {
        touchStartX = event.changedTouches[0].screenX;
    }

    /**
     * Gère l'événement tactile de fin
     * @param {TouchEvent} event - L'événement tactile
     */
    function handleTouchEnd(event) {
        touchEndX = event.changedTouches[0].screenX;
        handleSwipe();
    }

    /**
     * Traite le swipe tactile
     */
    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        
        if (swipeDistance > swipeThreshold) {
            // Swipe vers la droite -> page précédente
            navigatePrevious();
        } else if (swipeDistance < -swipeThreshold) {
            // Swipe vers la gauche -> page suivante
            navigateNext();
        }
        
        // Marquer que l'utilisateur a interagi
        if (!hasInteracted) {
            hasInteracted = true;
            if (swipeHint) {
                swipeHint.style.display = 'none';
            }
        }
    }

    /**
     * Navigue vers la page précédente
     */
    function navigatePrevious() {
        if (!isResponsiveMode) return;
        
        if (showingBackFace) {
            // Si on affiche le dos, simplement retourner à la face avant
            showingBackFace = false;
            updatePageFaceVisibility();
        } else {
            // Si on est sur la face avant, aller à la page précédente
            if (currentPageIndex > 0) {
                currentPageIndex--;
                showingBackFace = true; // Afficher la face arrière de la page précédente
                updatePage();
            }
        }
        
        // Jouer le son du changement de page
        playPageTurnSound();
    }

    /**
     * Navigue vers la page suivante
     */
    function navigateNext() {
        if (!isResponsiveMode) return;
        
        if (!showingBackFace) {
            // Si on affiche la face avant, passer à la face arrière
            showingBackFace = true;
            updatePageFaceVisibility();
        } else {
            // Si on est sur la face arrière, aller à la page suivante
            if (currentPageIndex < flipbook.querySelectorAll('.page').length - 1) {
                currentPageIndex++;
                showingBackFace = false; // Afficher la face avant de la page suivante
                updatePage();
            }
        }
        
        // Jouer le son du changement de page
        playPageTurnSound();
    }

    /**
     * Bascule entre la face avant et arrière de la page actuelle
     */
    function togglePageFace() {
        if (!isResponsiveMode) return;
        
        showingBackFace = !showingBackFace;
        updatePageFaceVisibility();
        
        // Jouer le son du changement de page
        playPageTurnSound();
    }

    /**
     * Met à jour la visibilité des faces de page
     */
    function updatePageFaceVisibility() {
        if (showingBackFace) {
            flipbook.classList.add('showing-back');
        } else {
            flipbook.classList.remove('showing-back');
        }
        
        updatePageIndicator();
    }

    /**
     * Met à jour la page affichée
     */
    function updatePage() {
        // Mettre à jour la propriété CSS --c du flipbook pour refléter la page actuelle
        flipbook.style.setProperty('--c', currentPageIndex);
        
        // Mettre à jour la visibilité des faces
        updatePageFaceVisibility();
    }

    /**
     * Met à jour l'indicateur de page
     */
    function updatePageIndicator() {
        if (!pageIndicator) return;
        
        const totalPages = flipbook.querySelectorAll('.page').length * 2;
        const currentRealPage = (currentPageIndex * 2) + (showingBackFace ? 1 : 0);
        
        pageIndicator.textContent = `Page ${currentRealPage} / ${totalPages}`;
    }

    /**
     * Joue le son de tournage de page
     */
    function playPageTurnSound() {
        if (window.flipBookInstance && !window.flipBookInstance.isPageTurnSoundMuted) {
            window.flipBookInstance.pageTurnSound.currentTime = 0;
            window.flipBookInstance.pageTurnSound.play().catch(err => {
                console.warn('Impossible de jouer le son de tournage de page:', err);
            });
        }
    }

    /**
     * Ajuste la position des contrôles pour éviter les chevauchements
     */
    function adjustControlsPositions() {
        // Vérifier si la barre de progression est visible
        const progressBar = document.querySelector('.book-progress-container');
        if (progressBar && !progressBar.classList.contains('hidden')) {
            // Si la barre est visible, ajuster la position des contrôles de navigation
            if (mobileNavControls) {
                mobileNavControls.style.bottom = '4rem';
            }
            document.body.classList.remove('progress-hidden');
        } else {
            // Si la barre est masquée, remettre les contrôles de navigation à leur position par défaut
            if (mobileNavControls) {
                mobileNavControls.style.bottom = '1.5rem';
            }
            document.body.classList.add('progress-hidden');
        }
    }
    
    // Observer les changements d'affichage de la barre de progression
    const progressObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                adjustControlsPositions();
            }
        });
    });
    
    const progressContainer = document.querySelector('.book-progress-container');
    if (progressContainer) {
        progressObserver.observe(progressContainer, { attributes: true });
    }

    // Exposer certaines fonctions pour les utiliser depuis d'autres scripts
    window.responsiveFlipbook = {
        previousPage: navigatePrevious,
        nextPage: navigateNext,
        toggleFace: togglePageFace,
        goToPage: function(pageIndex, face = 'front') {
            if (isResponsiveMode) {
                currentPageIndex = Math.min(Math.max(0, pageIndex), flipbook.querySelectorAll('.page').length - 1);
                showingBackFace = (face === 'back');
                updatePage();
            }
        },
        adjustControlsPositions: adjustControlsPositions
    };
    
    // Ajouter un délai pour s'assurer que tous les styles et ressources sont chargés
    setTimeout(function() {
        checkViewportSize();
    }, 500);
});
