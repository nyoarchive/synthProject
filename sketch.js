// -----------------------------------------------------------------------
// variable declaration
let poseNet;
let poses = [];
let video;

let prevNote;

let sideN;
let sideL;
let sideR;
let angleSum;
let triangleSides = {};

let angleN;
let angleL;
let angleR;
// -----------------------------------------------------------------------
// p5.js code

function setup() {
  cnv = createCanvas(640, 480);

  cnv.id('p5-canvas');
  cnv.parent('p5-holder');
  angleMode(DEGREES);

  // create a capture
  video = createCapture(VIDEO);
  video.id("p5-capture");
  video.parent("p5-holder");

  video.size = (640, 480);
  // video.hide();

  // feed capture to poseNet
  //poseNet init
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", function(results) {
    poses = results;
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
  background(120,0);
  tint(255, 25);
  image(video, 0, 0, width, height);

  // if(frameCount % 60 === 0){
  //   // clear();
  // }
  strokeWeight(2);
  angleMode(DEGREES);

  if (poses.length !== 0) {
    for (let i = 0; i < poses.length; i++) {
      let pose = poses[i].pose;
      if (pose.nose && pose.leftWrist && pose.rightWrist) {
        poseShape();
      } else {
        noseToLeft = "undefined";
        noseToRight = "undefined";
        leftHandToRight = "undefined";
      }
    }

    poseShape();
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

function poseShape() {
  let pose = poses[0].pose;

  let nose = pose.nose;
  let leftHand = pose.leftWrist;
  let rightHand = pose.rightWrist;

  if (
    leftHand.confidence > 0.4 &&
    rightHand.confidence > 0.4 &&
    nose.confidence > 0.4
  ) {
    noFill();
    stroke(255, 255, 200);
    strokeWeight(5);
    beginShape(TRIANGLES);
    vertex(nose.x, nose.y);
    vertex(leftHand.x, leftHand.y);
    vertex(rightHand.x, rightHand.y);
    endShape();

    sideN = dist(leftHand.x, leftHand.y, rightHand.x, rightHand.y);
    sideL = dist(rightHand.x, rightHand.y, nose.x, nose.y);
    sideR = dist(nose.x, nose.y, leftHand.x, leftHand.y);

    triangleSides = { nose: sideN, leftHand: sideL, rightHand: sideR };

    angleN = findAngle(sideN, sideL, sideR);
    angleL = findAngle(sideL, sideR, sideN);
    angleR = findAngle(sideR, sideN, sideL);

    angleSum = angleN + angleL + angleR;

    document.getElementById(
      "pose-xy"
    ).innerHTML = `N: ${angleN} | R: ${angleR} | L: ${angleL} | SUM: ${angleSum}`;

    // return angleN, angleL, angleR, angleSum, triangleSides
  }

  return angleN, angleL, angleR, angleSum, triangleSides;
}

function findAngle(sideA, sideB, sideC) {
  angle = Math.floor(
    acos((sideB ** 2 + sideC ** 2 - sideA ** 2) / (2 * (sideB * sideC)))
  );

  if (angle === Infinity || isNaN(angle)) {
    console.log(`%c Magic Zero just happened: angle=${angle}`);
    angle = 90;
  }
  return angle;
}
