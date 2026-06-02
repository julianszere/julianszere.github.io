class ThoughtBuilder {
  constructor() {
    this.container = document.getElementById('thoughtsPosts');
    this.thoughts = [];
    this.currentIndex = 0;
    this.fetchThoughts('data.json');
  }

  async fetchThoughts(data) {
    try {
      const response = await fetch(data);
      this.thoughts = await response.json();

      if (this.thoughts.length === 0) {
        this.container.textContent = 'No thoughts available.';
        return;
      }

      this.renderUI();
      this.showThought(this.currentIndex);
    } catch (error) {
      console.error('Error fetching thoughts:', error);
      this.container.textContent = 'Error loading thoughts.';
    }
  }

  renderUI() {
    // Clear container
    this.container.innerHTML = '';

    this.thoughtDisplay = document.createElement('div');
    this.thoughtDisplay.classList.add('thought');

    this.button = document.createElement('button');
    this.button.classList.add('regenerate-button');
    this.button.setAttribute('aria-label', 'Regenerar pensamiento');

    // Insert SVG cycle icon inside button
    this.button.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.31-.5 2.5-1.32 3.41l1.46 1.46C19.46 15.04 20 13.58 20 12c0-4.42-3.58-8-8-8zm-6.36 2.46L4.22 7.88C3.51 9.24 3 10.58 3 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3c-3.31 0-6-2.69-6-6 0-1.31.5-2.5 1.32-3.41z"/>
    </svg>
    `;

    // Add both to container inline
    this.container.appendChild(this.thoughtDisplay);
    this.container.appendChild(this.button);

    this.button.addEventListener('click', () => this.showNextThought());

  }

  showThought(index) {
    this.thoughtDisplay.textContent = this.thoughts[index];
  }

  showNextThought() {
    this.currentIndex = (this.currentIndex + 1) % this.thoughts.length;
    this.showThought(this.currentIndex);
  }
}

// Initialize
const thoughtBuilder = new ThoughtBuilder();
