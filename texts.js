export class Texts {
    constructor() {
        this.textPostsContainer = document.getElementById('textPosts');
        this.fetchPosts('data/texts_data.json')
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
        container.classList.add('blog-post');

        const title = document.createElement('h2');
        title.textContent = item.title;
        container.appendChild(title);

        const filePath = `texts/${item.file}`;
        fetch(filePath)
            .then(response => response.text())
            .then(text => {
                const paragraphs = text.split('\n');
                paragraphs.forEach(paragraph => {
                    const content = document.createElement('p');
                    content.textContent = paragraph;
                    container.appendChild(content);
                });

                this.textPostsContainer.appendChild(container);
            })
            .catch(error => console.error('Error fetching text post:', error));
    }
}
