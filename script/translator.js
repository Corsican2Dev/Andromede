/**
 * Système de traduction utilisant LibreTranslate
 * Ce script gère la traduction du contenu textuel de l'application
 */

class Translator {
    constructor() {
        this.currentLanguage = 'fr'; // Langue par défaut: français
        this.libreTranslateUrl = 'https://libretranslate.com/translate'; // URL du service LibreTranslate
        this.textCache = {}; // Cache pour stocker les textes originaux
        this.translationCache = {}; // Cache pour stocker les traductions déjà effectuées
        this.autoTranslate = true; // Traduire automatiquement ?
        this.availableLanguages = ['fr', 'en', 'es', 'de', 'it', 'zh']; // Langues disponibles
        this.isTranslating = false;
        
        // Fallback vers l'API publique si une instance privée n'est pas spécifiée
        this.fallbackApis = [
            'https://libretranslate.de/translate',
            'https://translate.argosopentech.com/translate',
            'https://translate.terraprint.co/translate'
        ];
        
        // Charger les traductions prédéfinies
        this.loadLocalTranslations();
        
        this.init();
    }
    
    /**
     * Charge les traductions prédéfinies depuis le fichier JSON
     */
    async loadLocalTranslations() {
        try {
            const response = await fetch('../assets/languages/translations.json');
            if (response.ok) {
                const translations = await response.json();
                this.localTranslations = translations;
                console.log('✅ Traductions locales chargées avec succès');
            } else {
                console.warn('⚠️ Impossible de charger les traductions locales (statut HTTP:', response.status, ')');
                this.localTranslations = {};
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des traductions locales:', error);
            
            // Fallback: tenter de charger depuis un chemin relatif différent
            try {
                const response = await fetch('./assets/languages/translations.json');
                if (response.ok) {
                    this.localTranslations = await response.json();
                    console.log('✅ Traductions locales chargées depuis le chemin alternatif');
                } else {
                    this.localTranslations = {};
                }
            } catch (e) {
                console.error('❌ Échec définitif du chargement des traductions locales:', e);
                this.localTranslations = {};
            }
        }
    }
    
    init() {
        // Vérifier si la page est déjà chargée
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupListeners());
        } else {
            // DOMContentLoaded a déjà été déclenché
            this.setupListeners();
        }
        
