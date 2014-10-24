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

			this.simulators[data.id].updateSimulator(data.posData, data.colData, data.uvData, data.indexTransfer, data.tpf);

			var frame = this.particleProtocol.updateData(data);
			postMessage(frame, [frame.posData.buffer, frame.colData.buffer, frame.uvData.buffer]);

		};

		ParticleWorkerMain.prototype.spawnSimulation = function(data) {
			this.simulators[data[1]].spawnSimulation(data[2], data[3], data[4]);
		};

		MainWorker = new ParticleWorkerMain();
		postMessage(['ready']);
	}
);

var handleMessage = function(oEvent) {

	if (!MainWorker) {
		console.log("ParticleMainWorker not yet ready: ", oEvent);
		if (oEvent.data[0] ==  'createSimulator') {
			setTimeout(function() {
				handleMessage(oEvent);
			}, 250);
		} else {
			console.log("Not ready..! ", oEvent.data);
			postMessage(['clear', oEvent.data[0]])
		}

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