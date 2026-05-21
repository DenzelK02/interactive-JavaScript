let box, beatDur, mic, micLevel, clapTriggered = false;
let beatPos = 0;
let layers = 16;
let steps = 16;
let activeSteps = [];
let osc = [];
let bpm = 140;
let playing = false;

function setup() {
  createCanvas(400, 450); // Extra space for buttons
  box = width / steps;
  beatDur = round(6000 / bpm / 8);
  makeGrid(false);

  // Microphone setup
  mic = new p5.AudioIn();
  mic.start();

  // Green RESET Button
  let resetButton = createButton("RESET");
  resetButton.position(10, height - 30);
  resetButton.style("background-color", "lightgreen");
  resetButton.style("padding", "8px");
  resetButton.mousePressed(() => {
    makeGrid(false);
    beatPos = 0;
    playing = false;
    stopAllSound();
    console.log("Grid Reset");
  });

  // STOP Button
  let stopButton = createButton("STOP");
  stopButton.position(80, height - 30);
  stopButton.style("background-color", "lightgreen");
  stopButton.style("padding", "8px");
  stopButton.mousePressed(() => {
    playing = false;
    stopAllSound();
    console.log("Sequencer Stopped");
  });
}

function makeGrid(rnd) {
  activeSteps = [];
  for (let y = 0; y < layers; y++) {
    activeSteps[y] = [];
    for (let x = 0; x < steps; x++) {
      activeSteps[y][x] = rnd ? floor(random(2)) : 0;
      osc[y] = new p5.Oscillator('sine');
      osc[y].amp(0);
      osc[y].start();
    }
  }
}

function mousePressed() {
  let px = floor(mouseX / box);
  let py = floor(mouseY / box);
  if (px >= 0 && px < steps && py >= 0 && py < layers) {
    activeSteps[py][px] = activeSteps[py][px] == 1 ? 0 : 1;
    playSound(py); // Play sound when clicking
  }
}

function playSound(layer) {
  let frequency = 200 + layer * 30; // Adjust sound frequency per layer
  osc[layer].freq(frequency);
  osc[layer].amp(0.5, 0.1);
  osc[layer].amp(0, 0.2); // Fade out sound
}

function stopAllSound() {
  for (let i = 0; i < osc.length; i++) {
    osc[i].amp(0, 0.1);
  }
}

function draw() {
  background(255);

  // Clap Detection
  micLevel = mic.getLevel();
  let clapThreshold = 0.1; // Adjust for sensitivity
  if (micLevel > clapThreshold && !clapTriggered) {
    clapTriggered = true;
    playSound(beatPos % layers); // Play sound based on beat position
    bpm = constrain(bpm + 5, 60, 300); // Slight BPM increase
    beatDur = round(6000 / bpm / 8);
    playing = true; // Start sequencer
    console.log("Clap detected! BPM: " + bpm);
  } else if (micLevel < clapThreshold) {
    clapTriggered = false;
  }

  // Sequencer Logic
  if (frameCount % beatDur == 0 && playing) {
    for (let l = 0; l < layers; l++) {
      fill(activeSteps[l][beatPos] == 1 ? 0 : 255);
      rect(beatPos * box, l * box, box, box);
      if (activeSteps[l][beatPos] == 1) {
        playSound(l); 
      }
    }
    beatPos = (beatPos + 1) % steps; 
  }

  
  stroke(0);
  for (let y = 0; y < layers; y++) {
    for (let x = 0; x < steps; x++) {
      fill(activeSteps[y][x] == 1 ? 0 : 255);
      rect(x * box, y * box, box, box);
    }
  }
}
