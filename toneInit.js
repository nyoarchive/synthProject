let playing = false;
let started = false;

const scale = Tonal.Scale.get("e3 minor").notes;
const notes = scale.concat(
  Tonal.Scale.get("e4 minor").notes,
  Tonal.Scale.get("e3 minor").notes
);
const randomNote = notes[Math.floor(Math.random() * notes.length)];

// -----  INITIALIZE AUDIO ----- \\

function configPlayButton () {
  const button = document.getElementById("play-button");

  button.addEventListener("click", (e) => {
    if (!started) {

      initializeAudio();


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
      amen.start();


      playing = true;

    }
  });
};

function initializeAudio () {


  //------------------ EFFECT & VOLUMES INIT ---------------

  Tone.getDestination().volume.rampTo(-10, 0.001);
  const amenVolume = new Tone.Volume(-20).toDestination();
  const hatVolume = new Tone.Volume(-20).toDestination();
  const chordFilter = new Tone.AutoFilter("1n")

  // CONNECT
  amen.connect(amenVolume).start()
  hatSampler.connect(hatVolume)
  chordSampler.connect(chordFilter)

  /*------------------PATTERNS AND SEQUENCES--------------------

  //----------------- patternType options: ----------------------/
  // ------------"up" | "down" | "upDown" | "downUp" |-----------/
  // --------"alternateUp" | "alternateDown" | "random" | -------/
  // ----------------"randomOnce" | "randomWalk"----------------*/


  const chordPattern = new Tone.Pattern(
    (time, note) => {
      chordSampler.triggerAttackRelease(note, "1n", time);
    },
    ["A4", "D4", "E4", "G4", "G5"],
    "randomOnce"
  );
  chordPattern.interval = "1m";

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
  ).start();



  // START TONE.JS EVENTS
  chordPattern.start();
  chordFilter.start();
  Tone.Transport.bpm.value = 160;
  Tone.start();
};
//-----------------     INSTRUMENTS     ---------------------

const keys = new Tone.Sampler({
  urls: {
    G2: "assets/obxHarp/obxHarp - G3.wav",
    G3: "assets/obxHarp/obxHarp - G4.wav",
    G4: "assets/obxHarp/obxHarp - G5.wav"
  },
}).toDestination();



const chordSampler = new Tone.Sampler({
  urls: {
    A4: "assets/chords/surgeChords - A6add9.wav",
    D4: "assets/chords/surgeChords - Dmaj7Add13.wav",
    E4: "assets/chords/surgeChords - Emin6add9.wav",
    G4: "assets/chords/surgeChords - Gb11b9.wav",
    G5: "assets/chords/surgeChords - Gmaj7add13.wav",
  },
});

const hatSampler = new Tone.Sampler({
  urls: {
    A4: "assets/drums/hats/ch_1.wav",
    D4: "assets/drums/hats/ch_2.wav",
    E4: "assets/drums/hats/ch_3.wav",
    G4: "assets/drums/hats/oh_1.wav",
    A5: "assets/drums/hats/ph_1.wav",
    D5: "assets/drums/hats/shaker.wav",
  },
});


const amen = new Tone.GrainPlayer({
  url: "assets/drums/amen_160bpm.wav",
  playbackRate: 1,
  grainSize: 0.1,
  loop: true,
});
