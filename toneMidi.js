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

// function onDeviceInput({ input, value }) {
//   console.log("onDeviceInput!", input, value);
// }

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

function onDeviceInput({ address, input, value }) {
  if (address === 128 || address === 144) {
    let note = Tonal.Note.fromMidi(input);
    handleMIDINote(address, note);
    console.log(`Device: ${midi.target.name}\nnote:${note}, address: ${address}`);
  } else if (midi.target.name === "MPKmini2") {
    console.log("MPKmini2", address, input);
    handleCCMessage(address, input, value);
  } else if (midi.target.name === "A-PRO 2") {
    console.log("A-PRO 2", address, input);
  } else {
    noMIDI(address, input, value);
  }
}

function handleCCMessage(address, input, value){
  switch(address) {
  case 176:
    switch(input){
    case 1:
      polySynth.envelope.attack=value;
      break;
    case 2:
      polySynth.envelope.decay=value;
      break;
    case 3:
      polySynth.envelope.release=value;
      break;
    default:
      noMIDI(address, input, value);
    }
    break;
  default:
    noMIDI(address, input, value);


  }

}


function handleMIDINote (address, note) {
  if(address === 144){
    polySynth.triggerAttackRelease(note, "4n").toDestination("@32n");
    console.log(`%cPolySynth`);
  } else {
    return;
  }
}


function noMIDI (address, input, value) {
  console.log(
    `%c${midi.target.name} has not been configured in toneMidi.js
  \nAddress: ${address} | Input: ${input} | Value: ${value}`,
    logWarning
  );
}

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
  'font-family: "IBM Plex Mono", monospace',
].join(";");
