"use strict";

define([
	'goo/math/Vector3',
	'particle_system/simulation/SimulationParameters',
	'particle_system/defaults/DefaultSimulationParams'

], function(
	Vector3,
	SimulationParameters,
    DefaultSimulationParams
	) {

	var ParticleSimulation = function() {
		this.resetSimulation();
	};

	ParticleSimulation.prototype.resetSimulation = function() {
		this.renderers = [];
		this.particles = [];
		this.recover = [];
		this.active = false;
        this.onUpdate = null;
        this.particleUpdate = null;
	};

	ParticleSimulation.prototype.initSimulation = function(posVec, normVec, defaultSettings, effectData) {
		this.resetSimulation();
		this.params = new SimulationParameters(posVec, normVec, DefaultSimulationParams.particle_params, effectData);
		this.calcVec = new Vector3();
		this.active = true;
	};


    ParticleSimulation.prototype.registerEffectCallbacks = function(callbacks) {
        if (callbacks.onUpdate) {
            this.onUpdate = callbacks.onUpdate;
        }

        if (callbacks.particleUpdate) {
            this.particleUpdate = callbacks.particleUpdate;
        }

    };

	ParticleSimulation.prototype.registerParticleRenderer = function(renderer) {
		this.renderers.push(renderer);
	};

	ParticleSimulation.prototype.attachSpawnBehaviour = function(nr, rendererName) {
		this.behaviors[nr] = createSpawner(rendererName);
	};

	ParticleSimulation.prototype.notifyDied = function(particle) {
		particle.reset();
		for (var i = 0; i < this.renderers.length; i++) {
			this.renderers[i].died(particle)
		}
		this.recover.push(particle);
	};



	ParticleSimulation.prototype.includeParticle = function(particle, ratio) {
		particle.joinSimulation(this.params, ratio);
		this.particles.push(particle);
	};

	ParticleSimulation.prototype.getInterpolatedInCurveAboveIndex = function(value, curve, index) {
		return curve[index][1] + (value - curve[index][0]) / (curve[index+1][0] - curve[index][0])*(curve[index+1][1]-curve[index][1]);
	};

	ParticleSimulation.prototype.valueFromCurve = function(value, curve) {
		for (var i = 0; i < curve.length; i++) {
			if (!curve[i+1]) return 0;
			if (curve[i+1][0] > value) return this.getInterpolatedInCurveAboveIndex(value, curve, i)
		}
		return 0;
	};

	ParticleSimulation.prototype.updateSimParticles = function(tpf) {

        if (this.onUpdate) {
            this.onUpdate(this);
        }


		for (var i = 0; i < this.particles.length; i++) {
			var particle = this.particles[i];

			if (particle == undefined) {
				console.error("no particle", this.particles.length, i);
				continue
			}

			if (particle.dead) {
				continue;
			}

			// Particles need to have a fixed geometry the first frame of their life or things go bonkerz when framerate varies.
			var deduct = tpf;
			if (!particle.frameCount) {
				deduct = 0.016;
			}

			particle.lifeSpan -= deduct;

            if (this.particleUpdate) {
                this.particleUpdate(particle);
            } else {
                // Note frame offset expects ideal frame (0.016) to make stable geometries
                particle.progress = 1-((particle.lifeSpan - particle.frameOffset*0.016)  / particle.lifeSpanTotal);

                particle.size += particle.growthFactor * this.valueFromCurve(particle.progress, particle.growth) * deduct;
                particle.rotation += particle.spinspeed * this.valueFromCurve(particle.progress, particle.spin) * deduct;

                particle.velocity.muld(particle.acceleration, particle.acceleration, particle.acceleration);
                particle.velocity.add_d(0, particle.gravity*deduct, 0);

                this.calcVec.set(particle.velocity)
                this.calcVec.muld(deduct, deduct, deduct);
                particle.position.addv(this.calcVec);

                particle.color.data[3] = particle.opacity * this.valueFromCurve(particle.progress, particle.alpha);

            }


            if (particle.lifeSpan < 0) {
                this.notifyDied(particle);
                continue;
            }

			this.renderParticle(tpf, particle);
		}

	};

	ParticleSimulation.prototype.renderParticle = function(tpf, particle) {

		for (var i = 0; i < this.renderers.length; i++) {
			if (typeof(this.renderers[i].updateParticle) == 'function') {
				this.renderers[i].updateParticle(tpf, particle)
			}

		}

	};

	return ParticleSimulation
})
;