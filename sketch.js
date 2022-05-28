// -----------------------------------------------------------------------
// variable declaration

let poses = [];
let video;

let prevNote;
let poseNet;
let globalTick = -1;

let canvasCenter = 640 / 2;
const scale = Tonal.Scale.get("g minor").notes;

const defaultPose = {
  nose: { x: 10, y: 10, confidence: 0.4 },
  leftWrist: { x: 30, y: 30, confidence: 0.4 },
  rightWrist: { x: 60, y: 30, confidence: 0.4 }
};

let playing = false;
let started = false;
let amenVolume;
let chordPattern;

let currentStep;
let currentBeat = 0;

let amenStarted = false;
let ghostMomentStarted = false;


// CONSOLE STYLES
const logSuccess = [
  "color: #52B95F",
  "display: block",
  "text-align: center",
  'font-family: "IBM Plex Mono", monospace',
  "font-weight: bold"
].join(";");

const logWarning = [
  "color: #F16D37",
  'font-family: "IBM Plex Mono", monospace'
].join(";");

// -----------------------------------------------------------------------
// p5.js code

function setup() {
  cnv = createCanvas(640, 480);

  canvasCenter = width / 2;

  cnv.id("p5-canvas");
  cnv.parent("p5-holder");
  angleMode(DEGREES);

  // create a capture
  video = createCapture(VIDEO);
  video.id("p5-capture");
  video.parent("p5-holder");

  video.size = (640, 480);
  // video.hide();

  // feed capture to poseNet
  //poseNet
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", function(results) {
    poses = results;

    if (poses[0] !== undefined) {
      triangleA.playChords();
      triangleA.initialized = true;
      return triangleA.initialized;
    }

    if (poses[1] !== undefined) {
      triangleB.playChords();
      triangleB.initialized = true;
      return triangleA.initialized;
    }

    // triangleA.currentPose();

    // console.log(triangleA.pose);
  });
}

// ------------------------------------------------------------------
// Callbacks checking for PoseNet's status

// Initial load
function modelLoaded() {
  console.log("poseNet ready");
}

// ------------------------------------------------------------------
// draw
function draw() {
  background(120, 0);
  tint(255, 60);
  // image(video, 0, 0, width, height);

  if (frameCount % 30 === 0) {
    clear();
  }

  strokeWeight(2);
  angleMode(DEGREES);

  if (poses.length !== 0) {
    for (let i = 0; i < poses.length; i++) {
      let pose = poses[i].pose;
      if (pose.nose && pose.leftWrist && pose.rightWrist) {
        poseShape(i);
      } else {
        noseToLeft = "undefined";
        noseToRight = "undefined";
        leftHandToRight = "undefined";
      }
    }
  }
}

function drawLandmarks(confidence) {
  //   loop through all detected poses
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;

    // loop through detected landmarks with a confidence above 0.7
    for (let j = 0; j < pose.keypoints.length; j++) {
      let landmark = pose.keypoints[j];

      if (landmark.score > confidence) {
        noFill();
        let posX = landmark.position.x; //map(landmark.position.x, 0, 640, 0, windowWidth);
        let posY = landmark.position.y; //map(landmark.position.y, 0, 480, 0, windowWidth * 0.75);
        text(landmark.part, posX, posY, 10);
      }
    }
  }
}

function poseShape(poseIndex) {
  let pose = poses[poseIndex].pose;

  let nose = pose.nose;
  let leftHand = pose.leftWrist;
  let rightHand = pose.rightWrist;

  if (
    leftHand.confidence > 0.4 &&
    rightHand.confidence > 0.4 &&
    nose.confidence > 0.4
  ) {
    noFill();
    if (nose.x < canvasCenter + 50 && nose.x > canvasCenter - 50) {
      stroke(120, 255, 175);
    } else {
      stroke(255, 255, 200);
    }

    strokeWeight(3);
    beginShape(TRIANGLES);
    vertex(nose.x, nose.y + 50);
    vertex(leftHand.x, leftHand.y);
    vertex(rightHand.x, rightHand.y);
    endShape();

    document.getElementById("pose-xy").innerHTML = `N: ${floor(
      random() * 10
    )} | R: ${floor(random() * 10)} | L: ${floor(random() * 10)} | SUM: ${floor(
      random() * 10
    )}`;

    // return triangleNotes;

    // return angleN, angleL, angleR, angleSum, triangleSides
  }
}

