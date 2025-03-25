/**
 * Script pour gérer les effets de type Star Wars
 */
document.addEventListener('DOMContentLoaded', function() {
    // Sélectionner tous les éléments avec la classe "star-wars-animation"
    const starWarsElements = document.querySelectorAll('.star-wars-animation');
    
    // Variable pour suivre la visibilité de la page
    let isPageVisible = true;
    
    starWarsElements.forEach(element => {
        // Observer quand l'élément devient visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Si l'élément est visible, s'assurer que l'animation est active
                if (entry.isIntersecting) {
                    if (!element.style.animationPlayState || element.style.animationPlayState === 'paused') {
                        element.style.animationPlayState = 'running';
                    }
                } else {
                    // Mettre en pause l'animation quand l'élément n'est pas visible
                    element.style.animationPlayState = 'paused';
                }
            });
        }, {
            threshold: 0.1 // Déclencher quand au moins 10% de l'élément est visible
        });
        
        observer.observe(element);
    });
    
    // Détecter quand la page perd le focus pour économiser des ressources
    document.addEventListener('visibilitychange', () => {
        isPageVisible = document.visibilityState === 'visible';
        
        starWarsElements.forEach(element => {
            if (isPageVisible) {
                element.style.animationPlayState = 'running';
            } else {
                element.style.animationPlayState = 'paused';
            }
        });
    });
    
    // Observer les événements de retournement des pages du flipbook
    const flipbook = document.getElementById('flipbook');
    if (flipbook) {
        // Observer les mutations pour détecter les changements de page
        const flipbookObserver = new MutationObserver(() => {
            // Vérifier si la page contenant le logo est visible
            starWarsElements.forEach(element => {
                const page = element.closest('.page');
                if (page) {
                    // Vérifier si la page est retournée (pas visible)
                    const isPageVisible = !page.style.transform || 
                                         !page.style.transform.includes('rotate(0, 1, 0, -180deg)');
                    
                    if (isPageVisible) {
                        element.style.animationPlayState = 'running';
                    } else {
                        element.style.animationPlayState = 'paused';
                    }
                }
            });
        });
        
        flipbookObserver.observe(flipbook, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }
    
    // Pour tester ou relancer l'animation manuellement si nécessaire
    window.restartStarWarsAnimation = function() {
        starWarsElements.forEach(element => {
            element.style.animation = 'none';
            void element.offsetWidth; // Forcer un reflow
            element.style.animation = 'starWarsLogo 12s cubic-bezier(0.16, 1, 0.3, 1) infinite';
            element.style.animationPlayState = 'running';
        });
    };
});
