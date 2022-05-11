# FASA AIJBILY Installation

_DRAFT_

This project is an audiovisual installation that can be controlled by tracking user movement through a webcam. The project is written using three libraries. 

## [Tone.js](https://tonejs.github.io)

Tone.js is used to instantiate **Track objects**. The Track class was built following this tutorial by 
[David Bouchard](https://glitch.com/~tone-sequence). 



The Track constructor takes 4 arguments:
1. `noteDuration="8n"` which defaults at an 8th note;
2. `interval="8n"`;
3. `patternIndex` which reads from the `patternType` array 
4. `transpose` to change the pattern octave. This variable takes a tone value, so an octave up is `7`, octave down is `-7`, etc.

The `patternType` array contains 9 pattern options inherited from [Tone.CtrlPattern](https://tonejs.github.io/docs/r13/CtrlPattern).
The Track class instantiates a new [Tone.Synth](https://tonejs.github.io/docs/14.7.77/Synth) and a [Tone.Pattern](https://tonejs.github.io/docs/14.7.77/Pattern).

### Tone.Pattern

<details>
  <summary>Pattern instantiation in the Track constructor</summary>
  
  ```
  this.pattern = new Tone.Pattern(
      (time, index) => {
        let note = mapNote(sequence[index] + this.transpose, scale);
        this.synth.triggerAttackRelease(note, this.noteDuration, time);
        this.currentNote = note;
      },
      Array.from(sequence.keys()),
      patternType[this.patternIndex]
    );
  ```
  
 </details>

The first argument of the Pattern constructor is a callback function which will be executed whenever a beat is triggered. This callback function defines the interval at which the function should be called, and the array of note to be played. 

## [p5.js](p5js.org)

