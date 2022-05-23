// Create synths needed to generate sound;

const makeSynths = (count) => {
  const synths = [];

  for (let i = 0; i < count; i++) {
    /*let synth = new Tone.Synth({
      oscillator: { type: "fatsawtooth" },
    }).toDestination(); */

    let samples = new Tone.Sampler({
      urls: {
        G2: "assets/surgeKeys/surgeKeys - G4.wav",
        G3: "assets/surgeKeys/surgeKeys - G5.wav",
      },
      onload: () => {
        console.log("samples loaded");
      },
    }).toDestination();

    synths.push(samples);
  }
  return synths;
};

/* -------------- Create grid: ---------------------
An array where each array is a row on the sequencer;
Each subarray is a note and an isActive property 


----------------------------------------------------*/
const bars = 32;

const makeGrid = (notes) => {
  const rows = [];

  for (const note of notes) {
    const row = [];

    for (let i = 0; i < bars; i++) {
      // each element in the subarray corresponds to one 8th note; currently set to 16 bars
      row.push({
        note: note,
        isActive: false,
      });
    }
    rows.push(row);
  }
  return rows;
};

/* -------------- Create loop: ---------------------
Transport's scheduleRepeat method takes a callback function and a 
time interval at which to execute to callback

----------------------------------------------------*/
const scale = Tonal.Scale.get("e3 minor").notes;
const notes = scale.concat(
  Tonal.Scale.get("e4 minor").notes,
  Tonal.Scale.get("e2 minor").notes
);
// const notes = ["F4", "Eb4", "C4", "Bb3", "Ab3", "F3"];

const synths = makeSynths(notes.length);

let beat = 0;

const grid = makeGrid(notes);

let playing = false;
let started = false;

const configLoop = () => {
  const repeat = (time) => {
    grid.forEach((row, index) => {
      let synth = synths[index];
      let note = row[beat];

      if (note.isActive) {
        synth.triggerAttackRelease(note.note, "8n", time);
      }
    });
    //increments the counter; with modulo to make it an even number?
    beat = (beat + 1) % bars;
  };

  Tone.Transport.bpm.value = 160;
  Tone.Transport.scheduleRepeat(repeat, "8n");
};

const makeSequencer = () => {
  const sequencer = document.getElementById("sequencer");

  //   interate through the grid
  grid.forEach((row, rowIndex) => {
    const seqRow = document.createElement("div");
    seqRow.id = `rowIndex`;
    seqRow.className = "sequencer-row";

    //     iterate through each row
    row.forEach((note, noteIndex) => {
      const button = document.createElement("button");
      button.className = "note";

      button.addEventListener("click", function (e) {
        handleNoteClick(rowIndex, noteIndex, e);
      });

      seqRow.appendChild(button);
    });
    sequencer.appendChild(seqRow);
  });
};

const handleNoteClick = (clickedRowIndex, clickedNoteIndex, e) => {
  grid.forEach((row, rowIndex) => {
    row.forEach((note, noteIndex) => {
      if (clickedRowIndex === rowIndex && clickedNoteIndex === noteIndex) {
        //         whatever the state of note.isActive, reverse it
        note.isActive = !note.isActive;

        e.target.className = classNames(
          "note",
          { "note-is-active": !!note.isActive },
          { "note-is-inactive": !note.isActive }
        );
      }
    });
  });
};

/* ------------ Button and event handler -------------
----------------------------------------------------*/
const initializeAudio = () => {
  chordPattern.start(0);
  chordPattern.interval = "1m";
  chordPattern.humanize = true;
  amen.start();
  hatsSeq.start(0);
  Tone.Transport.bpm.value = 160;
};

const configPlayButton = () => {
  const button = document.getElementById("play-button");

  button.addEventListener("click", (e) => {
    if (!started) {
      Tone.start();
      initializeAudio();
      initMidi();
      Tone.getDestination().volume.rampTo(-10, 0.001);
      configLoop();
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
      playing = false;
    } else {
      e.target.innerText = "Stop";
      Tone.Transport.start();
      playing = true;
    }
  });
};