function loadTriangles(poses) {
  currentPoseLength = 0;

  if (poses.length == !currentPoseLength) {
    for (let i = 0; i < poses.length; i++) {
      triangles[i] = new Triangle(poses[i].pose);
      triangles[i].confidenceInit();
      triangles[i].draw();
      return triangles[i];
    }
    return (currentPoseLength = poses.length);
  }
  currentPoseLength = poses.length;
}

class Triangle {
  constructor(index) {
    this.index = index;

    // this.pose = poses[index].pose;

    this.initialized = false;
  }
  get currentPose() {
    if (poses.length !== 0) {
      this.pose = poses[this.index].pose;
      this.nose = this.pose.nose;
      this.leftHand = this.pose.leftWrist;
      this.rightHand = this.pose.rightWrist;
    } else {
      this.pose = defaultPose;
    }

    return this.pose;
  }

  poseReady() {
    poseNet.on("pose", result => {
      this.pose = result[this.index];
      this.playChords();
    });
  }

  poseCheck() {
    if (this.index >= poses.length) {
      this.pose = poses[this.index].pose;
      console.log("ready");
      return "ready";
    } else {
      this.pose = defaultPose.pose;
      console.log("waiting");
      return "waiting";
    }
  }

  initializeAudio() {
    this.vol = new Tone.Volume(-15).toDestination();

    console.log("%c TRIANGLE INITIALIZED", logSuccess);

    this.synthN = new Tone.Synth({
      portamento: 0.00625,
      oscillator: { type: "triangle" },
      envelope: { release: 0.07 }
    }).connect(this.vol);

    this.synthL = new Tone.FMSynth({
      portamento: 0.0125
    }).connect(this.vol);

    this.synthR = new Tone.FMSynth({
      portamento: 0.0125
    }).connect(this.vol);

    this.arpLimiter = new Tone.Limiter(-20).toDestination();

    this.arpSynth = new Tone.PolySynth({
      oscillator: { type: "sine" }
    }).connect(this.arpLimiter);

    this.lowArpSynth = new Tone.PolySynth({
      oscillator: { type: "sawtooth3" },
      attack: 0.7
    }).connect(this.arpLimiter);

    //------- PATTERNS ----------- //
    this.globalTick = globalTick;
    console.log(`%c playChords read, ${globalTick}`, logSuccess);

    this.chordLoop = new Tone.Loop(time => {
      this.mtd = Tone.Ticks("4n") === 0 ? "triggerAttack" : "setNote";
      this.currentNote = this.findNotes();
      console.log(
        `current chord: ${this.currentNote.n +
          this.currentNote.l +
          this.currentNote.r}`
      );
      this.synthN.triggerAttack(this.currentNote.n + "5", time);
      this.synthL.triggerAttack(this.currentNote.l + "4", time);
      this.synthR.triggerAttack(this.currentNote.r + "3", time);
      this.chordsPlaying = true;
      this.initialized = true;
      return this.initialized;
    }, "1n");
  }

