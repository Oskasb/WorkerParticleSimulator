"use strict";

define(['particle_simulator/protocol/ParticleProtocol'],
	function(ParticleProtocol) {

		var ParticlesWorker = function() {
			this.particleProtocol = new ParticleProtocol();
		   	this.setupWorker();
		};

		ParticlesWorker.prototype.setupWorker = function() {
			this.worker = new Worker('./js/submodules/particle_simulator/src/worker/ParticleWorkerMain.js');

			this.worker.onmessage = function(msg) {
				this.receiveParticleData(msg);
			}.bind(this);
		};

		ParticlesWorker.prototype.receiveParticleData = function(msg) {
			console.log("ParticleData updated:", msg);
		};


		ParticlesWorker.prototype.spawnParticles = function(id, meshData, position, normal, effectData) {
			this.worker.postMessage(['spawnSimulation', id])
		};

		ParticlesWorker.prototype.requestSimulationFrame = function(id, meshData, tpf) {
			this.worker.postMessage(['fetchSimulationFrame', id])
		};

		ParticlesWorker.prototype.createWorkerSimulator = function(id, meshData, particleSettings) {
			this.worker.postMessage(['createSimulator', id])
		};

		return ParticlesWorker
	});