/**
 * Script de correction des problèmes de modaux Bootstrap
 * Garantit que tous les modaux fonctionnent correctement
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("🔄 Initialisation du correctif pour les modaux...");
    
    // Vérifier si Bootstrap est disponible
    if (typeof bootstrap === 'undefined') {
        console.error("❌ Bootstrap n'est pas chargé ! Les modaux ne fonctionneront pas.");
        
        // Tenter de recharger Bootstrap si nécessaire
        const bootstrapScript = document.createElement('script');
        bootstrapScript.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js";
        bootstrapScript.onload = function() {
            console.log("✅ Bootstrap rechargé avec succès.");
            initializeModals();
        };
        bootstrapScript.onerror = function() {
            console.error("❌ Impossible de recharger Bootstrap.");
        };
        document.head.appendChild(bootstrapScript);
    } else {
        console.log("✅ Bootstrap est disponible.");
        initializeModals();
    }
    
    function initializeModals() {
        // Liste de tous les ID de modaux que nous devons vérifier
        const modalIds = ['languageModal', 'galleryModal', 'searchModal', 'synopsisModal', 'bookmarkModal', 'videoModal', 'explanationVideoModal'];
        
        modalIds.forEach(modalId => {
            const modalElement = document.getElementById(modalId);
            if (!modalElement) {
                console.warn(`⚠️ Modal #${modalId} non trouvé dans le DOM.`);
                return;
            }
            
            // Vérifier si le modal est déjà initialisé
            if (!bootstrap.Modal.getInstance(modalElement)) {
                try {
                    // Initialiser le modal
                    new bootstrap.Modal(modalElement);
                    console.log(`✅ Modal #${modalId} initialisé.`);
                } catch (error) {
                    console.error(`❌ Erreur lors de l'initialisation du modal #${modalId}:`, error);
                }
            }
            
            // Ajouter des écouteurs d'événements pour le débogage
            modalElement.addEventListener('show.bs.modal', () => {
                console.log(`🔍 Modal #${modalId} en cours d'ouverture...`);
            });
            
            modalElement.addEventListener('shown.bs.modal', () => {
                console.log(`✅ Modal #${modalId} ouvert.`);
            });
            
            modalElement.addEventListener('hide.bs.modal', () => {
                console.log(`🔍 Modal #${modalId} en cours de fermeture...`);
            });
            
            modalElement.addEventListener('hidden.bs.modal', () => {
                console.log(`✅ Modal #${modalId} fermé.`);
            });
            
            modalElement.addEventListener('hidePrevented.bs.modal', () => {
                console.warn(`⚠️ Fermeture du modal #${modalId} empêchée.`);
            });
        });
        
        // Relier correctement tous les liens qui ouvrent des modaux
        document.querySelectorAll('[data-bs-toggle="modal"]').forEach(element => {
            const targetId = element.getAttribute('data-bs-target');
            if (!targetId) {
                console.warn("⚠️ Élément de déclenchement de modal sans cible:", element);
                return;
            }
            
            const targetModal = document.querySelector(targetId);
            if (!targetModal) {
                console.warn(`⚠️ Modal cible ${targetId} non trouvé pour:`, element);
                return;
            }
            
            // Ajouter un gestionnaire d'événement de secours
            element.addEventListener('click', function(event) {
                console.log(`🔍 Clic sur déclencheur pour modal ${targetId}`);
                
                try {
                    const modalInstance = bootstrap.Modal.getInstance(targetModal);
                    if (modalInstance) {
                        modalInstance.show();
                    } else {
                        const newModal = new bootstrap.Modal(targetModal);
                        newModal.show();
                    }
                } catch (error) {
                    console.error(`❌ Erreur lors de l'ouverture du modal ${targetId}:`, error);
                }
            });
        });
    }
});