  /*{
      urls: {

        // "B3" : "assets/logueKeys/logueKeys-B3.wav",
        "G2" : "assets/logueKeys/logueKeys-G3.wav",
        // "B4" : "assets/logueKeys/logueKeys-B4.wav",
        // "D4" : "assets/logueKeys/logueKeys-D4.wav",
        // "F#4": "assets/logueKeys/logueKeys-Fsharp4.wav",
        "G3" : "assets/logueKeys/logueKeys-G4.wav",
        // "B5" : "assets/logueKeys/logueKeys-B5.wav",
        "D6" : "assets/logueKeys/logueKeys-D5.wav",
        "F#6" : "assets/logueKeys/logueKeys-Fsharp5.wav",
        "E7" : "assets/logueKeys/logueKeys-E6.wav",
      },
      release: 0.1
    }).sync().connect(this.vol);*/

  confidenceInit() {
    this.pose = this.currentPose;
    if (this.nose.confidence > 0.4) {
      this.playChords();
    } else {
      // this.stop();
      console.log("%cBelow confidence threshold", logWarning);
    }
  }

  draw(confidence = 0.4) {
    if (
      // this.leftHand.confidence > confidence &&
      // this.rightHand.confidence > 0.4 &&
      this.nose.confidence > confidence
    ) {
      noFill();
      if (this.nose.x < canvasCenter + 50 && this.nose.x > canvasCenter - 50) {
        stroke(120, 255, 175);
      } else {
        stroke(255, 255, 200);
      }

      strokeWeight(5);
      beginShape(TRIANGLES);
      vertex(this.nose.x, this.nose.y + 50);
      vertex(this.leftHand.x, this.leftHand.y);
      vertex(this.rightHand.x, this.rightHand.y);
      endShape();
    }
  }

  findNotes() {
    // console.log("DEBUG AGH", this.nose.x)
    this.pose = this.currentPose;
    // console.log(this.pose);
    this.sideN = dist(
      this.leftHand.x,
      this.leftHand.y,
      this.rightHand.x,
      this.rightHand.y
    );
    this.sideL = dist(
      this.rightHand.x,
      this.rightHand.y,
      this.nose.x,
      this.nose.y
    );
    this.sideR = dist(
      this.nose.x,
      this.nose.y,
      this.leftHand.x,
      this.leftHand.y
    );

    this.angleN = this.calcAngle(this.sideN, this.sideL, this.sideR);
    this.angleL = this.calcAngle(this.sideL, this.sideR, this.sideN);
    this.angleR = this.calcAngle(this.sideR, this.sideN, this.sideL);

    this.noteN = scale[this.angleN % 7];
    this.noteL = scale[this.angleL % 7];
    this.noteR = scale[this.angleR % 7];

    return { n: this.noteN, l: this.noteL, r: this.noteR };
  }

  calcAngle(sideA, sideB, sideC) {
    this.angle = Math.floor(
      acos((sideB ** 2 + sideC ** 2 - sideA ** 2) / (2 * (sideB * sideC)))
    );

    if (this.angle === Infinity || isNaN(this.angle)) {
      console.log(`%c Magic Zero just happened: angle=${this.angle},
        \n ${sideA}, ${sideB}, ${sideC}`);
      this.angle = 90;
    }
    return this.angle;
  }

  printToDOM(id = "pose-xy") {
    document.getElementById(
      id
    ).innerHTML = `N: ${this.angleN} | R: ${this.angleR} | L: ${this.angleL}`;
  }

  stop() {
    // this.hiSeq.stop();
    // this.loSeq.stop();
    this.chordLoop.stop(0);
    // this.synthN.disconnect();
    // this.synthL.disconnect();
    // this.synthR.disconnect();
    // this.arpSynth.disconnect();
  }

  playChords() {
    if (this.initialized === true) {
      this.chordLoop.start(Tone.context.currentTime);
      this.initialized = false;
    }
  }

