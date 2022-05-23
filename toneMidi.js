class midiAccess {
  constructor(args = {}) {
    this.onDeviceInput = args.onDeviceInput || console.log;
  }

  start() {
    return new Promise((resolve, reject) => {
      this._requestAccess()
        .then((access) => {
          this.initialize(access);
          resolve();
        })
        .catch(() => reject("Something went wrong."));
    });
  }

  initialize(access) {
    const devices = access.inputs.values();
    for (let device of devices) this.initializeDevice(device);
  }

  initializeDevice(device) {
    device.onmidimessage = this.onMessage.bind(this);
  }

  onMessage(message) {
    let [, input, value] = message.data;
    this.onDeviceInput({ input, value });
  }

  _requestAccess() {
    return new Promise((resolve, reject) => {
      if (navigator.requestMIDIAccess)
        navigator.requestMIDIAccess().then(resolve).catch(reject);
      else reject();
    });
  }
}

function onDeviceInput({ input, value }) {
  console.log("onDeviceInput!", input, value);
}

function initMidi() {
  const midi = new midiAccess({ onDeviceInput });
  midi
    .start()
    .then(() => {
      console.log("MIDI STARTED!");
    })
    .catch(console.error);

  /*function onDeviceInput({ input, value }) {
    // if (input === 23) {inst.toggleSound(value);}
    // else if (input === 2) {inst.handleVolume(value);}
    // else if (input === 14) {inst.handleFilter(value);}
    // else {console.log("onDeviceInput!", input, value);}
  }*/
}
