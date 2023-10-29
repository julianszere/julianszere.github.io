import { TextBuilder } from './texts/TextBuilder.js'; // Import the Texts class from the texts.js file
import { ImageBuilder } from './images/ImageBuilder.js';
import { ThoughtBuilder } from './thoughts/ThoughtBuilder.js';
import { Phrases } from './phrases.js';

class Blog {
    constructor() {
        this.imagesPostsContainer = document.getElementById('imagesPosts');
        this.textsPostsContainer = document.getElementById('textsPosts');
        this.thoughtsContainer = document.getElementById('thoughtsPosts');
        this.phrasesContainer = document.getElementById('phrasesPosts');
        this.postContainers = [this.imagesPostsContainer, this.textsPostsContainer, this.thoughtsContainer, this.phrasesContainer];

        this.imagesTab = document.getElementById('imageTab');
        this.textsTab = document.getElementById('textsTab');
        this.thoughtsTab = document.getElementById('thoughtsTab');
        this.phrasesTab = document.getElementById('phrasesTab');
        this.tabs = [this.imagesTab, this.textsTab, this.thoughtsTab, this.phrasesTab];

        this.textsBuilder = new TextBuilder();
        this.imagesBuilder = new ImageBuilder();
        this.thoughtsHandler = new ThoughtBuilder();
        this.phrasesHandler = new Phrases();
    }
    

    init() {
        this.imagesTab.addEventListener('click', () => {
            this.blockPostContainer(this.imagesPostsContainer)
            this.activateTab(this.imagesTab);
        });
    
        this.textsTab.addEventListener('click', () => {
            this.blockPostContainer(this.textsPostsContainer)
            this.activateTab(this.textsTab);
        });
    
        this.thoughtsTab.addEventListener('click', () => {
            this.blockPostContainer(this.thoughtsContainer)
            this.activateTab(this.thoughtsTab);
        });

        this.phrasesTab.addEventListener('click', () => {
            this.blockPostContainer(this.phrasesContainer)
            this.activateTab(this.phrasesTab);
        });


        // The default is floating thoughts
        this.imagesTab.click();
    }

    activateTab(tab) {
        for (const tab of this.tabs) {
            tab.classList.remove('active');
        }
        tab.classList.add('active');
    }

    blockPostContainer(tab) {
        for (const postContainer of this.postContainers) {
            postContainer.style.display = 'none';
        }
        tab.style.display = 'block';
    }
}

const blog = new Blog();
blog.init();
