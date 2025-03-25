/**
 * Performance optimizations:
 * 1. Lazy load videos and images that are not yet visible
 * 2. Use IntersectionObserver to load content only when needed
 * 3. Optimize image and video sizes for different devices
 * 4. Throttle and debounce event handlers
 * 5. Implement resource management for media elements
 */

document.addEventListener('DOMContentLoaded', function() {
    // Configuration des options de lazy loading
    const lazyLoadOptions = {
        rootMargin: '200px 0px', // Préchargement quand l'élément est à 200px de la zone visible
        threshold: 0.01 // Déclencher quand au moins 1% de l'élément est visible
    };

    // ====== 1. OPTIMISATION DES VIDÉOS ======
    function optimizeVideos() {
        // Sélectionner toutes les vidéos avec l'attribut loading="lazy" ou data-src
        const lazyVideos = document.querySelectorAll('video[loading="lazy"], video[data-src], source[data-src]');
        
        if ('IntersectionObserver' in window) {
            const videoObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        
                        // Si c'est une source vidéo
                        if (element.tagName === 'SOURCE') {
                            if (element.dataset.src) {
                                element.src = element.dataset.src;
                                element.removeAttribute('data-src');
                                // S'assurer que la vidéo parent est rechargée
                                if (element.parentElement && element.parentElement.tagName === 'VIDEO') {
                                    element.parentElement.load();
                                }
                            }
                        }
                        // Si c'est une vidéo
                        else if (element.tagName === 'VIDEO') {
                            // Chargement du src direct s'il existe
                            if (element.dataset.src) {
                                element.src = element.dataset.src;
                                element.removeAttribute('data-src');
                                element.load();
                            }
                            
                            // Ou chargement des sources enfants
                            const sources = element.querySelectorAll('source[data-src]');
                            if (sources.length) {
                                sources.forEach(source => {
                                    source.src = source.dataset.src;
                                    source.removeAttribute('data-src');
                                });
                                element.load();
                            }
                            
                            // Réduire la résolution pour les appareils mobiles
                            if (window.innerWidth < 768 && element.dataset.mobileSrc) {
                                element.src = element.dataset.mobileSrc;
                                element.load();
                            }
                        }
                        
                        // Arrêt de l'observation
                        observer.unobserve(element);
                    }
                });
            }, lazyLoadOptions);

            // Observer chaque vidéo et source
            lazyVideos.forEach(video => {
                videoObserver.observe(video);
            });
        } else {
            // Fallback pour les navigateurs ne supportant pas IntersectionObserver
            lazyLoadFallback(lazyVideos);
        }
    }

    // ====== 2. OPTIMISATION DES IMAGES ======
    function optimizeImages() {
        const lazyImages = document.querySelectorAll('img[loading="lazy"], img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        
                        if (img.dataset.srcset) {
                            img.srcset = img.dataset.srcset;
                            img.removeAttribute('data-srcset');
                        }
                        
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            }, lazyLoadOptions);
            
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            lazyLoadFallback(lazyImages);
        }
    }
    
    // ====== 3. OPTIMISATION DES AUDIOS ======
    function optimizeAudios() {
        // Précharger uniquement les premiers fichiers audio
        const audioElements = Array.from(document.querySelectorAll('audio'));
        const audioToPreload = audioElements.slice(0, 2); // Précharger seulement les 2 premiers
        
        audioToPreload.forEach(audio => {
            if (audio.dataset.src) {
                audio.src = audio.dataset.src;
                audio.load();
            }
        });
        
        // Pour les autres, attendre qu'ils soient nécessaires
        const remainingAudio = audioElements.slice(2);
        remainingAudio.forEach(audio => {
            // Si l'audio a un déclencheur spécifique (comme un bouton)
            const triggerId = audio.dataset.triggerElement;
            if (triggerId) {
                const trigger = document.getElementById(triggerId);
                if (trigger) {
                    trigger.addEventListener('click', function() {
                        if (audio.dataset.src && !audio.src) {
                            audio.src = audio.dataset.src;
                            audio.load();
                        }
                    });
                }
            }
        });
    }
    
    // ====== 4. GESTION DE MÉMOIRE ======
    function setupMemoryManagement() {
        // Nettoyer les vidéos non visibles pour économiser de la mémoire
        // Observer les pages du flipbook pour mettre en pause les vidéos non visibles
        const pages = document.querySelectorAll('.page');
        
        if ('IntersectionObserver' in window && pages.length) {
            const pageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const videos = entry.target.querySelectorAll('video');
                    
                    videos.forEach(video => {
                        if (entry.isIntersecting) {
                            // Uniquement jouer si la vidéo n'est pas en pause manuellement
                            if (video.dataset.manuallyPaused !== 'true') {
                                // Essayer de lire la vidéo sans bloquer en cas d'erreur
                                const playPromise = video.play();
                                if (playPromise !== undefined) {
                                    playPromise.catch(() => {
                                        // Gérer silencieusement les erreurs de lecture
                                        console.log("Lecture vidéo reportée");
                                    });
                                }
                            }
                        } else {
                            // Vérifier si la vidéo est en cours de lecture avant de la mettre en pause
                            if (!video.paused && !video.ended) {
                                video.pause();
                            }
                        }
                    });
                });
            }, { threshold: 0.1 }); // 10% visible pour déclencher
            
            pages.forEach(page => {
                pageObserver.observe(page);
            });
        }
    }
    
    // ====== 5. MÉTHODES UTILITAIRES ======
    
    // Fallback pour les navigateurs ne supportant pas IntersectionObserver
    function lazyLoadFallback(elements) {
        // Simple fonction qui vérifie si l'élément est dans la fenêtre visible
        function isElementInViewport(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= -100 &&
                rect.left >= -100 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 100 &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth) + 100
            );
        }
        
        // Fonction pour charger les éléments visibles
        function loadVisibleElements() {
            elements.forEach(element => {
                if (isElementInViewport(element)) {
                    if (element.tagName === 'IMG') {
                        if (element.dataset.src) {
                            element.src = element.dataset.src;
                            element.removeAttribute('data-src');
                        }
                    } else if (element.tagName === 'VIDEO' || element.tagName === 'SOURCE') {
                        if (element.dataset.src) {
                            element.src = element.dataset.src;
                            element.removeAttribute('data-src');
                            if (element.tagName === 'VIDEO' || element.parentElement.tagName === 'VIDEO') {
                                const video = element.tagName === 'VIDEO' ? element : element.parentElement;
                                video.load();
                            }
                        }
                    }
                }
            });
        }
        
        // Vérifier au chargement et lors du défilement
        loadVisibleElements();
        
        // Utiliser throttle pour éviter trop d'appels pendant le défilement
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(function() {
                    loadVisibleElements();
                    scrollTimeout = null;
                }, 200);
            }
        });
    }
    
    // Fonction pour limiter les appels fréquents (throttle)
    function throttle(callback, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = new Date().getTime();
            if (now - lastCall >= delay) {
                lastCall = now;
                return callback(...args);
            }
        };
    }
    
    // Fonction pour retarder l'exécution jusqu'à ce que les appels cessent (debounce)
    function debounce(callback, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                callback(...args);
            }, delay);
        };
    }
    
    // ====== EXÉCUTION ======
    
    // Optimiser les vidéos
    optimizeVideos();
    
    // Optimiser les images
    optimizeImages();
    
    // Optimiser les audios
    optimizeAudios();
    
    // Configuration de la gestion de mémoire
    setupMemoryManagement();
    
    // Optimiser les transitions des pages
    document.querySelectorAll('.page').forEach(page => {
        page.style.willChange = 'transform';
    });
    
    // Réoptimiser lors du redimensionnement de la fenêtre (avec debounce)
    window.addEventListener('resize', debounce(() => {
        optimizeVideos();
        optimizeImages();
    }, 250));
    
    // Exposer des utilitaires pour une utilisation dans d'autres scripts
    window.optimizations = {
        throttle,
        debounce,
        refreshOptimizations: function() {
            optimizeVideos();
            optimizeImages();
            optimizeAudios();
            setupMemoryManagement();
        }
    };

    console.log("✅ Optimizations initialized");
});