  playArp() {
    this.currentNote = this.findNotes();

    this.hiSeq = new Tone.Sequence(
      (time, note) => {
        this.arpSynth.triggerAttackRelease(note, "16n", time);
      },
      [
        getPattern(2, 3, this.currentNote.n + "4", null),
        this.currentNote.l + "5"
      ],
      "1n"
    ).start(Tone.context.currentTime);

    this.loSeq = new Tone.Sequence(
      (time, note) => {
        this.lowArpSynth.triggerAttackRelease(note, "32n", time);
        console.log(`arp playing : ${note}`);
      },
      [
        getPattern(2, 3, this.currentNote.r + "3", null),
        [getPattern(2, 5, this.currentNote.n + "2", null)]
      ],
      "1m"
    ).start(Tone.context.currentTime);
  }

  midiHandler(value) {
    console.log(`message :${value}`);

    if (
      value === 127 &&
      this.nose.x < canvasCenter + 50 &&
      this.nose.x > canvasCenter - 50
    ) {
      this.pedalCount = 0;
      this.pedalCount++;
      if (this.pedalCount % 2 == 0) {
        this.hiSeq.stop();
        // this.loSeq.stop();
        this.playChords();
        console.log("%cChords playing", logSuccess);
      } else {
        // this.chordLoop.stop(Tone.now(0));
        // this.synthN.stop(Tone.now());
        // this.synthL.stop(Tone.now());
        // this.synthR.stop(Tone.now());
        // this.arpSynth.start(0);
        this.hiSeq.start(Tone.context.currentTime);
        // this.loSeq.start(0);
      }
    }
  }
}

const triangleA = new Triangle(0);
triangleA.initializeAudio();

const triangleB = new Triangle(1);
triangleB.initializeAudio();

function transposeNote(note, oct) {
  noteTransposed = note.charAt() + (+note(note.length - 1) + oct);
  return noteTransposed;
}

// -----  INITIALIZE AUDIO ----- \\

function configPlayButton() {
  const button = document.getElementById("play-button");

  button.addEventListener("click", e => {
    console.log("clicked");

    Tone.start(Tone.context.currentTime + 0.1);
    if (!started) {
      initializeAudio();

      started = true;

      //       read midi
      const midi = new midiAccess({ onDeviceInput });
      midi
        .start()
        .then(() => {
          console.log("STARTED!");
        })
        .catch(console.error);
    }

    if (playing) {
      e.target.innerText = "Play";
      Tone.Transport.stop();
      amen.stop();
      triangleA.stop();
      triangleB.stop();
      playing = false;
    } else {
      e.target.innerText = "Stop";
      Tone.Transport.start();
      triangleA.playChords();
      triangleB.playArp();
      console.log((Tone.Transport.debug = true));
      // chordPattern.start();

      playing = true;
    }
  });
}

function initializeAudio() {
  //------------------ EFFECT & VOLUMES INIT ---------------

  /*Tone.getDestination().volume.rampTo(-10, 0.001);
  const amenVolume = new Tone.Volume(-10).toDestination();
  const hatVolume = new Tone.Volume(-25).toDestination(); */
  // const chordFilter = new Tone.AutoFilter("1n");

  // INITIALIZE BEAT
  Tone.Transport.scheduleRepeat(time => {
    globalTick = globalTick + 1;
    currentStep = globalTick % 4;
    if (currentStep === 0) {
      currentBeat = currentBeat + 1;
      return globalTick;
    }



    document.getElementById("transport").innerHTML = `${Math.floor(
      time
    )} | ${currentBeat}:${currentStep + 1}`;
  }, "4n");

  // CONNECT

  // /*hatSampler.connect(hatVolume);
  chordSampler.toDestination();
  // amen.connect(amenVolume);*/

  /*------------------PATTERNS AND SEQUENCES--------------------

  //----------------- patternType options: ----------------------/
  // ------------"up" | "down" | "upDown" | "downUp" |-----------/
  // --------"alternateUp" | "alternateDown" | "random" | -------/
  // ----------------"randomOnce" | "randomWalk"----------------*/

  chordPattern = new Tone.Pattern(
    (time, note) => {
      chordSampler.triggerAttackRelease(note, "1n", time);
    },
    ["A4", "D4", "E4", "G4", "G5"],
    "randomOnce"
  );
  chordPattern.interval = "1m";

  // START TONE.JS EVENTS
  // chordPattern.start();

  Tone.Transport.bpm.value = 160;

  // hatsSeq.start();
}

