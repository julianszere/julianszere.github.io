import { TextBuilder } from './texts/TextBuilder.js'; // Import the Texts class from the texts.js file
import { ImageBuilder } from './images/ImageBuilder.js';
import { ThoughtBuilder } from './thoughts/ThoughtBuilder.js';
import { Phrases } from './phrases.js';

class Blog {
    constructor() {
        const textsBuilder = new TextBuilder();
        const imagesBuilder = new ImageBuilder();
        const thoughtsBuilder = new ThoughtBuilder();
        const phrasesBuilder = new Phrases();
        this.builders = [textsBuilder, imagesBuilder, thoughtsBuilder, phrasesBuilder];

        // The default is images
        imagesBuilder.tab.click();
    }
    

    init() {
        this.builders.forEach(builder => {
            builder.tab.addEventListener('click', () => {
                this.blockPostContainer(builder.container);
                this.activateTab(builder.tab);
            })
        })
    }

    activateTab(tab) {
        for (const builder of this.builders) {
            builder.tab.classList.remove('active');
        }
        tab.classList.add('active');
    }

    blockPostContainer(container) {
        for (const builder of this.builders) {
            builder.container.style.display = 'none';
        }
        container.style.display = 'block';
    }
}

const blog = new Blog();
blog.init();
