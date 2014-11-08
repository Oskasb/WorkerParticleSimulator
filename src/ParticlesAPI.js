"use strict";
define([
	'particle_system/ParticleSystem'
],
	function (
		ParticleSystem
		) {

		var ParticlesAPI = function(goo) {
			this.particleSystem = new ParticleSystem(goo);
		};

		ParticlesAPI.prototype.setEnabled = function(enabled) {
			this.enabled = enabled;
		};

		ParticlesAPI.prototype.requestFrameUpdate = function(tpf) {
			this.particleSystem.update(tpf);
		};

		ParticlesAPI.prototype.spawnParticles = function(id, position, normal, effectData, callbacks) {
			this.particleSystem.spawnParticleSimulation(id, position, normal, effectData, callbacks)
		};

		ParticlesAPI.prototype.wakeParticle = function(id, position, normal, effectData) {
		//	this.particleSystem.wakeParticle(id)
		};

		ParticlesAPI.prototype.createParticleSystems = function(systemConfigs, rendererConfigs, atlasConfigs) {
			this.particleSystem.addConfiguredSystems(systemConfigs, rendererConfigs,atlasConfigs)
		};

		ParticlesAPI.prototype.removeParticleSystem = function(id) {
			this.particleSystem.remove(id)
		};

		return ParticlesAPI
	});