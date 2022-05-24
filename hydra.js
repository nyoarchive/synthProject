// Type some code on a new line (such as "osc().out()"), and press CTRL+shift+enter


osc(7000).modulate(noise(1)).out(o1)
// s0.initCam(0);
s0.initCam(2);
src(s0)
	.modulate(noise(10))
	.diff(src(s0))
	.modulateRotate(s0, 3)
	.mult(src(s0))
	.blend(o1)
	.modulate(noise(1))
	.modulateKaleid(voronoi(10, 5))
	.diff(src(s0))
	.modulateRotate(osc(10))
	.blend(src(s1), 0.3)
		.out(o0)
