const width = 120;
const height = 40;
const grid = Array.from({ length: height }, () => Array(width).fill(' '));

// Create multiple walkers with random starting positions
const walkers = [
    { x: Math.floor(Math.random() * width), y: Math.floor(Math.random() * height), symbol: 'A' },
    { x: Math.floor(Math.random() * width), y: Math.floor(Math.random() * height), symbol: 'B' },
    { x: Math.floor(Math.random() * width), y: Math.floor(Math.random() * height), symbol: 'C' },
    { x: Math.floor(Math.random() * width), y: Math.floor(Math.random() * height), symbol: 'D' },
    { x: Math.floor(Math.random() * width), y: Math.floor(Math.random() * height), symbol: 'E' }
];

function randomLetter() {
    return String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
}

function draw() {
    const tempGrid = grid.map(row => row.slice()); // clone grid
    walkers.forEach(w => {
        tempGrid[w.y][w.x] = w.symbol;
    });
    document.getElementById('random-walk').textContent =
        tempGrid.map(row => row.join('')).join('\n');
}

function step(walker) {
    // Leave a trail of random letters
    grid[walker.y][walker.x] = randomLetter();

    // Random movement
    const direction = Math.floor(Math.random() * 4);
    switch (direction) {
        case 0: // up
            if (walker.y > 0) walker.y--;
            break;
        case 1: // down
            if (walker.y < height - 1) walker.y++;
            break;
        case 2: // left
            if (walker.x > 0) walker.x--;
            break;
        case 3: // right
            if (walker.x < width - 1) walker.x++;
            break;
    }

    // Occasionally teleport to a random position
    if (Math.random() < 0.05) {
        walker.x = Math.floor(Math.random() * width);
        walker.y = Math.floor(Math.random() * height);
    }
}

function animate() {
    walkers.forEach(step);
    draw();
}

draw();
setInterval(animate, 200);
