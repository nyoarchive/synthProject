// Type some code on a new line (such as "osc().out()"), and press CTRL+shift+enter

osc(7000)
  .modulate(noise(1))
  .out(o1);
s0.initScreen(2);
// s0.initCam(2);
src(s0)
  .diff(src(s0))
  .mult(src(s0))
  .blend(o1)
  .diff(src(s0))
  .blend(src(s1), 0.3)
  .out(o0);
