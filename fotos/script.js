class ImageBuilder {
    constructor() {
        this.container = document.getElementById('imagesPosts');
        this.fetchPosts('data.json');
    }

    fetchPosts(data) {
        fetch(data)
            .then(response => response.json())
            .then(data => {
                data = ImageBuilder.shuffleArray(data);
                data.forEach(item => {
                    this.addImagePost(item);
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    addImagePost(item) {
        const container = document.createElement('div');
        container.classList.add('img');

        const title = document.createElement('h2');
        title.textContent = item.title;
        container.appendChild(title);

        const imagePath = `content/${item.image}`;
        const image = document.createElement('img');
        image.src = imagePath;
        container.appendChild(image);

        if (item.subtitle) {
            const subtitle = document.createElement('p');
            subtitle.classList.add('image-subtitle');
            subtitle.textContent = item.subtitle;
            subtitle.style.textAlign = "right"; 
            subtitle.style.maxWidth = "80%";
            container.appendChild(subtitle);
        }        

        this.container.appendChild(container);
    }

    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

window.onload = function() {
    new ImageBuilder();
};
