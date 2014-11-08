define([
	'particle_system/simulation/ParticleSimulator'
],

function (
	ParticleSimulator
) {
	"use strict";

	function ParticleSystem(goo) {
		this.goo = goo;
		this.atlases = {};
		this.simData = {};
		this.simulators = {};
		this.groups = {};
	}

	ParticleSystem.prototype.attachAtlases = function (atlasConfigs) {
		for (var i = 0; i < atlasConfigs.atlases.length; i++) {
			this.atlases[atlasConfigs.atlases[i].id] = atlasConfigs.atlases[i];
		}
	};

	ParticleSystem.prototype.getAtlasForSetting = function(simSettings) {
		return this.atlases[simSettings.atlas];
	};

	ParticleSystem.prototype.addConfiguredSystems = function (simConfigs, rendererConfigs, atlasConfigs) {
		this.attachAtlases(atlasConfigs);
		for (var i = 0; i < simConfigs.simulators.length; i++) {
			var simSettings = simConfigs.simulators[i];
			var simulator = new ParticleSimulator(this.goo, simSettings, rendererConfigs, this.getAtlasForSetting(simSettings));
			this.simulators[simSettings.id] = simulator;
		}
	};

	ParticleSystem.prototype.spawnParticleSimulation = function(id, position, normal, effectData, callbacks) {
		this.simulators[id].addEffectSimulation(position, normal, effectData, callbacks)
	};

	ParticleSystem.prototype.get = function (id) {
		return this.simulators[id];
	};

	ParticleSystem.prototype.remove = function (id) {
		if (this.simulators[id]) {
			this.simulators[id].remove();
			delete this.simulators[id];
		}
	};

	ParticleSystem.prototype.wakeParticle = function(id) {
		var simulator = this.simulators[id];
		if (simulator) {
			return simulator.wakeParticle();
		}
	};

	ParticleSystem.prototype.setVisible = function(id, visible) {
		var simulator = this.simulators[id];
		if (simulator) {
			return simulator.setVisible(visible);
		}
	};

	ParticleSystem.prototype.update = function(tpf) {
		var infostr = '';
		for (var simulatorId in this.simulators) {
			var simulator = this.simulators[simulatorId];
			simulator.update(tpf);

			infostr += simulatorId + ' = ' + simulator.aliveParticles + '<br>';
		}

		// document.getElementById('particlestats').innerHTML = infostr;
	};

	return ParticleSystem;
});