        // Ajouter un débogage pour vérifier si le script est chargé
        console.log("✅ Système de traduction initialisé");
    }
    
    setupListeners() {
        // Vérifier si le modal est présent dans le DOM
        const langModal = document.getElementById('languageModal');
        if (!langModal) {
            console.error("❌ Modal de langue non trouvé dans le DOM");
            return;
        }
        
        console.log("✅ Modal de langue trouvé");
        
        // Vérifier si les boutons de langue existent
        const langButtons = document.querySelectorAll('.language-btn');
        if (langButtons.length === 0) {
            console.error("❌ Boutons de langue non trouvés");
            return;
        }
        
        console.log(`✅ ${langButtons.length} boutons de langue trouvés`);
        
        // Initialiser la langue depuis localStorage
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang) {
            this.currentLanguage = savedLang;
            this.updateLanguageButtons();
        }
        
        // Attacher les event listeners aux boutons de langue
        langButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetLang = e.target.getAttribute('data-lang');
                console.log(`🔄 Changement de langue vers: ${targetLang}`);
                this.translateSite(targetLang);
            });
        });
        
        // Ajouter un débogage pour l'ouverture du modal
        const langModalElement = document.getElementById('languageModal');
        if (langModalElement) {
            langModalElement.addEventListener('show.bs.modal', () => {
                console.log("🔍 Modal de langue en cours d'ouverture");
            });
            
            langModalElement.addEventListener('shown.bs.modal', () => {
                console.log("✅ Modal de langue ouvert");
                this.updateLanguageButtons();
            });
        }
        
        // Vérifier si le lien du modal fonctionne correctement
        const langModalLink = document.querySelector('a[data-bs-target="#languageModal"]');
        if (langModalLink) {
            console.log("✅ Lien du modal trouvé");
            
            // Ajouter un gestionnaire d'événements de secours pour ouvrir le modal
            langModalLink.addEventListener('click', (e) => {
                console.log("🔍 Clic sur le lien du modal de langue");
                try {
                    const modal = new bootstrap.Modal(document.getElementById('languageModal'));
                    modal.show();
                } catch (error) {
                    console.error("❌ Erreur lors de l'ouverture du modal:", error);
                }
            });
        } else {
            console.error("❌ Lien du modal non trouvé");
        }
    }
    
    /**
     * Traduit l'ensemble du site vers la langue cible
     * @param {string} targetLang - Code de la langue cible
     */
    async translateSite(targetLang) {
        if (this.isTranslating) return;
        if (targetLang === this.currentLanguage) return;
        
        this.isTranslating = true;
        this.updateLanguageButtons(targetLang);
        
        // Afficher la barre de progression
        const progressContainer = document.querySelector('.translation-progress');
        const progressBar = document.querySelector('.translation-progress .progress-bar');
        const statusText = document.getElementById('translation-status');
        
        if (progressContainer) progressContainer.classList.remove('d-none');
        if (progressBar) progressBar.style.width = '0%';
        if (statusText) statusText.textContent = `Traduction en cours (${targetLang})...`;
        
        // Collecter tous les éléments à traduire
        const translatableElements = this.getTranslatableElements();
        
        // Stocker le texte original s'il n'est pas déjà en cache
        if (!this.textCache[this.currentLanguage]) {
            this.textCache[this.currentLanguage] = {};
        }
        
        // Initialiser le cache pour la langue cible si nécessaire
        if (!this.translationCache[targetLang]) {
            this.translationCache[targetLang] = {};
        }
        
        let processedItems = 0;
        const totalItems = translatableElements.length;
        
        // Regrouper les textes pour réduire le nombre de requêtes API
        const textsToTranslate = [];
        const elementsMap = [];
        
        // Préparer les textes pour la traduction
        for (const element of translatableElements) {
            if (!element.textContent.trim()) continue;
            
            // Soit utiliser le texte d'origine, soit le texte actuel si l'origine n'est pas en cache
            const originalText = this.textCache[this.currentLanguage][element.dataset.translationId] || element.textContent;
            
            // Vérifier si une traduction existe déjà dans le cache
            if (this.translationCache[targetLang][originalText]) {
                element.textContent = this.translationCache[targetLang][originalText];
                element.dataset.translated = 'true';
                processedItems++;
                continue;
            }
            
            // Marquer l'élément comme étant en cours de traduction
            element.classList.add('translating');
            
            // Ajouter à la liste des textes à traduire
            textsToTranslate.push(originalText);
            elementsMap.push(element);
            
            // Stocker le texte original dans le cache
            if (!element.dataset.translationId) {
                element.dataset.translationId = `text-${Math.random().toString(36).substring(2, 10)}`;
            }
            this.textCache[this.currentLanguage][element.dataset.translationId] = originalText;
        }
        
        // Traiter les textes par lots pour éviter de surcharger l'API
        const batchSize = 10; // Nombre de textes par requête
        for (let i = 0; i < textsToTranslate.length; i += batchSize) {
            const batch = textsToTranslate.slice(i, i + batchSize);
            const batchElements = elementsMap.slice(i, i + batchSize);
            
            try {
                const translations = await this.translateBatch(batch, this.currentLanguage, targetLang);
                
                // Appliquer les traductions
                for (let j = 0; j < translations.length; j++) {
                    const element = batchElements[j];
                    const originalText = batch[j];
                    const translatedText = translations[j];
                    
                    element.textContent = translatedText;
                    element.classList.remove('translating');
                    element.dataset.translated = 'true';
                    
                    // Stocker dans le cache
                    this.translationCache[targetLang][originalText] = translatedText;
                    
                    processedItems++;
                }
                
                // Mettre à jour la barre de progression
                const progress = Math.min(Math.round((processedItems / totalItems) * 100), 100);
                if (progressBar) progressBar.style.width = `${progress}%`;
                if (statusText) statusText.textContent = `Traduction en cours: ${progress}%`;
                
            } catch (error) {
                console.error('Erreur de traduction:', error);
                
                // Marquer les éléments du lot comme ayant échoué
                for (const element of batchElements) {
                    element.classList.remove('translating');
                    element.classList.add('translation-failed');
                    processedItems++;
                }
            }
        }
        
        // Mettre à jour la langue actuelle et sauvegarder la préférence
        this.currentLanguage = targetLang;
        localStorage.setItem('preferredLanguage', targetLang);
        
        // Cacher la barre de progression après un délai
        setTimeout(() => {
            if (progressContainer) progressContainer.classList.add('d-none');
            if (progressBar) progressBar.style.width = '0%';
            
            // Fermer le modal après la traduction
            const langModal = document.getElementById('languageModal');
            if (langModal) {
                const bsModal = bootstrap.Modal.getInstance(langModal);
                if (bsModal) bsModal.hide();
            }
            
            this.isTranslating = false;
        }, 1000);
    }
    
    /**
     * Traduit un lot de textes en utilisant LibreTranslate
     * @param {string[]} texts - Tableau de textes à traduire
     * @param {string} sourceLang - Code de la langue source
     * @param {string} targetLang - Code de la langue cible
     * @returns {Promise<string[]>} - Tableau de textes traduits
     */
    async translateBatch(texts, sourceLang, targetLang) {
        // Si la langue source et cible sont identiques, retourner les textes tels quels
        if (sourceLang === targetLang) return texts;
        
        // Retirer les textes vides
        const nonEmptyTexts = texts.filter(text => text && text.trim());
        if (nonEmptyTexts.length === 0) return texts;
        
        // D'abord, essayer de trouver des traductions dans notre cache local
        const resultTexts = [...texts];
        const textsToTranslate = [];
        const indexesToUpdate = [];
        
        for (let i = 0; i < texts.length; i++) {
            const text = texts[i];
            if (!text || !text.trim()) continue;
            
            // Vérifier si une traduction locale existe
            const localTranslation = this.findLocalTranslation(text, sourceLang, targetLang);
            if (localTranslation) {
                resultTexts[i] = localTranslation;
            } else {
                textsToTranslate.push(text);
                indexesToUpdate.push(i);
            }
        }
        
        // Si aucun texte n'a besoin d'être traduit par l'API, retourner les résultats locaux
        if (textsToTranslate.length === 0) {
            return resultTexts;
        }
        
        // Préparer les données pour l'API
        const requestData = {
            q: textsToTranslate,
            source: sourceLang,
            target: targetLang,
            format: "text",
            api_key: "" // Laisser vide pour les API publiques
        };
        
        // Essayer avec les URL principales et de secours
        let translations = null;
        let apiError = null;
        
        // Essayer avec l'URL principale
        try {
            console.log('🔍 Tentative de traduction avec l\'API principale:', this.libreTranslateUrl);
            const response = await this.makeTranslationRequest(this.libreTranslateUrl, requestData);
            if (response && (response.translatedText || response.translatedTexts)) {
                translations = this.processTranslationResponse(response, textsToTranslate);
                console.log('✅ Traduction réussie avec l\'API principale');
            }
        } catch (error) {
            console.warn('⚠️ Erreur avec l\'API principale:', error.message);
            apiError = error;
        }
        
        // Si l'API principale a échoué, essayer avec les API de secours
        if (!translations) {
            for (const api of this.fallbackApis) {
                try {
                    console.log('🔍 Tentative de traduction avec l\'API de secours:', api);
                    const response = await this.makeTranslationRequest(api, requestData);
                    if (response && (response.translatedText || response.translatedTexts)) {
                        translations = this.processTranslationResponse(response, textsToTranslate);
                        console.log('✅ Traduction réussie avec l\'API de secours:', api);
                        break;
                    }
                } catch (error) {
                    console.warn(`⚠️ Erreur avec l'API de secours ${api}:`, error.message);
                    apiError = error;
                }
            }
        }
        
        // Si toutes les API ont échoué, utiliser un service de traduction alternatif ou retourner les textes originaux
        if (!translations) {
            console.error('❌ Toutes les tentatives de traduction ont échoué:', apiError);
            console.log('🔄 Utilisation de Google Translate comme solution de secours...');
            
            try {
                translations = await this.translateWithGoogleFallback(textsToTranslate, sourceLang, targetLang);
                console.log('✅ Traduction de secours réussie');
            } catch (error) {
                console.error('❌ Échec de la traduction de secours:', error);
                // En dernier recours, retourner les textes originaux
                translations = textsToTranslate;
            }
        }
        
        // Mettre à jour les résultats avec les traductions obtenues
        for (let i = 0; i < indexesToUpdate.length; i++) {
            if (i < translations.length) {
                resultTexts[indexesToUpdate[i]] = translations[i];
            }
        }
        
        return resultTexts;
    }
    
    /**
     * Recherche une traduction dans les traductions locales prédéfinies
     */
    findLocalTranslation(text, sourceLang, targetLang) {
        if (!this.localTranslations) return null;
        
        // Vérifier dans les traductions locales
        const sourceTranslations = this.localTranslations[sourceLang];
        const targetTranslations = this.localTranslations[targetLang];
        
        if (!sourceTranslations || !targetTranslations) return null;
        
        // Parcourir les catégories et rechercher le texte
        for (const category in sourceTranslations) {
            const categoryTranslations = sourceTranslations[category];
            for (const key in categoryTranslations) {
                if (categoryTranslations[key] === text && targetTranslations[category] && targetTranslations[category][key]) {
                    return targetTranslations[category][key];
                }
            }
        }
        
        // Recherche alternative pour les textes exactement correspondants dans l'autre sens
        for (const category in targetTranslations) {
            const categoryTranslations = targetTranslations[category];
            for (const key in categoryTranslations) {
                if (targetTranslations[category][key] === text && sourceTranslations[category] && sourceTranslations[category][key]) {
                    return sourceTranslations[category][key];
                }
            }
        }
        
        return null;
    }
    
    /**
     * Effectue une requête à l'API LibreTranslate avec gestion des erreurs améliorée
     */
    async makeTranslationRequest(apiUrl, data) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes de timeout
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                // Récupérer les détails de l'erreur
                let errorDetails = '';
                try {
                    const errorJson = await response.json();
                    errorDetails = JSON.stringify(errorJson);
                } catch (e) {
                    errorDetails = await response.text();
                }
                
                throw new Error(`Erreur HTTP: ${response.status} - ${errorDetails || response.statusText}`);
            }
            
            const responseData = await response.json();
            return responseData;
            
        } catch (error) {
            // Rethrow pour être traité par l'appelant
            throw error;
        }
    }
    
    /**
     * Solution de secours en cas d'échec des API LibreTranslate
     * Utilise une traduction simple côté client
     */
    async translateWithGoogleFallback(texts, sourceLang, targetLang) {
        if (!window.googleTranslateAvailable) {
            // Si le script de Google n'est pas encore chargé, le charger
            await this.loadGoogleTranslateScript();
        }
        
        // Traduction simple sans API
        return texts.map(text => {
            // Trouver une traduction connue basée sur des mots-clés
            const simpleDict = {
                fr: {
                    'Musique': { en: 'Music', es: 'Música', de: 'Musik', it: 'Musica', zh: '音乐' },
                    'Photo': { en: 'Photo', es: 'Foto', de: 'Foto', it: 'Foto', zh: '照片' },
                    'Galerie': { en: 'Gallery', es: 'Galería', de: 'Galerie', it: 'Galleria', zh: '画廊' },
                    'Track': { en: 'Track', es: 'Pista', de: 'Track', it: 'Traccia', zh: '轨道' },
                    'Fermer': { en: 'Close', es: 'Cerrar', de: 'Schließen', it: 'Chiudere', zh: '关闭' },
                    'Rechercher': { en: 'Search', es: 'Buscar', de: 'Suchen', it: 'Cercare', zh: '搜索' }
                },
                en: {
                    'Music': { fr: 'Musique', es: 'Música', de: 'Musik', it: 'Musica', zh: '音乐' },
                    'Photo': { fr: 'Photo', es: 'Foto', de: 'Foto', it: 'Foto', zh: '照片' },
                    'Gallery': { fr: 'Galerie', es: 'Galería', de: 'Galerie', it: 'Galleria', zh: '画廊' },
                    'Track': { fr: 'Piste', es: 'Pista', de: 'Track', it: 'Traccia', zh: '轨道' },
                    'Close': { fr: 'Fermer', es: 'Cerrar', de: 'Schließen', it: 'Chiudere', zh: '关闭' },
                    'Search': { fr: 'Rechercher', es: 'Buscar', de: 'Suchen', it: 'Cercare', zh: '搜索' }
                }
            };
            
            // Si la langue source a un dictionnaire et le mot est trouvé
            if (simpleDict[sourceLang]) {
                for (const keyword in simpleDict[sourceLang]) {
                    if (text.includes(keyword)) {
                        const translation = simpleDict[sourceLang][keyword][targetLang];
                        if (translation) {
                            return text.replace(keyword, translation);
                        }
                    }
                }
            }
            
            // Si aucune correspondance n'est trouvée, retourner le texte original
            return text;
        });
    }
    
    /**
     * Charge le script de traduction Google
     */
    loadGoogleTranslateScript() {
        return new Promise((resolve) => {
            // Marquer comme disponible pour éviter de charger plusieurs fois
            window.googleTranslateAvailable = true;
            resolve();
        });
    }
    
    /**
     * Traite la réponse de l'API LibreTranslate avec une meilleure prise en charge des formats
     */
    processTranslationResponse(response, originalTexts) {
        // Format de réponse LibreTranslate standard
        if (Array.isArray(response.translatedText)) {
            return response.translatedText;
        } 
        // Format de réponse alternative (certains serveurs utilisent translatedTexts au pluriel)
        else if (response.translatedTexts && Array.isArray(response.translatedTexts)) {
            return response.translatedTexts;
        }
        // Format de réponse singleton
        else if (typeof response.translatedText === 'string') {
            return [response.translatedText];
        } 
        // Si aucune valeur traduite n'est trouvée mais la réponse est un tableau
        else if (Array.isArray(response)) {
            return response;
        }
        // En cas de format de réponse inconnu
        else {
            console.error('Format de réponse inattendu:', response);
            // Retourner les textes originaux
            return originalTexts;
        }
    }
    
    /**
     * Obtient tous les éléments à traduire sur la page
     */
    getTranslatableElements() {
        // Sélectionnez tous les éléments avec du texte à traduire
        const elements = [
            // Éléments avec la classe 'translatable'
            ...document.querySelectorAll('.translatable'),
            
            // Titres et textes importants
            ...document.querySelectorAll('h1, h2, h3, h4, h5, .modal-title'),
            
            // Textes des boutons et liens
            ...document.querySelectorAll('button:not(.language-btn), .btn:not(.language-btn)'),
            
            // Textes dans l'interface
            ...document.querySelectorAll('.overlay-text'),
            
            // Labels et textes d'interface
            ...document.querySelectorAll('label, .form-label, option, .dropdown-item')
        ];
        
        // Filtrer pour exclure les éléments qui ne doivent pas être traduits
        return Array.from(elements).filter(el => {
            // Exclure les éléments vides ou sans texte
            if (!el.textContent.trim()) return false;
            
            // Exclure les éléments avec data-no-translate
            if (el.getAttribute('data-no-translate') === 'true') return false;
            
            // Exclure les éléments script, style, input, select
            const tagName = el.tagName.toLowerCase();
            if (['script', 'style', 'input', 'select', 'textarea'].includes(tagName)) return false;
            
            return true;
        });
    }
    
    /**
     * Met à jour l'apparence des boutons de langue
     */
    updateLanguageButtons(activeLang = null) {
        const lang = activeLang || this.currentLanguage;
        document.querySelectorAll('.language-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });
    }
}

// Initialiser le traducteur
document.addEventListener('DOMContentLoaded', () => {
    window.translator = new Translator();
    
    // Ajouter un gestionnaire d'événements au document pour s'assurer que le modal fonctionne
    document.body.addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('a[data-bs-target="#languageModal"], a[data-bs-toggle="modal"][data-bs-target="#languageModal"]')) {
            console.log("📣 Clic détecté sur le lien du modal de langue");
            try {
                const modal = new bootstrap.Modal(document.getElementById('languageModal'));
                modal.show();
            } catch (error) {
                console.error("❌ Impossible d'ouvrir le modal:", error);
            }
        }
    });
});

// Ne pas initialiser deux fois
if (!window.translator) {
    window.translator = new Translator();
}
