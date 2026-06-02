let dataPoints = [];
let numPoints = 10;
let rodLength;
let rodMass = 1;
let rodAngle = 1;
let rodAngularVelocity = 0;
let rodCenterX, rodCenterY;
let rodVelocityY = 0;
let springK = 1;
let damping = 0.99; // no damping by default
let rodInertia;
let fitCache = null;
let gridBuffer;

// === Rod dragging state ===
let isDraggingRod = false;
let rodDragOffsetX = 0;
let rodDragOffsetY = 0;
let rodDragAngleOffset = 0;

class DataPoint {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.hitboxRadius = this.radius * 4;
    this.isDragging = false;
  }

  contains(px, py) {
    return dist(px, py, this.x, this.y) < this.hitboxRadius;
  }

  draw() {
    noStroke();
    fill(this.isDragging ? '#FF4136' : this.contains(mouseX, mouseY) ? '#FF4136' : '#111111');
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
  createCanvas(1847, 976);
  pixelDensity(1);
  rodLength = max(width, height) * 1.2;
  rodCenterX = width / 2;
  rodCenterY = height / 2;
  rodInertia = (rodMass * rodLength * rodLength) / 12;

  let yStart = height / 2 + height / 4;
  let yEnd = height / 2 - height / 4;

  for (let i = 0; i < numPoints; i++) {
    let xPos = map(i, 0, numPoints - 1, 50, width - 50);
    let yPos = map(i, 0, numPoints - 1, yStart, yEnd) + random(-height * 0.05, height * 0.05);
    dataPoints.push(new DataPoint(xPos, yPos));
  }

  gridBuffer = createGraphics(width, height);
  drawGrid(gridBuffer, 40);
  fitCache = getLinearFitLine();
}

function draw() {
  background(255);
  image(gridBuffer, 0, 0);

  let cosAngle = cos(rodAngle);
  let sinAngle = sin(rodAngle);
  let tanAngle = tan(rodAngle);

  let totalForceY = 0, totalTorque = 0;

  for (let p of dataPoints) {
    const xi = p.x, yi = p.y;
    const rodY = rodCenterY + tanAngle * (xi - rodCenterX);
    const error = yi - rodY;
    const forceY = springK * error;
    const leverArm = xi - rodCenterX;
    const torque = forceY * leverArm;

    totalForceY += forceY;
    totalTorque += torque;
  }

  if (!isDraggingRod) {
    // Proper time step
    let dt = 1.0 / 60.0; // assume ~60fps

    // Angular dynamics
    let angularAcceleration = totalTorque / rodInertia;
    rodAngularVelocity += angularAcceleration * dt;
    rodAngularVelocity *= damping; // no damping if =1
    rodAngle += rodAngularVelocity * dt;

    // Linear dynamics
    let linearAcceleration = totalForceY / rodMass;
    rodVelocityY += linearAcceleration * dt;
    rodVelocityY *= damping; // no damping if =1
    rodCenterY += rodVelocityY * dt;
  }

  // Draw rod
  stroke('#1f77b4');
  strokeWeight(3);
  let rodX1 = rodCenterX - rodLength / 2 * cosAngle;
  let rodY1 = rodCenterY - rodLength / 2 * sinAngle;
  let rodX2 = rodCenterX + rodLength / 2 * cosAngle;
  let rodY2 = rodCenterY + rodLength / 2 * sinAngle;
  line(rodX1, rodY1, rodX2, rodY2);

  // Draw springs + points
  for (let p of dataPoints) {
    const rodY = rodCenterY + tanAngle * (p.x - rodCenterX);
    drawZigZagSpring(p.x, p.y, p.x, rodY, 3, 10);
    p.draw();
  }
}

function drawGrid(buffer, gridSpacing) {
  buffer.stroke(220);
  buffer.strokeWeight(0.5);
  for (let x = 0; x <= width; x += gridSpacing) buffer.line(x, 0, x, height);
  for (let y = 0; y <= height; y += gridSpacing) buffer.line(0, y, width, y);
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
    let dir = i % 2 === 0 ? 2 : -2;
    coords[i] = [x + dir * amplitude * u_n[0], y + dir * amplitude * u_n[1]];
  }
  coords[segments + 1] = [x2, y2];

  stroke(100);
  strokeWeight(1);
  noFill();
  beginShape();
  coords.forEach(([x, y]) => vertex(x, y));
  endShape();
}

function mouseNearRod(mx, my) {
  let cosAngle = cos(rodAngle);
  let sinAngle = sin(rodAngle);
  let rodX1 = rodCenterX - rodLength / 2 * cosAngle;
  let rodY1 = rodCenterY - rodLength / 2 * sinAngle;
  let rodX2 = rodCenterX + rodLength / 2 * cosAngle;
  let rodY2 = rodCenterY + rodLength / 2 * sinAngle;

  let A = mx - rodX1;
  let B = my - rodY1;
  let C = rodX2 - rodX1;
  let D = rodY2 - rodY1;
  let dot = A * C + B * D;
  let len_sq = C * C + D * D;
  let t = constrain(dot / len_sq, 0, 1);

  let projX = rodX1 + t * C;
  let projY = rodY1 + t * D;

  return dist(mx, my, projX, projY) < 15;
}

function touchStarted() {
  let mx = touches[0]?.x || mouseX;
  let my = touches[0]?.y || mouseY;

  for (let p of dataPoints) {
    if (p.contains(mx, my)) {
      p.isDragging = true;
      fitCache = null;
      return false;
    }
  }

  if (mouseNearRod(mx, my)) {
    isDraggingRod = true;
    rodDragOffsetX = mx - rodCenterX;
    rodDragOffsetY = my - rodCenterY;
    let mouseAngle = atan2(my - rodCenterY, mx - rodCenterX);
    rodDragAngleOffset = rodAngle - mouseAngle;
    return false;
  }
}

function touchMoved() {
  let mx = touches[0]?.x || mouseX;
  let my = touches[0]?.y || mouseY;

  for (let p of dataPoints) {
    if (p.isDragging) {
      p.x = constrain(mx, 0, width);
      p.y = constrain(my, 0, height);
      fitCache = null;
    }
  }

  if (isDraggingRod) {
    rodCenterX = mx - rodDragOffsetX;
    rodCenterY = my - rodDragOffsetY;

    let mouseAngle = atan2(my - rodCenterY, mx - rodCenterX);
    rodAngle = mouseAngle + rodDragAngleOffset;

    rodAngularVelocity = 0;
    rodVelocityY = 0;
  }
}

function touchEnded() {
  for (let p of dataPoints) {
    if (p.isDragging) {
      p.isDragging = false;
      fitCache = getLinearFitLine();
    }
  }

  if (isDraggingRod) {
    isDraggingRod = false;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  rodLength = max(width, height) * 1.2;
  rodCenterX = width / 2;
  rodCenterY = height / 2;
  rodInertia = (rodMass * rodLength * rodLength) / 12;
  gridBuffer = createGraphics(width, height);
  drawGrid(gridBuffer, 40);
  fitCache = getLinearFitLine();
}
