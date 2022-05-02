let video;
let poseNet;
let pose;
let d;

let ready = false;
let masterVolume = -9; // in decibels (dB);
let faceVolume;

let scale;

let synth;
let currentNote;

let pattern;
let sequence = [0, 2, 4, 6];

let track;

patternType = [
  "up", //0
  "down", //1
  "upDown", //2
  "downUp", //3
  "alternateUp", //4
  "alternateDown", //5
  "random", //6
  "randomOnce", //7
  "randomWalk", //8
];

//------------------------------------------------------------
// ------------------------------------------------------------------
// Code placed in setup() will run once at the beginning
function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.hide();
  //poseNet init
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", gotPoses);
  //Tonal.js init
  scale = Tonal.Scale.get("C4 major").notes;
}

// ------------------------------------------------------------------
// Callbacks checking for PoseNet's status

// Initial load
function modelLoaded() {
  console.log("poseNet ready");
}

// Check for poses
function gotPoses(poses) {
  // console.log(poses);
  if (poses.length > 0) {
    pose = poses[0].pose;
  }
}

//------------------------------------------------------------
// Place all the Tone.js initialization code here
function initializeAudio() {
  track = new Track("16n", "8t", 8);
  track2 = new Track("8n", "8n", 5, -7);
  track3 = new Track("4n", "4n", 1, -14);
  Tone.Master.volume.value = masterVolume;
  Tone.Transport.start();
}

// ------------------------------------------------------------------
// On window resize, update the canvas size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ------------------------------------------------------------------
// Main render loop - code placed in draw() will repeat over and over
function draw() {
  // Place your drawing code here
  image(video, 0, 0);

  if (pose) {
    let eyeR = pose.rightEye;
    let eyeL = pose.leftEye;
    let d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
    fill(255, 0, 0);
    ellipse(pose.nose.x, pose.nose.y, d - 20);

    faceVolume = map(d, 50, 300, -30, 6);
    Tone.Master.volume.value = faceVolume;

    // text(faceVolume, 100, 100);

    // ellipse(pose.leftWrist.x, pose.leftWrist.y, d);
    // ellipse(pose.rightWrist.x, pose.rightWrist.y, d);
  }

  if (ready) {
    noStroke();
    fill(255);
    textSize(100);
    textAlign(CENTER, CENTER);
    text(track.currentNote, width / 2, height / 2);
  } else {
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    text("CLICK TO START", width / 2, height / 2);
  }
}

//------------------------------------------------------------

function mapNote(noteNumber, scale) {
  let numNotes = scale.length;
  let i = modulo(noteNumber, numNotes);
  let note = scale[i];
  // ** fixed!  should now work with scales that don't start
  // in C :-)
  // thanks to YouTube user Mark Lee for pointing this out!
  let octaveTranspose = floor(noteNumber / numNotes);
  let interval = Tonal.Interval.fromSemitones(octaveTranspose * 12);
  return Tonal.Note.transpose(note, interval);
}

//------------------------------------------------------------
function modulo(n, m) {
  return ((n % m) + m) % m;
}

//------------------------------------------------------------
function mousePressed() {
  if (!ready) {
    // ! means 'not'
    ready = true;
    initializeAudio();
  }
}

//------------------------------------------------------------
// patternType options: "up" | "down" | "upDown" | "downUp" | "alternateUp" | "alternateDown" | "random" | "randomOnce" | "randomWalk"
class Track {
  constructor(
    noteDuration = "8n",
    interval = "8n",
    patternIndex = 4,
    transpose = 0
  ) {
    this.patternIndex = patternIndex;
    this.transpose = transpose;
    this.noteDuration = noteDuration;
    this.interval = interval;
    this.synth = new Tone.AMSynth();
    this.synth.toDestination();

    this.pattern = new Tone.Pattern(
      (time, index) => {
        let note = mapNote(sequence[index] + this.transpose, scale);
        this.synth.triggerAttackRelease(note, this.noteDuration, time);
        this.currentNote = note;
      },
      Array.from(sequence.keys()),
      patternType[this.patternIndex]
    );

    this.pattern.interval = this.interval;
    this.pattern.start();
    this.currentNote;
  }
}
