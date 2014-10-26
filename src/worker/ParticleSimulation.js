"use strict";

define(function() {
	var alphaCurve = [[0, 0], [0.5,1], [1, 0]];
	var growthCurve = [[0, 1], [1, 0]];

	var ParticleSimulation = function(position, normal, particleSettings, effectData) {
		this.position = position;
		this.normal = normal;
		this.rotation = particleSettings.rotation;
		this.spin = [particleSettings.spin[0],particleSettings.spin[1]];


		this.stretch = particleSettings.stretch;
		this.color = particleSettings.color;
		this.count = particleSettings.count;
		this.size = [particleSettings.size[0],particleSettings.size[1]];
		this.growth = [particleSettings.growth[0],particleSettings.growth[1]];
		this.strength = particleSettings.strength;
		this.gravity = particleSettings.gravity;
		this.spread = particleSettings.spread;
		this.lifeSpan = [particleSettings.lifespan[0], particleSettings.lifespan[1]];
		this.acceleration = particleSettings.acceleration;
		this.gravity = particleSettings.gravity;
		this.alphaCurve = particleSettings.alphaCurve || alphaCurve;
		this.growthCurve = particleSettings.growthCurve || growthCurve;

		if (effectData) {
			if (effectData.acceleration) {
				this.acceleration = effectData.acceleration
			}
			if (effectData.alphaCurve) {
				this.alphaCurve = effectData.alphaCurve
			}
			if (effectData.growthCurve) {
				this.growthCurve = effectData.growthCurve
			}
			if (effectData.lifespan) {
				this.lifeSpan[0] = effectData.lifespan*0.8;
				this.lifeSpan[1] = effectData.lifespan;
			}

			if (effectData.count) {
				this.count = effectData.count;
			}

			if (effectData.intensity) {
				this.count = Math.ceil(this.count*effectData.intensity);
			}

			if (effectData.color) {
				this.color = effectData.color;
			}
			if (effectData.strength) {
				this.strength = effectData.strength;
			}

			if (effectData.size) {
				this.size[0] = effectData.size;
				this.size[1] = effectData.size;
			}
			if (effectData.growth) {
				this.growth[0] = effectData.growth;
				this.growth[1] = effectData.growth;
			}
			if (effectData.gravity) {
				this.gravity = effectData.gravity;
			}
			if (effectData.scale) {
				this.size[0] = this.size[0] * effectData.scale;
				this.size[1] = this.size[1] * effectData.scale;
				this.growth[0] = this.growth[0] * effectData.scale;
				this.growth[1] = this.growth[1] * effectData.scale;
				this.strength *= effectData.scale;
			}
			if (effectData.spread) {
				this.spread = effectData.spread;
			}
		}



		this.effectCount = this.count;
	};
	return ParticleSimulation
})
;