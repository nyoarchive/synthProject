// Tutorial by David Bouchard https://youtu.be/ddVrGY1dveY



let ready = false;  // Audio will not start automatically

let osc;
let osc2;
let osc3;
let lfo; //low freq oscillator
let lfo2

let wave;

let x = 5;
let y = 5;
let easing = 0.08;






function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES)

  
  // osc = new Tone.Oscillator().toDestination();  creating first oscillator
  
  osc = new Tone.Oscillator( { //Oscillator created with constructor
    type: "sawtooth",
    frequency: 110,
    volume: -6
  })
  

  
  osc.connect(Tone.Master);// can also be written as osc.toDestination();
  // osc.frequency.value = 220;

  
  osc2 = new Tone.Oscillator().toDestination(); 
  osc2.frequency.value = 155.56;
  
  osc2.type = 'sawtooth';
  
  osc3 = new Tone.Oscillator().toDestination();
  osc3.type = 'sawtooth';
  
  
  
  lfo = new Tone.LFO("0.009hz", 61.74, 92.50);
  lfo.connect(osc2.frequency);
  lfo.type = 'sine'
  
  
  lfo2 = new Tone.LFO("0.03hz",	293.66/2, 440.00/2);
  lfo2.type = 'sine'
  lfo2.connect(osc3.frequency);
  
  wave = new Tone.Waveform();
  Tone.Master.connect(wave); //Master will now drive wave
  
  Tone.Master.volume.value = -10;
  
  
}



// Main render loop
function draw() {
  background(10);
  
  if(ready){
    
    // osc.frequency.value = map(mouseX, 0, width, 110, 880);
    // osc2.frequency.value = map(mouseY, 0, width, 110, 880);
    
    
    stroke(255);
    let buffer = wave.getValue(0);
    
    
    // look for trigger point where samples are going from negative to positive
    let start = 0;
    for (let i=1; i < buffer.length; i++){ 
      if(buffer[i-1] < 0 && buffer[i] >= 0){
         start = i;
         break; //interrupts for loop
        }
        
      }
    
    
//  calculate new endpoint to always draw same number of samples in each frames
    let end = start + buffer.length/2
    
    //drawing waveform
    for (let i=start; i < end; i++){
      
      let x1 = map(i-1,start, end, 0, width);
      let y1 = map(buffer[i-1], -1, 1, 0, height);
      let x2 = map(i, start, end, 0, width);
      let y2 = map(buffer[i], -1, 1, 0, height);
      line(x1,y1,x2, y2);
      
      
    }
    
//     push()
    
//     translate(width/2, height/2);
    
//     beginShape();
    
//     for (let i = 0; i < 360; i++){
      
//       noFill()
//       r = map(buffer[i], 0, 1, 100, 600)
      
      
      
//       let targetX = r * cos(i);
//       let dx = targetX - x;
//       x += dx * easing;

//       let targetY = r * sin(i);
//       let dy = targetY - y;
//       y += dy * easing;
     
      
//       vertex(targetX, targetY)
//       point(x, y);
//     }
    
 
    
//     endShape();
//     pop();
    
  } else {
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    text("Click to start!", width/2, height/2)
    
  }
}


function mousePressed() {
  if (!ready){
 //     start audio object   
    osc.start();
    osc2.start();
    lfo.start();
    osc3.start();
    lfo2.start();
    ready = true;
  } else {
    ready = false
  }
}


function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

