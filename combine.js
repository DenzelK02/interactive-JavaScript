let mic, micLevel;

let box, beatDur, filter, fft;
let beatPos = 0;
let layers = 16;
let steps = 16;
let activeSteps = [];
let osc = [];
let bpm = 140;
let playing = false;
let wave = 2;
const waveform = ["sine", "sawtooth", "triangle", "square"];
const scale = [55.0, 65.41, 73.42, 82.41, 87.31, 98.0, 110.0, 130.81, 
164.81, 174.61, 261.63, 293.66, 349.23, 440.0, 523.25, 587.33];

function setup() {
  let cnv = createCanvas(400, 400);
  cnv.mousePressed(userStartAudio); // Allow audio context to start on tap
  filter = new p5.LowPass();
  filter.drywet(1);
  fft = new p5.FFT();
  frameRate(30);
  box = width / steps;
  beatDur = round(6000 / bpm / 8);
  scale.reverse();
  makeGrid(false);

  // Microphone setup
  mic = new p5.AudioIn();
  mic.start();
}

function makeGrid(rnd) {
  for (let y = 0; y < layers; y++) {
    for (let x = 0; x < steps; x++) {
      fill(255);
      stroke(0);
      activeSteps.push([y, x]);
      if (rnd) {
        activeSteps[y][x] = random() > 0.95 ? 1 : 0;
      } else {
        activeSteps[y][x] = 0;
      }
      rect(x * box, y * box, box, box);
      osc[y] = new p5.Oscillator(waveform[wave]);
      osc[y].disconnect();
      osc[y].connect(filter);
    }
  }
}

function mousePressed() {
  let px = floor(mouseX / box);
  let py = floor(mouseY / box);
  if (activeSteps[py][px] == 1) {
    activeSteps[py][px] = 0;
    fill(255);
  } else {
    activeSteps[py][px] = 1;
    fill(0);
  }
  rect(px * box, py * box, box, box);
}

function keyPressed() {
  if (key === " ") {
    playing = !playing;
  }
  if (key === "r") {
    makeGrid(true);
  }
}

function playNote() {
  osc[l].start();
  osc[l].freq(scale[l], 0);
  osc[l].amp(0.5, 0);
  osc[l].amp(0, 0.25);
}

function draw() {
  background(0);

  // Microphone visualization
  fill(255);
  text('tap to start', width / 2, 20);

  micLevel = mic.getLevel();
  let y = height - micLevel * height;
  ellipse(width / 2, y, 10, 10); // Draw microphone visualization

  // Sequencer logic
  let freq = map(mouseX, 0, width, 60, 12000);
  freq = constrain(freq, 0, 22050);
  filter.freq(freq);
  filter.res(25);

  if (frameCount % beatDur == 0 && playing) {
    for (let l = 0; l < layers; l++) {
      fill(128, 64);
      if (activeSteps[l][beatPos] == 1) {
        fill(0);
      }
      playNote();
      rect(beatPos * box, l * box, box, box);
    }
    fill(255);
    let prevPos = beatPos - 1;
    if (prevPos < 0) {
      prevPos = steps - 1;
    }
    if (activeSteps[l][prevPos] == 1) {
      fill(0);
    }
    rect(prevPos * box, l * box, box, box);
    ++beatPos;
    if (beatPos == steps) {
      beatPos = 0;
    }
  }
}
