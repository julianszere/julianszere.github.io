let dataPoints = [];
let numPoints = 10;
let rodLength;
let rodMass = 1;
let rodAngle = 1;
let rodAngularVelocity = 0;
let rodCenterX, rodCenterY;
let springK = 0.001;
let damping = 0.985;
let rodInertia;

class DataPoint {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 5; // Bigger for easier interaction
    this.hitboxRadius = this.radius * 4; // Even bigger hitbox for better drag detection
    this.isDragging = false;
  }

  contains(px, py) {
    return dist(px, py, this.x, this.y) < this.hitboxRadius;
  }

  draw() {
    noStroke();
    if (this.isDragging) {
      fill('#FF4136'); // red when dragging
    } else if (this.contains(mouseX, mouseY)) {
      fill('#FF4136'); // blue on hover
    } else {
      fill('#111111'); // black by default
    }

    stroke(255);
    strokeWeight(2);
    ellipse(this.x, this.y, this.radius * 2);
  }
}

function getLinearFitLine() {
  let n = dataPoints.length;
  if (n < 2) return null;

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let p of dataPoints) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }

  let meanX = sumX / n;
  let meanY = sumY / n;

  let slope = (sumXY - n * meanX * meanY) / (sumXX - n * meanX * meanX);
  let intercept = meanY - slope * meanX;

  return { slope, intercept };
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  rodLength = max(width, height) * 1.2;
  rodCenterX = width / 2;
  rodCenterY = height / 2;
  rodInertia = (rodMass * rodLength * rodLength) / 12;

  let yStart = height / 2 + height/4; // Start slightly above center
  let yEnd = height / 2 - height/4;   // End slightly below center

  for (let i = 0; i < numPoints; i++) {
    let xPos = map(i, 0, numPoints - 1, 50, width - 50);
    let yPos = map(i, 0, numPoints - 1, yStart, yEnd) + random(-height * 0.05, height * 0.05); // Linear tilt with some randomness
    dataPoints.push(new DataPoint(xPos, yPos));
  }
}


function draw() {
  background(255);
  drawGrid(40);
  drawAxes();
  // Draw linear regression line (rest rod)
  let fit = getLinearFitLine();
  if (fit) {
    let x1 = 0;
    let y1 = fit.slope * x1 + fit.intercept;
    let x2 = width;
    let y2 = fit.slope * x2 + fit.intercept;

    stroke(180); // light grey
    strokeWeight(1);
    line(x1, y1, x2, y2);
  }

  
  let totalForceY = 0, totalTorque = 0;

  for (let p of dataPoints) {
    const xi = p.x, yi = p.y;
    const rodY = rodCenterY + tan(rodAngle) * (xi - rodCenterX);
    const error = yi - rodY;
    const forceY = springK * error;
    const leverArm = xi - rodCenterX;
    const torque = forceY * leverArm;

    totalForceY += forceY;
    totalTorque += torque;
  }

  let angularAcceleration = totalTorque / rodInertia;
  rodAngularVelocity = rodAngularVelocity * damping + angularAcceleration;
  rodAngle += rodAngularVelocity;

  let linearAcceleration = totalForceY / rodMass;
  rodCenterY += linearAcceleration;

  stroke('#1f77b4');
  strokeWeight(3);
  let rodX1 = rodCenterX - rodLength / 2 * cos(rodAngle);
  let rodY1 = rodCenterY - rodLength / 2 * sin(rodAngle);
  let rodX2 = rodCenterX + rodLength / 2 * cos(rodAngle);
  let rodY2 = rodCenterY + rodLength / 2 * sin(rodAngle);
  line(rodX1, rodY1, rodX2, rodY2);

  for (let p of dataPoints) {
    const rodY = rodCenterY + tan(rodAngle) * (p.x - rodCenterX);
    drawZigZagSpring(p.x, p.y, p.x, rodY, 3, 20);
    p.draw();
  }
}

function drawGrid(gridSpacing) {
  stroke(220);
  strokeWeight(0.5);
  for (let x = 0; x <= width; x += gridSpacing) line(x, 0, x, height);
  for (let y = 0; y <= height; y += gridSpacing) line(0, y, width, y);
}

function drawAxes() {
  stroke(0);
  strokeWeight(1);
  line(0, height * 0.95, width, height * 0.95);
  line(width * 0.05, 0, width * 0.05, height);
}

function drawZigZagSpring(x1, y1, x2, y2, amplitude, segments) {
  if (x1 === x2 && y1 === y2) return;
  let length = dist(x1, y1, x2, y2);
  let u_t = [(x2 - x1) / length, (y2 - y1) / length];
  let u_n = [-u_t[1], u_t[0]];

  let coords = [[x1, y1]];
  for (let i = 1; i <= segments; i++) {
    let t = i / segments;
    let x = x1 + (x2 - x1) * t;
    let y = y1 + (y2 - y1) * t;
    let dir = i % 2 === 0 ? 1 : -1;
    coords.push([x + dir * amplitude * u_n[0], y + dir * amplitude * u_n[1]]);
  }
  coords.push([x2, y2]);

  stroke(150);
  strokeWeight(1);
  noFill();
  beginShape();
  coords.forEach(([x, y]) => vertex(x, y));
  endShape();
}

function touchStarted() {
  for (let p of dataPoints) {
    if (p.contains(touches[0]?.x || mouseX, touches[0]?.y || mouseY)) {
      p.isDragging = true;
      return false;
    }
  }
}

function touchMoved() {
  for (let p of dataPoints) {
    if (p.isDragging) {
      p.x = constrain(touches[0]?.x || mouseX, 0, width);
      p.y = constrain(touches[0]?.y || mouseY, 0, height);
    }
  }
}

function touchEnded() {
  for (let p of dataPoints) p.isDragging = false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  rodLength = width * 0.8;
  rodCenterX = width / 2;
  rodCenterY = height / 2;
}
