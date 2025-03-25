/**
 * Module de recherche pour le FlipBook
 * Permet de rechercher des pages par titre ou numéro de page
 */
document.addEventListener("DOMContentLoaded", function() {
    // Mapping des titres de chapitres avec leurs pages correspondantes
    const chaptersMap = [
        { title: "Immersion", page: 3, number: "1" },
        { title: "Immersion", page: 4, number: "2" },
        { title: "De mon lit à mon siège éjectable", page: 5, number: "3" },
        { title: "Accélération et mise en orbite", page: 6, number: "4" },
        { title: "Passage délicat", page: 7, number: "5" },
        { title: "Eviction du puits granitique solaire", page: 8, number: "6" },
        { title: "Monotonie et étoiles. Son abyssal de mon sax.", page: 9, number: "7" },
        { title: "Bain de soleil bleu d'Altaïr. Eclipse.", page: 10, number: "8" },
        { title: "Fond diffus du cosmos", page: 11, number: "9" },
        { title: "Distortion temporelle", page: 12, number: "10" },
        { title: "Dragon d'antimatière. Apparition d'êtres cosmiques.", page: 13, number: "11" },
        { title: "Flashback.", page: 14, number: "12" },
        { title: "XOalpha", page: 15, number: "13" },
        { title: "Remerciements", page: 16, number: "" }
    ];

    // Sélection des éléments DOM
    const titleSearchInput = document.getElementById('titleSearchInput');
    const titleSearchResults = document.getElementById('titleSearchResults');
    const showTitlesButton = document.getElementById('showTitlesButton');
    const pageSearchInput = document.getElementById('pageSearchInput');
    const pageSearchButton = document.getElementById('pageSearchButton');
    const searchModal = document.getElementById('searchModal');

    // Variable pour suivre l'état d'affichage des titres
    let titlesVisible = false;

    // Écouteurs d'événements
    titleSearchInput.addEventListener('input', searchTitles);
    showTitlesButton.addEventListener('click', toggleTitles);
    pageSearchButton.addEventListener('click', goToPageByNumber);
    pageSearchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            goToPageByNumber();
        }
    });

    /**
     * Affiche ou masque tous les titres disponibles
     */
    function toggleTitles() {
        if (titlesVisible) {
            // Masquer les titres
            titleSearchResults.innerHTML = '';
            showTitlesButton.innerHTML = '<i class="bi bi-list"></i>';
            showTitlesButton.setAttribute('title', 'Afficher tous les titres');
        } else {
            // Afficher tous les titres
            showAllTitles();
            showTitlesButton.innerHTML = '<i class="bi bi-list-nested"></i>';
            showTitlesButton.setAttribute('title', 'Masquer les titres');
        }
        titlesVisible = !titlesVisible;
    }

    /**
     * Recherche les titres correspondant à l'entrée de l'utilisateur
     */
    function searchTitles() {
        const searchTerm = titleSearchInput.value.toLowerCase().trim();
        titleSearchResults.innerHTML = '';

        if (searchTerm === '') {
            // Si le champ est vide et les titres étaient visibles, on les conserve
            if (titlesVisible) {
                showAllTitles();
            } else {
                titleSearchResults.innerHTML = '';
            }
            return;
        }

        // Quand on fait une recherche spécifique, on considère les titres comme visibles
        titlesVisible = true;
        showTitlesButton.innerHTML = '<i class="bi bi-list-nested"></i>';
        
        // Filtrer les titres qui contiennent le terme de recherche
        const matchingChapters = chaptersMap.filter(chapter => 
            chapter.title.toLowerCase().includes(searchTerm)
        );

        if (matchingChapters.length === 0) {
            const noResultItem = document.createElement('li');
            noResultItem.className = 'list-group-item text-center';
            noResultItem.textContent = 'Aucun résultat trouvé';
            titleSearchResults.appendChild(noResultItem);
            return;
        }

        // Afficher les résultats
        matchingChapters.forEach(chapter => {
            addChapterToResults(chapter);
        });
    }

    /**
     * Affiche tous les titres disponibles
     */
    function showAllTitles() {
        titleSearchResults.innerHTML = '';
        chaptersMap.forEach(chapter => {
            addChapterToResults(chapter);
        });
    }

    /**
     * Ajoute un chapitre à la liste des résultats
     */
    function addChapterToResults(chapter) {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        const titleElement = document.createElement('span');
        titleElement.textContent = `${chapter.number ? chapter.number + ". " : ""}${chapter.title}`;
        
        const pageElement = document.createElement('span');
        pageElement.className = 'badge bg-primary rounded-pill';
        pageElement.textContent = `Page ${chapter.page}`;
        
        listItem.appendChild(titleElement);
        listItem.appendChild(pageElement);
        listItem.style.cursor = 'pointer';
        
        listItem.addEventListener('click', function() {
            goToPage(chapter.page);
        });
        
        titleSearchResults.appendChild(listItem);
    }

    /**
     * Navigue vers la page spécifiée dans le champ de recherche par numéro
     */
    function goToPageByNumber() {
        const pageNumber = parseInt(pageSearchInput.value.trim());
        if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > 16) {
            // Afficher un message d'erreur si le numéro de page n'est pas valide
            pageSearchInput.classList.add('is-invalid');
            return;
        }
        
        pageSearchInput.classList.remove('is-invalid');
        goToPage(pageNumber);
    }

    /**
     * Navigue vers une page spécifique du flipbook
     * 
     * @param {number} pageNumber - Le numéro de page vers lequel naviguer
     */
    function goToPage(pageNumber) {
        // Fermer le modal
        const bsModal = bootstrap.Modal.getInstance(searchModal);
        if (bsModal) {
            bsModal.hide();
        }

        // Calculer l'index de la page dans le flipbook
        // Les indices du flipbook commencent à 0 et chaque élément contient 2 pages
        const flipIndex = Math.floor((pageNumber + 1) / 2);
        
        // Déterminer si nous voulons afficher la face avant (front) ou arrière (back)
        const face = pageNumber % 2 === 0 ? 'front' : 'back';
        
        // Vérifier si nous sommes en mode responsive
        if (window.innerWidth < 1200 && window.responsiveFlipbook) {
            // Utiliser les fonctions du flipbook responsive
            window.responsiveFlipbook.goToPage(flipIndex, face);
            console.log(`Navigation vers la page ${pageNumber} en mode responsive (indice: ${flipIndex}, face: ${face})`);
        } else {
            // Mode desktop: Utiliser la propriété CSS --c pour tourner à la bonne page
            const flipbook = document.getElementById('flipbook');
            if (flipbook) {
                flipbook.style.setProperty('--c', flipIndex);
                console.log(`Navigation vers la page ${pageNumber} (indice flipbook: ${flipIndex})`);
            } else {
                console.error('Élément flipbook non trouvé');
            }
        }
    }
});
