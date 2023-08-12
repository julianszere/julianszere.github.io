async function createFloatingThoughts() {
    const floatingThoughtsContainer = document.getElementById('floatingThoughts');

    try {
        const response = await fetch('data/thoughts_data.json');
        const thoughts = await response.json();

        thoughts.forEach((thoughtText, index) => {
            const thought = document.createElement('div');
            thought.textContent = thoughtText;
            thought.classList.add('floating-thought');
            thought.style.position = 'fixed';

            // Set random starting positions
            const randomX = Math.random() * window.innerWidth;
            const randomY = Math.random() * window.innerHeight;
            thought.style.left = `${randomX}px`;
            thought.style.top = `${randomY}px`;

            // Generate random horizontal and vertical speeds
            const randomHorizontalSpeed = (Math.random() - 0.5) * 2;
            const randomVerticalSpeed = (Math.random() - 0.5) * 2;
            thought.dataset.horizontalSpeed = randomHorizontalSpeed;
            thought.dataset.verticalSpeed = randomVerticalSpeed;

            floatingThoughtsContainer.appendChild(thought);
        });
    } catch (error) {
        console.error('Error fetching thoughts:', error);
    }
}

function animateFloatingThoughts() {
    const thoughts = document.querySelectorAll('.floating-thought');

    thoughts.forEach(thought => {
        const horizontalSpeed = parseFloat(thought.dataset.horizontalSpeed);
        const verticalSpeed = parseFloat(thought.dataset.verticalSpeed);

        const currentLeft = parseFloat(thought.style.left);
        const currentTop = parseFloat(thought.style.top);

        thought.style.left = `${currentLeft + horizontalSpeed}px`;
        thought.style.top = `${currentTop + verticalSpeed}px`;

        // Wrap the thoughts around the screen edges
        if (currentLeft > window.innerWidth) {
            thought.style.left = '-100px';
        }
        if (currentLeft < -100) {
            thought.style.left = `${window.innerWidth}px`;
        }
        if (currentTop > window.innerHeight) {
            thought.style.top = '-100px';
        }
        if (currentTop < -100) {
            thought.style.top = `${window.innerHeight}px`;
        }
    });

    requestAnimationFrame(animateFloatingThoughts);
}



createFloatingThoughts();
animateFloatingThoughts();
