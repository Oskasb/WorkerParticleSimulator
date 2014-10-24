"use strict";

define([
	'particle_simulator/ParticlesWorker',
	'particle_simulator/worker/ParticleSimulator',
	'particle_simulator/ParticlesRenderer'
],function(
	ParticlesWorker,
	ParticleSimulator,
	ParticlesRenderer
	) {

	var ParticlesAPI = function() {
		this.particlesWorker = new ParticlesWorker(this);
		this.simulators = {};
		this.renderers = {};
		this.toUpdate = [];
	};

	ParticlesAPI.prototype.systemIdUpdated = function(id, responseData) {
		this.renderers[id].renderMeshData(responseData);

		if (this.toUpdate.length) {
			this.requestWorkerProcess(this.toUpdate.pop(), this.frameTpf);
		}

	};

	ParticlesAPI.prototype.requestFrameUpdate = function(tpf) {
		this.frameTpf = tpf;
		for (var key in this.renderers) {
			this.toUpdate.push(key);
		}
		this.requestWorkerProcess(this.toUpdate.pop(), tpf);

		var updateId = function(id) {
			this.systemIdUpdated(id);
			if (this.toUpdate.length) {
				delayedUpdate(this.toUpdate.pop(), Math.random()*0.01)
			}
		}.bind(this);

		var delayedUpdate = function(id, delay) {
			this.updateMainThreadSimulator(id, tpf);
			setTimeout(function() {
				updateId(id);
			}, delay)
		}.bind(this);


	// 	delayedUpdate(this.toUpdate.pop(), Math.random()*0.1)

	};

	ParticlesAPI.prototype.spawnParticles = function(id, position, normal, effectData) {
		this.particlesWorker.spawnParticles(id, position, normal, effectData);
		//		this.simulators[id].spawnSimulation(position, normal, effectData);

	};


	ParticlesAPI.prototype.requestWorkerProcess = function(id, tpf) {
		this.particlesWorker.requestSimulationFrame(id, this.renderers[id].pos, this.renderers[id].col, this.renderers[id].data, this.renderers[id].indexTransfer, tpf);
	};


	ParticlesAPI.prototype.updateMainThreadSimulator = function(id, tpf) {
		if (this.simulators[id].aliveParticles > 0 || this.simulators[id].simulations.length) {
			this.simulators[id].updateSimulator(this.renderers[id].pos, this.renderers[id].col, this.renderers[id].data, this.renderers[id].indexTransfer, tpf);
		}
	};


	ParticlesAPI.prototype.createParticleSystem = function(goo, id, particleSettings, texture) {
		this.renderers[id] = new ParticlesRenderer(goo, id, particleSettings, texture);
		this.createWorkerParticleSimulator(id, particleSettings);
		return this.renderers[id]
	//	this.createMainThreadParticleSimulator(id, particleSettings)
	};

	ParticlesAPI.prototype.createWorkerParticleSimulator = function(id, particleSettings) {
		this.particlesWorker.createWorkerSimulator(id, particleSettings);
		return this.renderers[id]
	};

	ParticlesAPI.prototype.createMainThreadParticleSimulator = function(id, particleSettings) {
		this.simulators[id] = new ParticleSimulator(id, particleSettings);
	};

	return ParticlesAPI
});