export class Phrases {
    constructor() {
        this.container = document.getElementById('phrasesPosts');
        this.tab = document.getElementById('phrasesTab');
        this.fetchPosts('data/phrases_data.json')
    }

    fetchPosts(data) {
        fetch(data)
            .then(response => response.json())
            .then(data => {
                data.forEach(item => {
                    this.addTextPost(item)
                })
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    addTextPost(item) {
        const container = document.createElement('div');
        container.classList.add('phrase-post');

        const filePath = `phrases/${item.file}`;
        fetch(filePath)
            .then(response => response.text())
            .then(text => {
                const content = document.createElement('p');
                content.textContent = text;
                container.appendChild(content);

                const author = document.createElement('p');
                author.classList.add('author'); // Add a class for styling
                author.innerHTML = `<em>${item.author}</em>`;
                container.appendChild(author);

                this.container.appendChild(container);
            })
            .catch(error => console.error('Error fetching text post:', error));
    }
}
