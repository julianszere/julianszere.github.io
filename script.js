import { TextBuilder } from './texts/TextBuilder.js'; // Import the Texts class from the texts.js file
import { ImageBuilder } from './images/ImageBuilder.js';
import { ThoughtBuilder } from './thoughts/ThoughtBuilder.js';
import { Phrases } from './phrases.js';

class Blog {
    constructor() {
        this.imagePostsContainer = document.getElementById('imagePosts');
        this.textPostsContainer = document.getElementById('textPosts');
        this.thoughtsContainer = document.getElementById('thoughtsPosts');
        this.phrasesContainer = document.getElementById('phrasesPosts');
        this.postContainers = [this.imagePostsContainer, this.textPostsContainer, this.thoughtsContainer, this.phrasesContainer];

        this.imageTab = document.getElementById('imageTab');
        this.textTab = document.getElementById('textTab');
        this.thoughtsTab = document.getElementById('thoughtsTab');
        this.phrasesTab = document.getElementById('phrasesTab');
        this.tabs = [this.imageTab, this.textTab, this.thoughtsTab, this.phrasesTab];

        this.textBuilder = new TextBuilder();
        this.imageBuilder = new ImageBuilder();
        this.thoughtsHandler = new ThoughtBuilder();
        this.phrasesHandler = new Phrases();
    }
    

    init() {
        this.imageTab.addEventListener('click', () => {
            this.blockPostContainer(this.imagePostsContainer)
            this.activateTab(this.imageTab);
        });
    
        this.textTab.addEventListener('click', () => {
            this.blockPostContainer(this.textPostsContainer)
            this.activateTab(this.textTab);
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
        this.thoughtsTab.click();
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
