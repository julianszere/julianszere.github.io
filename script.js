import { Texts } from './texts.js'; // Import the Texts class from the texts.js file
import { Images } from './images.js';

class Blog {
    constructor() {
        this.imagePostsContainer = document.getElementById('imagePosts');
        this.textPostsContainer = document.getElementById('textPosts');
        this.floatingThoughtsContainer = document.getElementById('floatingThoughts');
        this.imageTabButton = document.getElementById('imageTab');
        this.textTabButton = document.getElementById('textTab');
        this.floatingThoughtsTabButton = document.getElementById('floatingThoughtsTab');

        this.tabButtons = [this.imageTabButton, this.textTabButton, this.floatingThoughtsTabButton]
        this.postContainers = [this.imagePostsContainer, this.textPostsContainer, this.floatingThoughtsContainer]

        this.textsHandler = new Texts();
        this.imageshandler = new Images();
    }
    

    init() {
        this.imageTabButton.addEventListener('click', () => {
            this.blockPostContainer(this.imagePostsContainer)
            this.activateTab(this.imageTabButton);
        });
    
        this.textTabButton.addEventListener('click', () => {
            this.blockPostContainer(this.textPostsContainer)
            this.activateTab(this.textTabButton);
        });
    
        this.floatingThoughtsTabButton.addEventListener('click', () => {
            this.blockPostContainer(this.floatingThoughtsContainer)
            this.activateTab(this.floatingThoughtsTabButton);
            this.createFloatingThoughts();
        });

        // The default is floating thoughts
        this.floatingThoughtsTabButton.click();
    }

    activateTab(tab) {
        for (const tabButton of this.tabButtons) {
            tabButton.classList.remove('active');
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
