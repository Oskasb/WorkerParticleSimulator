"use strict";

define([
	'particle_simulator/worker/ParticleSimulation',
	'particle_simulator/worker/Particle',
	'goo/renderer/Material',
	'goo/math/MathUtils',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/math/Vector3'
],function(
	ParticleSimulation,
	Particle,
	Material,
	MathUtils,
	MeshData,
	Shader,
	Vector3
	) {


	var ParticleSimulator = function(id, particleSettings) {
		 this.id = id;
		this.simulations = [];

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
			this.particles[i] = new Particle(new Vector3(), new Vector3());
		}

		this.aliveParticles = 0;
	};

	function randomBetween(min, max) {
		return Math.random() * (max - min) + min;
	}
	var calcVec = new Vector3();

	ParticleSimulator.prototype.spawnSimulation = function(position, normal, effectData) {

		var simulation = new ParticleSimulation(new Vector3(position.data[0], position.data[1],position.data[2]), new Vector3(normal.data[0], normal.data[1], normal.data[2]), this.particleSettings, effectData);
		this.simulations.push(simulation);

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

	ParticleSimulator.prototype.includeSimulation = function(sim, colorData, uvData) {
		var count = sim.count;

		for (var i = 0, l = this.particles.length; i < l && count > 0; i++) {
			var particle = this.particles[i];

			if (particle.dead) {

				var ratio = 1 - particle.stretch * (sim.count-count) /  sim.count;

				particle.position.x = sim.position.x + sim.normal.x*ratio;
				particle.position.y = sim.position.y + sim.normal.y*ratio;
				particle.position.z = sim.position.z + sim.normal.z*ratio;
				particle.acceleration = sim.acceleration;
				particle.gravity = sim.gravity;
				particle.alphaCurve = sim.alphaCurve;
				particle.growthCurve = sim.growthCurve;

				particle.lifeSpanTotal = particle.lifeSpan = randomBetween(sim.lifeSpan[0], sim.lifeSpan[1]);

				particle.frameOffset = count/sim.effectCount;

				particle.velocity.set(
					sim.strength*((Math.random() -0.5) * (2*sim.spread) + (1-sim.spread)*sim.normal.x),
					sim.strength*((Math.random() -0.5) * (2*sim.spread) + (1-sim.spread)*sim.normal.y),
					sim.strength*((Math.random() -0.5) * (2*sim.spread) + (1-sim.spread)*sim.normal.z)
				);

				particle.dead = false;
				this.aliveParticles++;
				particle.gravity = sim.gravity;
				count--;

				colorData[4 * i + 0] = sim.color[0];
				colorData[4 * i + 1] = sim.color[1];
				colorData[4 * i + 2] = sim.color[2];

				particle.alpha = sim.color[3];
				uvData[4 * i + 0] = randomBetween(sim.size[0], sim.size[1]); // size
				uvData[4 * i + 1] = randomBetween(sim.growth[0], sim.growth[1]); // size change
				uvData[4 * i + 2] = randomBetween(sim.rotation[0], sim.rotation[1]) * MathUtils.DEG_TO_RAD; // rot
				uvData[4 * i + 3] = randomBetween(sim.spin[0], sim.spin[1]) * MathUtils.DEG_TO_RAD; // spin
			}
		}
	};

	ParticleSimulator.prototype.updateNewSimulations = function(colData, uvData) {
		while (this.simulations.length != 0) {
			this.includeSimulation(this.simulations.pop(), colData, uvData);
		}
	};

	ParticleSimulator.prototype.updateSimulator = function(posData, colData, uvData, indexTransfer, tpf) {

		this.updateNewSimulations(colData, uvData);

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
				posData[3 * i + 0] = 0;
				posData[3 * i + 1] = -1000;
				posData[3 * i + 2] = 0;
				this.aliveParticles--;
				continue;
			}
			particle.progress = 1-((particle.lifeSpan - particle.frameOffset*0.016)  / particle.lifeSpanTotal);

			calcVec.setv(particle.velocity).muld(deduct, deduct, deduct);
			particle.position.addv(calcVec);
			particle.velocity.muld(particle.acceleration, particle.acceleration, particle.acceleration);
			particle.velocity.add_d(0, particle.gravity * deduct, 0);

			posData[3 * i + 0] = particle.position.data[0];
			posData[3 * i + 1] = particle.position.data[1];
			posData[3 * i + 2] = particle.position.data[2];

			colData[4 * i + 3] = particle.alpha * this.fitValueInCurve(particle.progress, particle.alphaCurve);
			particle.growth = this.fitValueInCurve(particle.progress, particle.growthCurve);
			uvData[4 * i + 0] += uvData[4 * i + 1] * particle.growth;
			uvData[4 * i + 2] += uvData[4 * i + 3] * particle.growth;
			indexTransfer[0] = i;

		}

	};

	return ParticleSimulator
});