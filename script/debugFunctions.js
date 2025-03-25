/**
 * Fonctions de débogage pour le FlipBook responsive
 * Ces fonctions permettent de diagnostiquer et de résoudre les problèmes courants
 */

// Fonction pour forcer la création des contrôles de navigation
function forceCreateMobileControls() {
    if (window.responsiveFlipbook) {
        console.log("Force la création des contrôles de navigation mobile");
        
        // Créer manuellement les contrôles de navigation
        const existingControls = document.querySelector('.mobile-nav-controls');
        if (existingControls) {
            existingControls.remove();
        }
        
        const mobileNavControls = document.createElement('div');
        mobileNavControls.className = 'mobile-nav-controls';
        mobileNavControls.style.display = 'flex';
        
        const prevBtn = document.createElement('button');
        prevBtn.className = 'mobile-nav-btn prev-btn';
        prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
        prevBtn.setAttribute('aria-label', 'Page précédente');
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.responsiveFlipbook.previousPage();
        });
        
        const toggleFaceBtn = document.createElement('button');
        toggleFaceBtn.className = 'mobile-nav-btn toggle-face-btn';
        toggleFaceBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i>';
        toggleFaceBtn.setAttribute('aria-label', 'Retourner la page');
        toggleFaceBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.responsiveFlipbook.toggleFace();
        });
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'mobile-nav-btn next-btn';
        nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
        nextBtn.setAttribute('aria-label', 'Page suivante');
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.responsiveFlipbook.nextPage();
        });

        mobileNavControls.appendChild(prevBtn);
        mobileNavControls.appendChild(toggleFaceBtn);
        mobileNavControls.appendChild(nextBtn);
        
        document.body.appendChild(mobileNavControls);
        console.log("Nouveaux contrôles de navigation mobile ajoutés");
        
        return "Contrôles de navigation créés avec succès";
    } else {
        console.error("Le module responsiveFlipbook n'est pas disponible");
        return "Erreur: responsiveFlipbook non disponible";
    }
}

// Fonction pour afficher/masquer tous les contrôles
function toggleControlsVisibility() {
    const controls = document.querySelector('.mobile-nav-controls');
    if (controls) {
        const currentDisplay = window.getComputedStyle(controls).display;
        controls.style.display = currentDisplay === 'none' ? 'flex' : 'none';
        return `Contrôles maintenant ${currentDisplay === 'none' ? 'visibles' : 'cachés'}`;
    } else {
        return "Contrôles non trouvés";
    }
}

// Fonction pour vérifier l'état du mode responsive
function checkResponsiveStatus() {
    const flipbook = document.getElementById('flipbook');
    const status = {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        isResponsiveMode: flipbook.classList.contains('responsive-mode'),
        controlsExist: !!document.querySelector('.mobile-nav-controls'),
        controlsVisible: document.querySelector('.mobile-nav-controls')?.style.display === 'flex',
        bootstrapLoaded: typeof bootstrap !== 'undefined',
        iconsLoaded: !!document.querySelector('.bi')
    };
    
    console.table(status);
    return status;
}

// Exposer les fonctions de débogage globalement
window.flipbookDebug = {
    forceCreateMobileControls,
    toggleControlsVisibility,
    checkResponsiveStatus
};

// Ajouter un bouton de débogage en mode développement
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('load', function() {
        const debugBtn = document.createElement('button');
        debugBtn.textContent = '🛠️';
        debugBtn.style.position = 'fixed';
        debugBtn.style.top = '10px';
        debugBtn.style.left = '10px';
        debugBtn.style.zIndex = '9999';
        debugBtn.style.opacity = '0.5';
        debugBtn.style.padding = '5px 10px';
        debugBtn.style.backgroundColor = '#000';
        debugBtn.style.color = '#fff';
        debugBtn.style.border = 'none';
        debugBtn.style.borderRadius = '5px';
        
        debugBtn.addEventListener('click', function() {
            forceCreateMobileControls();
            checkResponsiveStatus();
        });
        
        document.body.appendChild(debugBtn);
    });
}

// Log pour confirmer le chargement du script
console.log('Script de débogage du flipbook chargé - Utilisez window.flipbookDebug pour accéder aux fonctions');
