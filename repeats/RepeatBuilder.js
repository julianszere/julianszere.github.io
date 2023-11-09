import { PhrasesHelper } from '../repeats/PhrasesHelper.js';
import { LibraryHelper } from '../repeats/LibraryHelper.js';
import { NothingHelper } from '../repeats/NothingHelper.js';

export class RepeatBuilder {
    constructor() {
        this.container = document.getElementById('repeatsPosts');
        this.tab = document.getElementById('repeatsTab');

        const phrasesHelper = new PhrasesHelper();
        const libraryHelper = new LibraryHelper();
        const nothingHelper = new NothingHelper();

        this.createAndAddTextPost(phrasesHelper);
        this.createAndAddTextPost(libraryHelper);
        this.createAndAddTextPost(nothingHelper);
    }

    createAndAddTextPost(helper) {
        const [title, text, author] = helper.getTitleTextAndAuthor();
        const container = document.createElement('div');
        container.classList.add('text-post');

        const titleReloadContainer = this.createTitleReloadContainer(title, () => {
            const [newTitle, newText, newAuthor] = helper.getTitleTextAndAuthor();
            this.updateTextPost(container, newTitle, newText, newAuthor);
        });

        container.appendChild(titleReloadContainer);

        const paragraphs = text.split('\n');
        paragraphs.forEach(paragraph => {
            const content = this.createParagraph(paragraph);
            container.appendChild(content);
        });

        const authorElement = this.createAuthorElement(author, container);

        this.container.appendChild(container);
    }

    createTitleReloadContainer(title, onReload) {
        const titleReloadContainer = document.createElement('div');
        titleReloadContainer.classList.add('title-reload-container');

        const titleElement = this.createTitleElement(title);
        titleReloadContainer.appendChild(titleElement);

        const reloadButton = this.createReloadButton(onReload);
        titleReloadContainer.appendChild(reloadButton);

        return titleReloadContainer;
    }

    createTitleElement(title) {
        const titleElement = document.createElement('h2');
        titleElement.textContent = title;
        return titleElement;
    }

    createReloadButton(onReload) {
        const reloadButton = document.createElement('button');
        reloadButton.innerHTML = '&#x21ba;'; // Unicode for reload icon
        reloadButton.classList.add('reload-button');
        reloadButton.addEventListener('click', onReload);
        return reloadButton;
    }

    updateTextPost(container, title, text, author) {
        const titleElement = container.querySelector('h2');
        titleElement.textContent = title;

        const contentElements = container.querySelectorAll('p');
        contentElements.forEach(contentElement => {
            contentElement.textContent = ''; // Clear previous content
        });

        const paragraphs = text.split('\n');
        paragraphs.forEach(paragraph => {
            const content = this.createParagraph(paragraph);
            container.appendChild(content);
        });

        this.createAuthorElement(author, container)
    }

    createParagraph(paragraph) {
        const content = document.createElement('p');
        content.textContent = paragraph;
        return content;
    }

    createAuthorElement(author, container) {
        if (author) {
            const authorElement = document.createElement('p');
            authorElement.innerHTML = `<em>${author}</em>`;
            authorElement.style.textAlign = 'right';
            container.appendChild(authorElement);
        }
    }
}

