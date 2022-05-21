// -----------------------------------------------------------------------
// variable declaration
let poseNet;
let poses = [];
let video;

let prevNote;
// -----------------------------------------------------------------------
// p5.js code

function setup() {
  createCanvas(windowWidth, windowWidth * 0.75);

  // create a capture
  video = createCapture(VIDEO);
  video.size = (windowWidth, windowHeight);
  video.hide();

  // feed capture to poseNet
  //poseNet init
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", function (results) {
    poses = results;
  });
}

// ------------------------------------------------------------------
// Callbacks checking for PoseNet's status

// Initial load
function modelLoaded() {
  console.log("poseNet ready");
}

function windowResized() {
  resizeCanvas(windowWidth, windowWidth * 0.75);
}

// ------------------------------------------------------------------
// draw
function draw() {
  image(video, 0, 0, width, height);
  strokeWeight(2);

  //   code for drawing landmarks
  drawLandmarks(0.5);

}




function drawLandmarks(confidence) {
  //   loop through all detected poses
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;

    // loop through detected landmarks with a confidence above 0.7
    for (let j = 0; j < pose.keypoints.length; j++) {
      let landmark = pose.keypoints[j];

      if (landmark.score > confidence) {
        fill(213, 0, 143);
        let posX = map(landmark.position.x, 0, 640, 0, windowWidth);
        let posY = map(landmark.position.y, 0, 480, 0, windowWidth * 0.75);
        text(landmark.part, posX, posY, 10);
      }
    }
  }
}




