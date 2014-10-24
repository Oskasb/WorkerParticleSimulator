"use strict";

define([
	'goo/renderer/Material',
	'goo/math/MathUtils',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/math/Vector3'
],function(
	Material,
	MathUtils,
	MeshData,
	Shader,
	Vector3
	) {


	var Particle = function() {
		this.frameCount = 0;
		this.position = new Vector3();
		this.velocity = new Vector3();
		this.progress = 0;
		this.frameOffset = 0;
		this.stretch = 1;
		this.alpha = 1;
		this.gravity = 0;
		this.lifeSpan = 0;
		this.lifeSpanTotal = 0;
		this.dead = true;
	};

	var alphaCurve = [[0, 0], [0.5,1], [1, 0]];
	// var sizeCurve = [[0, 1], [0.5,1], [1, 1]];


	var ParticleSimulator = function(id, particleSettings) {

		this.particleSettings = particleSettings;
		particleSettings.poolCount = particleSettings.poolCount !== undefined ? particleSettings.poolCount : 500;

		particleSettings.alphaCurve = particleSettings.alphaCurve !== undefined ? particleSettings.alphaCurve : alphaCurve;
		particleSettings.stretch = particleSettings.stretch !== undefined ? particleSettings.stretch : 0;

		particleSettings.size = particleSettings.size !== undefined ? particleSettings.size : [10, 10];
		particleSettings.growth = particleSettings.growth !== undefined ? particleSettings.growth : [0, 0];
		particleSettings.rotation = particleSettings.rotation !== undefined ? particleSettings.rotation : [0, 360];
		particleSettings.spin = particleSettings.spin !== undefined ? particleSettings.spin : [0, 0];

		particleSettings.gravity = particleSettings.gravity !== undefined ? particleSettings.gravity : -5;
		particleSettings.color = particleSettings.color !== undefined ? particleSettings.color : [1, 1, 1, 1];
		particleSettings.spread = particleSettings.spread !== undefined ? particleSettings.spread : 1;
		particleSettings.acceleration = particleSettings.acceleration !== undefined ? particleSettings.acceleration : 0.999;
		particleSettings.strength = particleSettings.strength !== undefined ? particleSettings.strength : 1;
		particleSettings.lifespan = particleSettings.lifespan !== undefined ? particleSettings.lifespan : [3, 3];

		particleSettings.count = particleSettings.count !== undefined ? particleSettings.count : 1;

		this.particles = [];
		for (var i = 0; i < particleSettings.poolCount; i++) {
			this.particles[i] = new Particle();
		}

		this.aliveParticles = 0;
	};

	function randomBetween(min, max) {
		return Math.random() * (max - min) + min;
	}
	var calcVec = new Vector3();

	ParticleSimulator.prototype.spawnSimulation = function(particleRenderer, position, normal, effectData) {

	//	var col = particleRenderer.meshData.getAttributeBuffer(MeshData.COLOR);
	//	var data = particleRenderer.meshData.getAttributeBuffer('DATA');


	//	var stretch = this.particleSettings.stretch;
		var color = this.particleSettings.color;
		var count = this.particleSettings.count;
		var size = [this.particleSettings.size[0],this.particleSettings.size[1]];
		var growth = [this.particleSettings.growth[0],this.particleSettings.growth[1]];
		var strength = this.particleSettings.strength;
		var gravity = this.particleSettings.gravity;
		var spread = this.particleSettings.spread;
		var lifeSpan = this.particleSettings.lifespan;

		var alphaCurve = this.particleSettings.alphaCurve;

		if (effectData) {

			if (effectData.alphaCurve) {
				alphaCurve = effectData.alphaCurve
			}

			if (effectData.lifespan) {
				lifeSpan[0] = effectData.lifespan*0.8;
				lifeSpan[1] = effectData.lifespan;
			}
			if (effectData.intensity) {
				count = Math.ceil(count*effectData.intensity);
			}
			if (effectData.count) {
				count = effectData.count;
			}
			if (effectData.color) {
				color = effectData.color;
			}
			if (effectData.strength) {
				strength = effectData.strength;
			}

			if (effectData.size) {
				size[0] = effectData.size;
				size[1] = effectData.size;
			}
			if (effectData.growth) {
				growth[0] = effectData.growth;
				growth[1] = effectData.growth;
			}
			if (effectData.gravity) {
				gravity = effectData.gravity;
			}
			if (effectData.scale) {
				size[0] = size[0] * effectData.scale;
				size[1] = size[1] * effectData.scale;
				growth[0] = growth[0] * effectData.scale;
				growth[1] = growth[1] * effectData.scale;
				strength *= effectData.scale;
			}
			if (effectData.spread) {
				spread = effectData.spread;
			}
		}


		var rotation = this.particleSettings.rotation;
		var spin = this.particleSettings.spin;

		var effectCount = count;
		for (var i = 0, l = this.particles.length; i < l && count > 0; i++) {
			var particle = this.particles[i];

			if (particle.dead) {
				particle.frameCount = 0;
				var ratio = particle.stretch * (this.particleSettings.count-count) /  this.particleSettings.count;

				particle.position.x = position.x + normal.x*ratio;
				particle.position.y = position.y + normal.y*ratio;
				particle.position.z = position.z + normal.z*ratio;
				particle.alphaCurve = alphaCurve;

				particle.lifeSpanTotal = particle.lifeSpan = randomBetween(lifeSpan[0], lifeSpan[1]);

				particle.frameOffset = count/effectCount;

				particle.velocity.set(
					strength*((Math.random() -0.5) * (2*spread) + (1-spread)*normal.x),
					strength*((Math.random() -0.5) * (2*spread) + (1-spread)*normal.y),
					strength*((Math.random() -0.5) * (2*spread) + (1-spread)*normal.z)
				);

				particle.dead = false;
				this.aliveParticles++;
				particle.gravity = gravity;
				count--;

				particleRenderer.col[4 * i + 0] = color[0];
				particleRenderer.col[4 * i + 1] = color[1];
				particleRenderer.col[4 * i + 2] = color[2];

				particle.alpha = color[3];
				particleRenderer.data[4 * i + 0] = randomBetween(size[0], size[1]); // size
				particleRenderer.data[4 * i + 1] = randomBetween(growth[0], growth[1]); // size change
				particleRenderer.data[4 * i + 2] = randomBetween(rotation[0], rotation[1]) * MathUtils.DEG_TO_RAD; // rot
				particleRenderer.data[4 * i + 3] = randomBetween(spin[0], spin[1]) * MathUtils.DEG_TO_RAD; // spin
			}
		}
	};


	ParticleSimulator.prototype.getInterpolatedInCurveAboveIndex = function(value, curve, index) {
		return curve[index][1] + (value - curve[index][0]) / (curve[index+1][0] - curve[index][0])*(curve[index+1][1]-curve[index][1]);
	};

	ParticleSimulator.prototype.fitValueInCurve = function(value, curve) {
		for (var i = 0; i < curve.length; i++) {
			if (!curve[i+1]) return 0;
			if (curve[i+1][0] > value) return this.getInterpolatedInCurveAboveIndex(value, curve, i)
		}
		return 0;
	};

	ParticleSimulator.prototype.updateSimulator = function(particleRenderer, tpf) {

		var pos = particleRenderer.meshData.getAttributeBuffer(MeshData.POSITION);
		var col = particleRenderer.meshData.getAttributeBuffer(MeshData.COLOR);
		var data = particleRenderer.meshData.getAttributeBuffer('DATA');
		var lastAlive = 0;
		var gravity = this.particleSettings.gravity;
		var acceleration = this.particleSettings.acceleration;
		for (var i = 0, l = this.particles.length; i < l; i++) {
			var particle = this.particles[i];

			if (particle.dead) {
				continue;
			}

			var deduct = tpf;
			if (!particle.frameCount) {
				deduct = 0.016;
			}

			particle.lifeSpan -= deduct;



			if (particle.lifeSpan <= 0) {
				particle.dead = true;
				particle.position.setd(0, 0, 0);
				pos[3 * i + 0] = 0;
				pos[3 * i + 1] = -1000;
				pos[3 * i + 2] = 0;
				this.aliveParticles--;
				continue;
			}
			particle.progress = 1-((particle.lifeSpan - particle.frameOffset*0.016)  / particle.lifeSpanTotal);
			//	particle.frameOffset;



			calcVec.setv(particle.velocity).muld(deduct, deduct, deduct);
			particle.position.addv(calcVec);
			particle.velocity.muld(acceleration, acceleration, acceleration);
			particle.velocity.add_d(0, gravity * deduct, 0);

			particleRenderer.pos[3 * i + 0] = particle.position.data[0];
			particleRenderer.pos[3 * i + 1] = particle.position.data[1];
			particleRenderer.pos[3 * i + 2] = particle.position.data[2];

			particleRenderer.col[4 * i + 3] = particle.alpha * this.fitValueInCurve(particle.progress, particle.alphaCurve);

			particleRenderer.data[4 * i + 0] += particleRenderer.data[4 * i + 1] * particle.progress;
			particleRenderer.data[4 * i + 2] += particleRenderer.data[4 * i + 3] * particle.progress;
			particle.frameCount += 1;
			particleRenderer.lastAlive = i;

		}

	};

	return ParticleSimulator
});