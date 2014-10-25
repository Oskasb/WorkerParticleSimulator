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

	var ParticlesAPI = function(useWorker) {
		this.useWorker = useWorker;
		this.enabled = false;

		if (this.useWorker){
			this.particlesWorker = new ParticlesWorker(this);
		}

		this.simulators = {};
		this.renderers = {};
		this.toUpdate = [];
		this.processingId = null;
		this.underruns = 0;
	};

	ParticlesAPI.prototype.setEnabled = function(enabled) {
		this.enabled = enabled;
	};

	ParticlesAPI.prototype.systemIdUpdated = function(id, responseData) {
		if (this.processingId != id) {
			console.error("Unexpected particle id processed.", this.processingId, id)
		}

		this.renderers[id].renderMeshData(responseData);
		this.processingId = null;
		if (this.toUpdate.length) {
			this.requestSimulationProcess(this.toUpdate.pop(), this.frameTpf);
		}
	};

	ParticlesAPI.prototype.requestFrameUpdate = function(tpf) {
		if (!this.enabled) return;
		this.underruns = 0;
		this.frameTpf = tpf;
		this.toUpdate.length = 0;

		for (var key in this.renderers) {
			this.toUpdate.push(key);
		}

		var nextId = this.toUpdate.pop();

		this.requestSimulationProcess(nextId, tpf);

	};

	ParticlesAPI.prototype.spawnParticles = function(id, position, normal, effectData) {
		if (this.useWorker){
			this.particlesWorker.spawnParticles(id, position, normal, effectData);
		} else {
			this.simulators[id].spawnSimulation(position, normal, effectData);
		}
	};


	ParticlesAPI.prototype.requestSimulationProcess = function(id, tpf) {
		if (this.processingId) {
			this.underruns++;
			return;
		}
		this.processingId = id;

		if (this.useWorker){
			this.particlesWorker.requestSimulationFrame(id, this.renderers[id].pos, this.renderers[id].col, this.renderers[id].data, this.renderers[id].indexTransfer, tpf);
		} else {
			if (this.simulators[id].aliveParticles > 0 || this.simulators[id].simulations.length) {
				this.simulators[id].updateSimulator(this.renderers[id].pos, this.renderers[id].col, this.renderers[id].data, this.renderers[id].indexTransfer, tpf);
			}
			this.systemIdUpdated(id);
		}
	};

	ParticlesAPI.prototype.createParticleSystem = function(goo, id, particleSettings, texture) {
		this.toUpdate.length = 0;
		this.renderers[id] = new ParticlesRenderer(goo, id, particleSettings, texture);

		if (this.useWorker){
			this.particlesWorker.createWorkerSimulator(id, particleSettings);
		} else {
			if (this.simulators[id]) {
				delete this.simulators[id];
			}
			this.simulators[id] = new ParticleSimulator(id, particleSettings);
		}

		return this.renderers[id];
	};



	return ParticlesAPI
});