export class TextBuilder {
    constructor() {
        this.container = document.getElementById('textsPosts');
        this.tab = document.getElementById('textsTab');
        this.fetchPosts('texts/data.json')
    }

    fetchPosts(data) {
        fetch(data)
            .then(response => response.json())
            .then(data => {
                data.forEach(item => {
                    this.getContentAndPost(item.title, item.file)
                })
            })
        .catch(error => console.error('Error fetching data:', error));
    }

    getContentAndPost(title, file) {
        const filePath = `texts/content/${file}`;
        fetch(filePath)
            .then(response => response.text())
            .then(text => {
                this.addTextPost(title, text)
            })
            .catch(error => console.error('Error fetching text post:', error));
    }

    addTextPost(title, text, author) {
        const container = document.createElement('div');
        container.classList.add('text-post');
    
        const titleElement = document.createElement('h2');
        titleElement.textContent = title;
        container.appendChild(titleElement);
    
        const paragraphs = text.split('\n');
        paragraphs.forEach(paragraph => {
            const content = document.createElement('p');
            content.textContent = paragraph;
            container.appendChild(content);
        });
    
        // Create an element for the author in italics and align it to the right
        if (author) {
            const authorElement = document.createElement('p');
            authorElement.innerHTML = `<em>${author}</em>`;
            authorElement.style.textAlign = 'right';
            container.appendChild(authorElement);
        }
    
        this.container.appendChild(container);
    }
}
