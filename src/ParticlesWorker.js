"use strict";

define(['particle_simulator/protocol/ParticleProtocol'],
	function(ParticleProtocol) {

		var ParticlesWorker = function(particlesAPI) {
			this.particlesAPI = particlesAPI;
			this.particleProtocol = new ParticleProtocol();
		   	this.setupWorker();

			this.creatingId = null;

			this.updatingId = null;
			this.indexTransfer = null;
		};

		ParticlesWorker.prototype.setupWorker = function() {
			this.worker = new Worker('./js/submodules/particle_simulator/src/worker/ParticleWorkerMain.js');

			this.worker.onmessage = function(msg) {

				if (msg.data[0] == 'ready') {
					this.particlesAPI.setEnabled(true);
					return;
				}
				this.receiveParticleData(msg);
			}.bind(this);
		};



		ParticlesWorker.prototype.receiveParticleData = function(msg) {
			var entry = this.particleProtocol.updateData(msg.data);
			this.particlesAPI.systemIdUpdated(entry.id, entry);
		//	console.log("ParticleData updated:", msg);
		};


		ParticlesWorker.prototype.spawnParticles = function(id, position, normal, effectData) {
			this.worker.postMessage(['spawnSimulation', id, position, normal, effectData])
		};

		ParticlesWorker.prototype.requestSimulationFrame = function(id, posData, colData, uvData, indexTransfer, tpf) {
			var frame = {
				posData:new Float32Array(posData),
				colData:new Float32Array(colData),
				uvData:new Float32Array(uvData),
				id:id,
				indexTransfer:indexTransfer,
				tpf:tpf
			};

			this.worker.postMessage(frame, [frame.posData.buffer, frame.colData.buffer, frame.uvData.buffer]);


		};

		ParticlesWorker.prototype.createWorkerSimulator = function(id, particleSettings) {
			this.worker.postMessage(['createSimulator', particleSettings])
		};

		return ParticlesWorker
	});