//-----------------     INSTRUMENTS     ---------------------

const chordSampler = new Tone.Sampler({
  urls: {
    A4: "assets/chords/surgeChords - A6add9.wav",
    D4: "assets/chords/surgeChords - Dmaj7Add13.wav",
    E4: "assets/chords/surgeChords - Emin6add9.wav",
    G4: "assets/chords/surgeChords - Gb11b9.wav",
    G5: "assets/chords/surgeChords - Gmaj7add13.wav"
  }
});

const obxKeys = new Tone.Sampler({
  urls: {
    G3: "assets/obxHarp/obxHarp - G3.wav",
    G4: "assets/obxHarp/obxHarp - G4.wav",
    G5: "assets/obxHarp/obxHarp - G5.wav"
  },
  release: 0.1
}).toDestination();
obxKeys.volume.value = -10;



const amen = new Tone.GrainPlayer({
  url: "assets/drums/amen_160bpm.wav",
  playbackRate: 1,
  grainSize: 0.1,
  loop: true,
  overlap: 0.01
});

const ghostMoment = new Tone.GrainPlayer({
  url: "assets/drums/ghostMoments_130bpm.wav",
  playbackRate: 1.2307,
  grainSize: 0.1,
  loop: true,
  overlap: 0.01
});

// INITIALIZE SEQUENCER
window.addEventListener("DOMContentLoaded", () => {
  configPlayButton();
});

// p5 remap function
function reMap(value, istart, istop, ostart, ostop) {
  return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
}


class midiAccess {
  constructor(args = {}) {
    this.onDeviceInput = args.onDeviceInput || console.log;
  }

  start() {
    return new Promise((resolve, reject) => {
      this._requestAccess()
        .then(access => {
          this.initialize(access);
          resolve();
        })
        .catch(() => reject("Something went wrong."));
    });
  }

  initialize(access) {
    const devices = access.inputs.values();
    this.devices = [];
    for (let device of devices) {
      this.initializeDevice(device);
      this.devices.push(device);
    }
  }

  initializeDevice(device) {
    device.onmidimessage = this.onMessage.bind(this);
  }

  onMessage(message) {
    let [address, input, value] = message.data;
    this.target = message.target;
    this.message = message;
    this.onDeviceInput({ address, input, value });
    return this.target, this.message;
  }

  _requestAccess() {
    return new Promise((resolve, reject) => {
      if (navigator.requestMIDIAccess)
        navigator
          .requestMIDIAccess()
          .then(resolve)
          .catch(reject);
      else reject();
    });
  }
}


const midi = new midiAccess({ onDeviceInput });
midi
  .start()
  .then(() => {
    for (let i = 0; i < midi.devices.length; i++) {
      let device = midi.devices[i];
      console.log(
        `%c  -- ${device.name} --  \n     Port ID: ${device.id}     `,
        logSuccess
      );
    }
    console.log("%c MIDI STARTED!", logSuccess);
  })
  .catch(console.error);




//EDITED onDeviceInput to use switch/case instead of if / esle


/*function onDeviceInput({ address, input, value }) {
  if (address === 128 || address === 144) {
    let note = Tonal.Note.fromMidi(input);
    handleMIDINote(address, note);
    console.log(
      `Device: ${midi.target.name}\nnote:${note}, address: ${address}`
    );
  } else if (midi.target.name === "MPKmini2") {
    console.log("MPKmini2", address, input);
    handleCCMessage(address, input, value);
  } else if (midi.target.name === "A-PRO 2") {
    console.log("A-PRO 2", address, input);
  } else {
    noMIDI(address, input, value);
  }
}*/

