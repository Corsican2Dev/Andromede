/**
 * Gestion de la barre de progression et des favoris pour le flipbook
 */
document.addEventListener("DOMContentLoaded", function () {
    const flipbook = document.getElementById("flipbook");
    const progressBar = document.getElementById("book-progress-bar");
    const progressText = document.getElementById("book-progress-text");
    const bookmarksList = document.getElementById("bookmarks-list");
    const bookmarkBtn = document.getElementById("bookmark-btn");
    const bookmarkModal = new bootstrap.Modal(document.getElementById("bookmarkModal"));
    const progressContainer = document.querySelector(".book-progress-container");
    const progressBarContainer = document.querySelector(".book-progress-bar-container");
    let progressVisible = false; // Par défaut, la barre n'est pas visible
    
    // Créer le bouton toggle pour afficher/masquer la barre de progression
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'progress-toggle-btn';
    toggleBtn.innerHTML = '<i class="bi bi-arrow-up-circle-fill"></i>';
    toggleBtn.title = "Afficher la barre de progression";
    document.body.appendChild(toggleBtn);
    
    // Total des pages (nombre de divs .page)
    const totalPages = flipbook.querySelectorAll(".page").length * 2; // Chaque div .page contient 2 pages (front et back)
    let currentPage = 0;
    
    // Chargement des favoris depuis localStorage
    let bookmarks = JSON.parse(localStorage.getItem('flipbookBookmarks')) || {};
    
    // État de visibilité de la barre de progression (préférence utilisateur)
    const isResponsiveMode = window.innerWidth < 1200;
    if (!isResponsiveMode) {
        // En mode desktop, charger la préférence utilisateur
        progressVisible = localStorage.getItem('progressBarVisible') === 'true';
    } else {
        // En mode responsive, la barre est visible par défaut
        progressVisible = true;
    }
    updateProgressVisibility();
    
    // Fonction pour mettre à jour la visibilité de la barre de progression
    function updateProgressVisibility() {
        const isResponsiveMode = window.innerWidth < 1200;
        
        if (progressVisible) {
            progressContainer.classList.remove('hidden');
            toggleBtn.classList.remove('visible');
            toggleBtn.innerHTML = '<i class="bi bi-arrow-down-circle-fill"></i>';
            toggleBtn.title = "Masquer la barre de progression";
            document.body.classList.remove('progress-hidden');
        } else {
            progressContainer.classList.add('hidden');
            toggleBtn.classList.add('visible');
            toggleBtn.innerHTML = '<i class="bi bi-arrow-up-circle-fill"></i>';
            toggleBtn.title = "Afficher la barre de progression";
            document.body.classList.add('progress-hidden');
        }
        
        // En mode responsive, on veut que le bouton toggle soit visible
        // seulement quand la barre est cachée
        if (isResponsiveMode) {
            if (!progressVisible) {
                toggleBtn.style.opacity = '1';
                toggleBtn.style.visibility = 'visible';
            } else {
                toggleBtn.style.opacity = '0';
                toggleBtn.style.visibility = 'hidden';
            }
        } else {
            // En mode desktop, on sauvegarde la préférence
            localStorage.setItem('progressBarVisible', progressVisible);
        }
        
        // Mettre à jour la position des contrôles de navigation si nécessaire
        adjustControlsPosition();
    }
    
    // Gérer le clic sur le bouton pour afficher/masquer la barre de progression
    toggleBtn.addEventListener('click', function() {
        progressVisible = !progressVisible;
        updateProgressVisibility();
    });
    
    // Gérer le clic sur le bouton X pour masquer la barre de progression en mode responsive
    const closeBtn = document.querySelector('.book-control-btn[title="Masquer"]');
    if (closeBtn) {
        closeBtn.classList.remove('mobile-hidden');
        closeBtn.addEventListener('click', function() {
            progressVisible = false;
            updateProgressVisibility();
        });
    }
    
    // Ajuster la position des contrôles de navigation en fonction de la visibilité de la barre
    function adjustControlsPosition() {
        const mobileNavControls = document.querySelector('.mobile-nav-controls');
        if (mobileNavControls) {
            if (progressVisible) {
                mobileNavControls.style.bottom = '4rem';
            } else {
                mobileNavControls.style.bottom = '1.5rem';
            }
        }
    }
    
    // Vérifier si nous sommes en mode responsive et ajuster l'affichage
    function checkResponsiveMode() {
        const isResponsiveMode = window.innerWidth < 1200;
        
        // Mettre à jour la visibilité du bouton toggle et de la barre
        updateProgressVisibility();
    }
    
    // Appeler la fonction au chargement
    checkResponsiveMode();
    
    // Écouter les changements de taille d'écran
    window.addEventListener('resize', checkResponsiveMode);
    
    /**
     * Met à jour la barre de progression du livre
     * @param {number} page - Le numéro de la page actuelle
     */
    function updateProgressBar(page) {
        // Calculer le pourcentage de progression
        const progress = Math.round((page / totalPages) * 100);
        
        // Mettre à jour la largeur de la barre de progression
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute("aria-valuenow", progress);
        
        // Mettre à jour le texte de progression
        progressText.textContent = `Page ${page} sur ${totalPages} (${progress}%)`;
    }
    
    /**
     * Détecte le changement de page et met à jour la barre de progression
     */
    function detectPageChange() {
        const pageNumber = parseInt(getComputedStyle(flipbook).getPropertyValue("--c"), 10) * 2;
        
        if (pageNumber !== currentPage) {
            currentPage = pageNumber;
            updateProgressBar(currentPage);
            
            // Vérifier si la page actuelle est un favori
            const bookmarkBtn = document.getElementById("bookmark-btn");
            if (bookmarks[currentPage]) {
                bookmarkBtn.innerHTML = '<i class="bi bi-bookmark-fill"></i>';
                bookmarkBtn.classList.add("active");
            } else {
                bookmarkBtn.innerHTML = '<i class="bi bi-bookmark"></i>';
                bookmarkBtn.classList.remove("active");
            }
        }
    }
    
    /**
     * Ajoute ou supprime un favori pour la page actuelle
     */
    function toggleBookmark() {
        if (bookmarks[currentPage]) {
            // Supprimer le favori
            delete bookmarks[currentPage];
            bookmarkBtn.innerHTML = '<i class="bi bi-bookmark"></i>';
            bookmarkBtn.classList.remove("active");
        } else {
            // Ajouter un favori avec un titre par défaut
            const pageTitle = document.querySelector(`.page:nth-child(${Math.ceil(currentPage/2)}) .overlay-title`)?.textContent.trim() || `Page ${currentPage}`;
            bookmarks[currentPage] = {
                title: pageTitle,
                timestamp: new Date().toISOString()
            };
            bookmarkBtn.innerHTML = '<i class="bi bi-bookmark-fill"></i>';
            bookmarkBtn.classList.add("active");
        }
        
        // Sauvegarder les favoris dans localStorage
        localStorage.setItem('flipbookBookmarks', JSON.stringify(bookmarks));
        
        // Mettre à jour la liste des favoris
        updateBookmarksList();
    }
    
    /**
     * Met à jour la liste des favoris dans le modal
     */
    function updateBookmarksList() {
        // Vider la liste
        bookmarksList.innerHTML = '';
        
        // Vérifier s'il y a des favoris
        if (Object.keys(bookmarks).length === 0) {
            bookmarksList.innerHTML = '<li class="list-group-item">Aucun favori enregistré</li>';
            return;
        }
        
        // Trier les favoris par numéro de page
        const sortedBookmarks = Object.keys(bookmarks)
            .sort((a, b) => parseInt(a) - parseInt(b));
        
        // Ajouter chaque favori à la liste
        sortedBookmarks.forEach(pageNum => {
            const bookmark = bookmarks[pageNum];
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            
            // Créer l'élément pour le titre et le numéro de page
            const titleSpan = document.createElement('span');
            titleSpan.className = 'bookmark-title';
            titleSpan.textContent = `${bookmark.title} (Page ${pageNum})`;
            titleSpan.style.cursor = 'pointer';
            titleSpan.onclick = function() {
                goToPage(parseInt(pageNum));
                bookmarkModal.hide();
            };
            
            // Créer le bouton de suppression
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-danger';
            deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
            deleteBtn.onclick = function() {
                delete bookmarks[pageNum];
                localStorage.setItem('flipbookBookmarks', JSON.stringify(bookmarks));
                updateBookmarksList();
                
                // Mettre à jour l'apparence du bouton favori si on est sur cette page
                if (currentPage == pageNum) {
                    bookmarkBtn.innerHTML = '<i class="bi bi-bookmark"></i>';
                    bookmarkBtn.classList.remove("active");
                }
            };
            
            // Ajouter les éléments au li
            li.appendChild(titleSpan);
            li.appendChild(deleteBtn);
            
            // Ajouter le li à la liste
            bookmarksList.appendChild(li);
        });
    }
    
    /**
     * Naviguer vers une page spécifique
     * @param {number} pageNum - Le numéro de page à atteindre
     */
    function goToPage(pageNum) {
        // Diviser par 2 car chaque div .page contient 2 pages (front et back)
        const targetPage = Math.floor(pageNum / 2);
        flipbook.style.setProperty("--c", targetPage);
        currentPage = pageNum;
        updateProgressBar(currentPage);
    }
    
    /**
     * Gère le clic sur la barre de progression pour naviguer directement à une page
     * @param {Event} event - L'événement de clic
     */
    function handleProgressBarClick(event) {
        // Calculer la position relative du clic dans la barre de progression
        const rect = progressBarContainer.getBoundingClientRect();
        const clickPosition = event.clientX - rect.left;
        const progressBarWidth = rect.width;
        
        // Calculer le pourcentage de progression correspondant au clic
        const clickPercentage = clickPosition / progressBarWidth;
        
        // Calculer le numéro de page correspondant
        const targetPage = Math.max(0, Math.min(totalPages, Math.round(clickPercentage * totalPages)));
        
        // Naviguer vers la page calculée
        goToPage(targetPage);
        
        console.log(`Navigation vers la page ${targetPage} (${Math.round(clickPercentage * 100)}%)`);
    }
    
    // Initialiser la barre de progression
    updateProgressBar(currentPage);
    
    // Initialiser la liste des favoris
    updateBookmarksList();
    
    // Écouter les changements de page
    flipbook.addEventListener("transitionend", detectPageChange);
    
    // Ajouter un écouteur d'événement pour le bouton favori
    bookmarkBtn.addEventListener("click", toggleBookmark);
    
    // Ajouter un écouteur d'événement pour la navigation par clic sur la barre de progression
    progressBarContainer.addEventListener("click", handleProgressBarClick);
    
    // Rendre les fonctions disponibles globalement
    window.bookProgress = {
        updateProgressBar,
        toggleBookmark,
        goToPage,
        toggleProgressVisibility: function() {
            progressVisible = !progressVisible;
            updateProgressVisibility();
        },
        showProgress: function() {
            progressVisible = true;
            updateProgressVisibility();
        },
        hideProgress: function() {
            progressVisible = false;
            updateProgressVisibility();
        }
    };
});
