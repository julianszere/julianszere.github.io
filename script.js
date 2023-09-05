class Blog {
    constructor() {
        this.imagePostsContainer = document.getElementById('imagePosts');
        this.textPostsContainer = document.getElementById('textPosts');
        this.imageTabButton = document.getElementById('imageTab');
        this.textTabButton = document.getElementById('textTab');
        this.floatingThoughtsContainer = document.getElementById('floatingThoughts');
        this.floatingThoughtsTabButton = document.getElementById('floatingThoughtsTab');
    }
    

    init() {
        this.fetchAndDisplayPosts('data/texts_data.json');
        this.fetchAndDisplayPosts('data/images_data.json');
    
        this.imageTabButton.addEventListener('click', () => {
            this.imagePostsContainer.style.display = 'block';
            this.textPostsContainer.style.display = 'none';
            this.floatingThoughtsContainer.style.display = 'none';
            this.activateTab(this.imageTabButton, this.textTabButton, this.floatingThoughtsTabButton);
        });
    
        this.textTabButton.addEventListener('click', () => {
            this.imagePostsContainer.style.display = 'none';
            this.textPostsContainer.style.display = 'block';
            this.floatingThoughtsContainer.style.display = 'none';
            this.activateTab(this.textTabButton, this.imageTabButton, this.floatingThoughtsTabButton);
        });
    
        this.floatingThoughtsTabButton.addEventListener('click', () => {
            this.imagePostsContainer.style.display = 'none';
            this.textPostsContainer.style.display = 'none';
            this.floatingThoughtsContainer.style.display = 'block';
            this.activateTab(this.floatingThoughtsTabButton, this.imageTabButton, this.textTabButton);
            this.createFloatingThoughts();
        });
    }
    
    
    fetchAndDisplayPosts(data) {
        const postType = data;
        fetch(data)
            .then(response => response.json())
            .then(data => {
                data.forEach(item => {
                    const postElement = document.createElement('div');
                    postElement.classList.add('blog-post');

                    const title = document.createElement('h2');
                    title.textContent = item.title;
                    postElement.appendChild(title);
                    
                    if (postType === 'data/texts_data.json') {
                        this.addTextPost(postElement, item);
                    } else if (postType === 'data/images_data.json') {
                        this.addImagePost(postElement, item);
                    }
                });
            })
            .catch(error => console.error('Error fetching data:', error));
        
        this.activateDefaultTab();
    }

    addTextPost(container, item) {
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

    addImagePost(container, item) {
        const imagePath = `images/${item.image}`;
        const image = document.createElement('img');
        image.src = imagePath;
        container.appendChild(image);

        if (item.subtitle) {
            const subtitle = document.createElement('p');
            subtitle.classList.add('image-subtitle');
            subtitle.textContent = item.subtitle;
            container.appendChild(subtitle);
        }

        this.imagePostsContainer.appendChild(container);
    }

    activateDefaultTab() {
        this.textTabButton.classList.add('active');
        this.imageTabButton.classList.remove('active');
        this.imagePostsContainer.style.display = 'none';
        this.textPostsContainer.style.display = 'block';
    }

    activateTab(activeTab, ...inactiveTabs) {
        // Remove 'active' class from all tab buttons
        for (const tab of [activeTab, ...inactiveTabs]) {
            tab.classList.remove('active');
        }
        
        // Add 'active' class to the active tab button
        activeTab.classList.add('active');
    }    
}

const blog = new Blog();
blog.init();


