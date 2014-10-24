var baseUrl = '../../../../../';

var MainWorker;

importScripts(baseUrl+'js/lib/require.js');
importScripts(baseUrl+'js/lib/goo/goo.js');

require.config({
	baseUrl: baseUrl+'js/',
	paths: {
		particles:'submodules/particle_simulator/src'
	}
});


require(
	[
		'particles/worker/ParticleSimulator',
		'particles/protocol/ParticleProtocol'
	],
	function(
		ParticleSimulator,
		ParticleProtocol
		) {

		var ParticleWorkerMain = function() {
			this.particleProtocol = new ParticleProtocol();
		};

		ParticleWorkerMain.prototype.createSimulator = function(msg) {
			console.log("Worker create simulator", msg)
		};

		ParticleWorkerMain.prototype.dataPacketReceived = function(data) {
			console.log("Worker get data", data)
		};

		ParticleWorkerMain.prototype.spawnSimulation = function(msg) {
			console.log("Worker spawn simulator", msg)
		};

		ParticleWorkerMain.prototype.setSimulatorProtocol = function(msg) {
			console.log("Worker set protocol", msg)
		};

		ParticleWorkerMain.prototype.fetchSimulationFrame = function(msg) {
			console.log("Worker fetch frame", msg)
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

	if (oEvent.data[0].byteLength == 0) {
		MainWorker.dataPacketReceived(oEvent.data);
	}

	if (oEvent.data[0] == 'spawnSimulation') {
		MainWorker.spawnSimulation(oEvent.data[1]);
		return;
	}

	if (oEvent.data[0] == 'fetchSimulationFrame') {
		MainWorker.fetchSimulationFrame(oEvent.data[1]);
		return;
	}

	if (oEvent.data[0] == 'createSimulator') {
		MainWorker.createSimulator(oEvent.data[1]);
		return;
	}

	if (oEvent.data[0] == 'setSimulatorProtocol') {
		MainWorker.setSimulatorProtocol(oEvent.data[1]);
		return;
	}

};

onmessage = function (oEvent) {
	handleMessage(oEvent);
};