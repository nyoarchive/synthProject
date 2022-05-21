// Create synths needed to generate sound;

const makeSynths = (count) => {
  const synths = [];

  for (let i = 0; i < count; i++) {
    let synth = new Tone.Synth({
      oscillator: { type: "square8" },
    }).toDestination();
    synths.push(synth);
  }
  return synths;
};

/* -------------- Create grid: ---------------------
An array where each array is a row on the sequencer;
Each subarray is a note and an isActive property 


----------------------------------------------------*/

const notes = Tonal.get("c5 pentatonic");

const makeGrid = (notes) => {
  const rows = [];

  for (const note of notes) {
    const row = [];

    for (let i = 0; i < 8; i++) {
      // each element in the subarray corresponds to one eigth note
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

let beat = 0;

const grid = makeGrid();

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
    beat = (beat + 1) % 8;
  };
  
  Tone.Transport.bpm.value = 120;
  
  Tone.Transport.scheduleRepeat(repeat, "8n");
};

const makeSequencer = () => {
  const sequencer = document.getElementById("sequencer")
}