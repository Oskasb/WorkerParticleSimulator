"use strict";

define(function() {


	var Particle = function(posVec, velVec) {
		this.position = posVec;
		this.velocity = velVec;
		this.progress = 0;
		this.frameOffset = 0;
		this.stretch = 1;
		this.alpha = 1;
		this.gravity = 0;
		this.lifeSpan = 0;
		this.lifeSpanTotal = 0;
		this.dead = true;
	};
	return Particle
})
;