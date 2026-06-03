let dataPoints = [];
let numPoints = 10;
let rodLength;
let rodMass = 1;
let rodAngle = 1;
let rodAngularVelocity = 0;
let rodCenterX, rodCenterY;
let rodVelocityY = 0;
let springK = 1;
let damping = 0.99;
let rodInertia;
let fitCache = null;
let gridBuffer;

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
  createCanvas(windowWidth, windowHeight);
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

  drawAxes();
  drawExactFitLine();

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
    let dt = 1.0 / 60.0;

    let angularAcceleration = totalTorque / rodInertia;
    rodAngularVelocity += angularAcceleration * dt;
    rodAngularVelocity *= damping;
    rodAngle += rodAngularVelocity * dt;

    let linearAcceleration = totalForceY / rodMass;
    rodVelocityY += linearAcceleration * dt;
    rodVelocityY *= damping;
    rodCenterY += rodVelocityY * dt;
  }

  // Springs (behind rod and points)
  for (let p of dataPoints) {
    const rodY = rodCenterY + tanAngle * (p.x - rodCenterX);
    drawZigZagSpring(p.x, p.y, p.x, rodY, 3, 10);
  }

  // Rod — draw edge-to-edge so it always spans the full canvas
  const rodActive = isDraggingRod || mouseNearRod(mouseX, mouseY);
  const rodColor = rodActive ? '#FF4136' : '#1f77b4';
  stroke(rodColor);
  strokeWeight(3);
  let ex1, ey1, ex2, ey2;
  if (abs(cosAngle) > 0.001) {
    ex1 = 0;     ey1 = rodCenterY + tanAngle * (0 - rodCenterX);
    ex2 = width; ey2 = rodCenterY + tanAngle * (width - rodCenterX);
  } else {
    ex1 = rodCenterX; ey1 = 0;
    ex2 = rodCenterX; ey2 = height;
  }
  line(ex1, ey1, ex2, ey2);

  // Data points (top layer)
  for (let p of dataPoints) {
    p.draw();
  }

  // Legend on top of everything
  drawLegend(rodColor);
}

function drawAxes() {
  stroke('#333');
  strokeWeight(1);

  // left spine
  line(0, 0, 0, height);
  // bottom spine
  line(0, height - 1, width, height - 1);

  const step = 40;
  for (let x = step; x < width; x += step) {
    line(x, height - 1, x, height - 6);
  }
  for (let y = 0; y < height - 1; y += step) {
    line(0, y, 6, y);
  }

  noStroke();
  fill('#333');
  textFont('Courier New');
  textSize(13);
  textAlign(RIGHT, BOTTOM);
  text('x', width - 5, height - 5);
  textAlign(LEFT, TOP);
  text('y', 5, 5);
}

function drawExactFitLine() {
  const fit = getLinearFitLine();
  if (!fit) return;
  const { slope, intercept } = fit;

  drawingContext.setLineDash([8, 5]);
  stroke('#aaa');
  strokeWeight(1.5);
  line(0, intercept, width, intercept + slope * width);
  drawingContext.setLineDash([]);
}

function drawLegend(rodColor) {
  const margin = 14;
  const padX = 10;
  const padY = 8;
  const lineLen = 22;
  const lineTextGap = 7;
  const rowH = 16;
  const rowGap = 6;

  textFont('Courier New');
  textSize(12);

  const label1 = 'Linear Rod';
  const label2 = 'Linear Fit';
  const label3 = 'Datapoints';
  const maxTextW = max(textWidth(label1), textWidth(label2), textWidth(label3));

  const boxW = padX + lineLen + lineTextGap + maxTextW + padX;
  const boxH = padY + rowH + rowGap + rowH + rowGap + rowH + padY;
  const bx = width - margin - boxW;
  const by = margin;

  fill(255);
  stroke('#cccccc');
  strokeWeight(0.8);
  rect(bx, by, boxW, boxH);

  // Linear Rod row
  const row1y = by + padY + rowH / 2;
  stroke(rodColor);
  strokeWeight(2.5);
  line(bx + padX, row1y, bx + padX + lineLen, row1y);
  noStroke();
  fill('#333');
  textAlign(LEFT, CENTER);
  text(label1, bx + padX + lineLen + lineTextGap, row1y);

  // Linear Fit row
  const row2y = by + padY + rowH + rowGap + rowH / 2;
  drawingContext.setLineDash([5, 3]);
  stroke('#aaa');
  strokeWeight(1.5);
  line(bx + padX, row2y, bx + padX + lineLen, row2y);
  drawingContext.setLineDash([]);
  noStroke();
  fill('#333');
  textAlign(LEFT, CENTER);
  text(label2, bx + padX + lineLen + lineTextGap, row2y);

  // Datapoints row
  const row3y = by + padY + 2 * (rowH + rowGap) + rowH / 2;
  fill('#111111');
  stroke(255);
  strokeWeight(2);
  ellipse(bx + padX + lineLen / 2, row3y, 10);
  noStroke();
  fill('#333');
  textAlign(LEFT, CENTER);
  text(label3, bx + padX + lineLen + lineTextGap, row3y);
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
  let d = abs(-sin(rodAngle) * (mx - rodCenterX) + cos(rodAngle) * (my - rodCenterY));
  return d < 15;
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
