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
		this.particlesWorker = new ParticlesWorker();
		this.simulators = {};
		this.renderers = {};
	};

	ParticlesAPI.prototype.systemIdUpdated = function(id, responseData) {
		this.renderers[id].renderMeshData();
	};

	ParticlesAPI.prototype.requestFrameUpdate = function(tpf) {
		for (var key in this.renderers) {
			this.updateSimulator(key, tpf);
			this.systemIdUpdated(key);
		}
	};

	ParticlesAPI.prototype.spawnParticles = function(id, position, normal, effectData) {
		//	this.particlesWorker.spawnParticles(id, this.renderers[id], position, normal, effectData);
		this.simulators[id].spawnSimulation(this.renderers[id], position, normal, effectData);

	};

	ParticlesAPI.prototype.updateSimulator = function(id, tpf) {
	//	this.particlesWorker.requestSimulationFrame(id, this.renderers[id], tpf);
		if (this.simulators[id].aliveParticles > 0) {
			this.simulators[id].updateSimulator(this.renderers[id], tpf);
		}
	};

	ParticlesAPI.prototype.createParticleSystem = function(goo, id, particleSettings, texture) {
		this.renderers[id] = new ParticlesRenderer(goo, id, particleSettings, texture);
	//	this.particlesWorker.createWorkerSimulator(id, particleSettings);
		this.simulators[id] = new ParticleSimulator(id, particleSettings);
		return this.renderers[id]
	};

	return ParticlesAPI
});