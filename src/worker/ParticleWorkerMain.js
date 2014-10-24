var baseUrl = '../../../../../';

var MainWorker;

importScripts(baseUrl+'js/lib/require.js');
importScripts(baseUrl+'js/lib/goo/goo.js');

require.config({
	baseUrl: baseUrl+'js/',
	paths: {
		particle_simulator:'submodules/particle_simulator/src'
	}
});


require(
	[
		'particle_simulator/worker/ParticleSimulator',
		'particle_simulator/protocol/ParticleProtocol'
	],
	function(
		ParticleSimulator,
		ParticleProtocol
		) {

		var ParticleWorkerMain = function() {

			this.particleProtocol = new ParticleProtocol();

			this.simulators = {};
			this.currentSimulatorId = null;

		};

		ParticleWorkerMain.prototype.createSimulator = function(data) {
			console.log("Worker create simulator", data)
			this.simulators[data.id] = new ParticleSimulator(data.id, data);

		};

		ParticleWorkerMain.prototype.initSimulationFrame = function(data) {
		//	console.log("Worker get data", data);
			this.currentSimulatorId = data.id;
			var entry = this.particleProtocol.updateData(data);

			this.simulators[entry.id].updateSimulator(entry.posData, entry.colData, entry.uvData, entry.indexTransfer, entry.tpf);

			var frame =  this.particleProtocol.updateData(entry);
			postMessage(frame, [frame.posData.buffer, frame.colData.buffer, frame.uvData.buffer]);

		};

		ParticleWorkerMain.prototype.spawnSimulation = function(data) {
			this.simulators[data[1]].spawnSimulation(data[2], data[3], data[4]);
		};

		MainWorker = new ParticleWorkerMain();
	}
);

var handleMessage = function(oEvent) {

	if (!MainWorker) {
		console.log("ParticleMainWorker not yet ready: ", oEvent);
		setTimeout(function() {
			handleMessage(oEvent);
		}, 250);
		return;
	}

	if (oEvent.data.tpf) {
		MainWorker.initSimulationFrame(oEvent.data);
	}

	if (oEvent.data[0] == 'spawnSimulation') {
		MainWorker.spawnSimulation(oEvent.data);
		return;
	}

	if (oEvent.data[0] == 'createSimulator') {
		MainWorker.createSimulator(oEvent.data[1]);
		return;
	}

};

onmessage = function (oEvent) {
	handleMessage(oEvent);
};