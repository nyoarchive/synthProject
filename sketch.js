const handsfree = new Handsfree({
  hands: true,
});

/// ---------------------------------------------------------------------
// Initiate handsfree.js
handsfree.start(); //starts the webcam

/// ---------------------------------------------------------------------
// Promises

function gotHands() {
  return new Promise((resolve /*reject*/) => {
    if (typeof handsfree.data.hands === "object") {
      resolve(handsfree.data.hands);
    } else {
      reject("Promise is rejected");
    }
  });
}

async function drawHands() {
  try {
    const theseHands = await gotHands();
    console.log(theseHands);
  } catch (error) {
    let myErr = gotHands();
    console.log("gotHands failed! " + myErr);
  }
}

drawHands();

// ---------------------------------------------------------------------
// p5.js canvas setup

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
}

// ---------------------------------------------------------------------
// main draw loop

function draw() {
  background(0);
  // drawHands(1);
}
