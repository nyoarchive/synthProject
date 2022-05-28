// CREATES A SEQUENCER. DISCONNECTED FROM MAIN PAGE

// Create synths needed to generate sound;

const makeSynths = count => {
  const synths = [];

  for (let i = 0; i < count; i++) {
    /*let synth = new Tone.Synth({
      oscillator: { type: "fatsawtooth" },
    }).toDestination(); */

    let samples = new Tone.Sampler({
      urls: {
        G2: "assets/obxHarp/obxHarp - G3.wav",
        G3: "assets/obxHarp/obxHarp - G4.wav",
        G4: "assets/obxHarp/obxHarp - G5.wav"
      },
      onload: () => {
        console.log("samples loaded");
      }
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

const makeGrid = notes => {
  const rows = [];

  for (const note of notes) {
    const row = [];

    for (let i = 0; i < bars; i++) {
      // each element in the subarray corresponds to one 8th note; currently set to 16 bars
      row.push({
        note: note,
        isActive: false
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

const synths = makeSynths(notes.length);

let beat = 0;

const grid = makeGrid(notes);

const configLoop = () => {
  const repeat = time => {
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

      button.addEventListener("click", function(e) {
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
