let myLoop;
let synth;
let scale = Tonal.Scale.get("c5 major");
let scaleLength = scale.notes.length;

// randomization
let noiseNumber;
let randomNote;

//------------------------------------------------------------
// Place all tone.js init code here

function initializeAudio() {
  Tone.Transport.bpm.value = 100;

  //   randomization
  // noiseNumber = noise(0.05) * modulo(frameCount, 7) * 10;
  // randomNote = floor(map(noiseNumber, 1, 9, 0, scaleLength));

  synth = new Tone.PolySynth({
    oscillator: {
      type: "sine",
    },
  });

  let chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination();

  synth.connect(chorus);

  myLoop = new Tone.Loop((time) => {
    synth.triggerAttackRelease(["C3", "E4"], "16n", time);
  }, "1n").start();

  handLoop = new Tone.Loop((time) => {
    synth.triggerAttackRelease(handNotes(), "32n", time);
  }, "4n").start();

  //   loop through hands and return a note

  function handNotes() {
    for (let i = 0; i < poses.length; i++) {
      let leftHand = poses[i].pose.leftWrist;

      if (leftHand.confidence > 0.5) {
        noteIndex = floor(map(leftHand.x, 0, 640, 0, scaleLength));
        console.log(noteIndex);
        return scale.notes[noteIndex];
      } else {
  
        // return scale.notes[floor(random(0, 2))];
        return "C4";
      }
    }
  }
}

//------------------------------------------------------------
// Let tone.js be initialized when all dependencies are loaded

window.onload = function () {
  initializeAudio();

  // play button
  document.getElementById("play-button").addEventListener("click", function () {
    if (Tone.Transport.state !== "started") {
      Tone.start();
      Tone.Transport.start();
      console.log("Audio started");
    } else {
      Tone.Transport.stop();
      console.log("Audio stopped");
    }
  });
};

// -----------------------------------------------------------

//------------------------------------------------------------
// patternType options: "up" | "down" | "upDown" | "downUp" | "alternateUp" | "alternateDown" | "random" | "randomOnce" | "randomWalk"

//------------------------------------------------------------

function mapNote(noteNumber, scale) {
  //   mapNotes allows for transposition
  let numNotes = scale.length;
  let i = modulo(noteNumber, numNotes);
  let note = scale[i];
  let octaveTranspose = Math.floor(noteNumber / numNotes);
  let interval = Tonal.Interval.fromSemitones(octaveTranspose * 12);
  return Tonal.Note.transpose(note, interval);
}

//------------------------------------------------------------
function modulo(n, m) {
  return ((n % m) + m) % m;
}
