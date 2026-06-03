let numberOfPendulums = 9; // cantidad de péndulos
let numberOfCycles = 20; // cantidad de ciclos
let velocityOfSimulation = 2000;
let initialAngle = 20; // Initial angle of the pendulum

let pendulums = [];
let t = 0;
let l_max;
let c1;
let c2;
let pendulumSlider; // Slider to choose the number of pendulums
let cycleSlider; // Slider to choose the number of cycles
let velocitySlider; // Slider to choose the velocity
let angleSlider; // Slider to choose the initial angle

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  l_max = windowHeight * 0.8;
  // Gradiente de colores
  c1 = color(255, 0, 51);
  c2 = color(51, 0, 102);

  // Create a slider to choose the number of pendulums
  pendulumSlider = createSlider(1, 100, numberOfPendulums);
  pendulumSlider.position(windowWidth * 0.1, windowHeight * 0.1);
  pendulumSlider.style("width", "150px");

  // Create a slider to choose the number of cycles
  cycleSlider = createSlider(1, 100, numberOfCycles);
  cycleSlider.position(windowWidth * 0.1, windowHeight * 0.05);
  cycleSlider.style("width", "150px");

  // Create a slider to choose the velocity
  velocitySlider = createSlider(1000, 10000, velocityOfSimulation);
  velocitySlider.position(windowWidth * 0.1, windowHeight * 0.15);
  velocitySlider.style("width", "150px");

  // Create a slider to choose the initial angle
  angleSlider = createSlider(0, 90, initialAngle); // Adjust the range according to your needs
  angleSlider.position(windowWidth * 0.1, windowHeight * 0.2);
  angleSlider.style("width", "150px");

  for (let i = 0; i < numberOfPendulums; i++) {
    pendulums.push(new pendulum(length(i), initialAngle)); // Pass the initial angle to the pendulum constructor
  }
}

function draw() {
  if (
    numberOfPendulums != pendulumSlider.value() ||
    numberOfCycles != cycleSlider.value() ||
    velocityOfSimulation != velocitySlider.value() ||
    initialAngle != angleSlider.value()
  ) {
    // Update the pendulums array with the new number of pendulums

    // Clear the pendulums array
    pendulums = [];
    for (let i = 0; i < numberOfPendulums; i++) {
      pendulums.push(new pendulum(length(i))); // Pass the initial angle to the pendulum constructor
    }
  }

  numberOfPendulums = pendulumSlider.value();
  numberOfCycles = cycleSlider.value();
  velocityOfSimulation = velocitySlider.value();
  initialAngle = angleSlider.value();

  // Clear the background
  background(0);

  // Translate to the center of the canvas
  translate(width / 2, 0);

  // Update and display each pendulum
  for (let i = 0; i < pendulums.length; i++) {
    pendulums[i].move();
    pendulums[i].display();
  }
  t += 1; // steps, por cada frame el tiempo adelanta en t
}

// Calcula la longitud de cada péndulo en función de su posición
function length(n) {
  return l_max * (numberOfCycles / (numberOfCycles + n)) ** 2;
}

class pendulum {
  constructor(r) {
    this.theta = initialAngle; // Set the initial angle
    this.r = r;
    this.w = sqrt(velocityOfSimulation / this.r);
    this.c = lerpColor(c1, c2, this.r / l_max);
    this.s = (this.r / l_max) * 50;
  }

  move() {
    let newTheta = initialAngle * cos(this.w * t);
    this.theta = newTheta;
  }

  display() {
    fill(this.c);
    let x = this.r * sin(this.theta);
    let y = this.r * cos(this.theta);
    stroke(25);
    line(0, 0, x, y);
    noStroke();
    circle(x, y, this.s);
  }
}