function onDeviceInput({ address, input, value }) {
  switch (address) {
  case 176:
    switch (input) {
    case 1:

      break;
    case 2:
      bassSynth.envelope.decay = value;
      break;
    case 3:
      bassSynth.envelope.release = value;
      break;
    case 20:
      if (!amenStarted) {
        amen.start("@4n");
        console.log("Amen started!");
        amenStarted = true;
        return amenStarted;
      } else if (amenStarted) {
        amen.stop(0);
        amenStarted = false;
        console.log(`AmenStarted : ${amenStarted} `);
        return amenStarted;
      } else {
        console.log(`%c AMEN BROKE`, logWarning);
      }
      break;
    case 21:
      if (!ghostMomentStarted) {
        ghostMoment.start("@4n").toDestination();
      } else if (ghostMomentStarted) {
        ghostMoment.stop("@4n");
      } else {
        console.log(`%c GHOST MOMENT BROKE`, logWarning);
      }
      break;
    case 64:
      console.log(`%c Pedal; no signal (value: ${value})`, logWarning);
      // if (poses.length != 0) {
      //   for (let i = 0; i < poses.length; i++) {
      // triangleA.midiHandler(value);
      if (
        triangleA.pose.nose.x !== undefined &&
            nose.x < canvasCenter + 50 &&
            nose.x > canvasCenter - 50
      ) {
        triangleA.stop(0);
        triangleA.playArp();
      }
      break;

    default:
      noMIDI(address, input, value);
    }
    break;
  case 144:
    note = Tonal.Note.fromMidi(input);
    obxKeys.triggerAttackRelease(note, "0");
    console.log(
      `Device: ${midi.target.name}\nnote:${note}, address: ${address}`
    );
    break;
  default:
    noMIDI(address, input, value);
  }
}

function handleMIDINote(address, note) {
  if (address === 144) {
    obxKeys.triggerAttackRelease(note, "0");
    console.log(`%cbassSynth`);
  } else {
    return;
  }
}

function noMIDI(address, input, value) {
  console.log(
    `%c${midi.target.name} has not been configured in toneMidi.js
      \nAddress: ${address} | Input: ${input} | Value: ${value}`,
    logWarning
  );
}


// ALGORITHM FOR EUCLIDEAN RHYTHMS

function getPattern(pulses, steps, note) {
  //retrieved from https://github.com/mkontogiannis/euclidean-rhythms;
  // edited to return notes
  if (pulses < 0 || steps < 0 || steps < pulses) {
    return [];
  }

  // Create the two arrays
  var first = new Array(pulses).fill([note]);
  var second = new Array(steps - pulses).fill([null]);

  var firstLength = first.length;
  var minLength = Math.min(firstLength, second.length);

  var loopThreshold = 0;
  // Loop until at least one array has length gt 2 (1 for first loop)
  while (minLength > loopThreshold) {
    // Allow only loopThreshold to be zero on the first loop
    if (loopThreshold === 0) {
      loopThreshold = 1;
    }

    // For the minimum array loop and concat
    for (var x = 0; x < minLength; x++) {
      first[x] = Array.prototype.concat.call(first[x], second[x]);
    }

    // if the second was the bigger array, slice the remaining elements/arrays and update
    if (minLength === firstLength) {
      second = Array.prototype.slice.call(second, minLength);
    }
    // Otherwise update the second (smallest array) with the remainders of the first
    // and update the first array to include onlt the extended sub-arrays
    else {
      second = Array.prototype.slice.call(first, minLength);
      first = Array.prototype.slice.call(first, 0, minLength);
    }
    firstLength = first.length;
    minLength = Math.min(firstLength, second.length);
  }

  // Build the final array
  var pattern = [];
  first.forEach(function(f) {
    pattern = Array.prototype.concat.call(pattern, f);
  });
  second.forEach(function(s) {
    pattern = Array.prototype.concat.call(pattern, s);
  });

  return pattern;
}