//----------SEQUENCE----------------------//

const randomNote = notes[Math.floor(Math.random() * notes.length)];

const samples = {
  drums: [
    "assets/drums/dnbSnare.wav",
    "assets/drums/hardSnare.wav",
    "assets/drums/ride.wav",
    "assets/drums/ride2.wav",
    "assets/drums/kick.wav",
  ],
  chords: [
    "assets/chords/surgeChords - A6add9.wav",
    "assets/chords/surgeChords - Dmaj7Add13.wav",
    "assets/chords/surgeChords - Emin6add9.wav",
    "assets/chords/surgeChords - Gb11b9.wav",
    "assets/chords/surgeChords - Gmaj7add13.wav",
  ],
  keys: [
    "assets/surgeKeys/surgeKeys - G4.wav",
    "assets/surgeKeys/surgeKeys - G5.wav",
  ],
};

amenVolume = new Tone.Volume(-20).toDestination();
const amen = new Tone.GrainPlayer({
  url: "assets/drums/amen_160bpm.wav",
  playbackRate: 1,
  grainSize: 0.1,
  loop: true,
}).connect(amenVolume);

let keys = new Tone.Sampler({
  urls: {
    G2: "assets/surgeKeys/surgeKeys - G4.wav",
    G3: "assets/surgeKeys/surgeKeys - G5.wav",
  },
}).toDestination();

const chordFilter = new Tone.AutoFilter("1n").toDestination().start();
const hatVolume = new Tone.Volume(-20).toDestination();

const chordSampler = new Tone.Sampler({
  urls: {
    A4: "assets/chords/surgeChords - A6add9.wav",
    D4: "assets/chords/surgeChords - Dmaj7Add13.wav",
    E4: "assets/chords/surgeChords - Emin6add9.wav",
    G4: "assets/chords/surgeChords - Gb11b9.wav",
    G5: "assets/chords/surgeChords - Gmaj7add13.wav",
  },
}).connect(chordFilter);

const hatSampler = new Tone.Sampler({
  urls: {
    A4: "assets/drums/hats/ch_1.wav",
    D4: "assets/drums/hats/ch_2.wav",
    E4: "assets/drums/hats/ch_3.wav",
    G4: "assets/drums/hats/oh_1.wav",
    A5: "assets/drums/hats/ph_1.wav",
    D5: "assets/drums/hats/shaker.wav",
  },
}).connect(hatVolume);

//------------------PATTERNS AND SEQUENCES-----------------------------
// patternType options: "up" | "down" | "upDown" | "downUp" | "alternateUp" | "alternateDown" | "random" | "randomOnce" | "randomWalk"

const chordPattern = new Tone.Pattern(
  (time, note) => {
    chordSampler.triggerAttackRelease(note, "1n", time);
  },
  ["A4", "D4", "E4", "G4", "G5"],
  "randomOnce"
);

const hatsSeq = new Tone.Sequence(
  (time, note) => {
    hatSampler.triggerAttackRelease(note, "32n", time);
  },
  [
    "A4",
    ["E4", randomNote, "E4"],
    "G4",
    ["A4", "G4"],
    [randomNote, "D4"],
    ["D5", "E5", "F5", "G5"],
    ["D6", "D5"],
    ["A4", "G4"],
    [randomNote, randomNote],
    ["E4", randomNote, "E4"],
    "G4",
    ["A4", "G4"],
    [randomNote, "D4"],
    ["D5", "E5", "F5", "G5"],
    ["D6", randomNote],
  ]
);

// INITIALIZE AUDIO
window.addEventListener("DOMContentLoaded", () => {
  configPlayButton();
  makeSequencer();
});

// p5 remap function
function reMap(value, istart, istop, ostart, ostop) {
  return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
}
