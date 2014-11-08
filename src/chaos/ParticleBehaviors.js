define([
	'goo/math/Vector3',
	'goo/math/Vector4',
	'goo/math/Transform',
	'goo/math/Matrix4x4',
	'goo/math/MathUtils'
],

function(
	Vector3,
	Vector4,
	Transform,
	Matrix4x4,
	MathUtils
) {
	"use strict";

	function ParticleBehaviors() {}

	ParticleBehaviors.vec = new Vector3();
	ParticleBehaviors.vec2 = new Vector3();
	ParticleBehaviors.transform = new Transform();

	ParticleBehaviors.meshSpawner = function(simulator) {
		if (!simulator.entity) {
			return;
		}

		var vec = ParticleBehaviors.vec;
		var vec2 = ParticleBehaviors.vec2;
		var transform = ParticleBehaviors.transform;
		while (simulator.aliveParticles < simulator.settings.poolCount) {
			var particle = simulator.wakeParticle();

			var startind = Math.max(0, Math.floor(Math.random() * simulator.meshPositions.length * 3) - 3);
			var pos = simulator.meshPositions;
			vec.setd(pos[startind + 0], pos[startind + 1], pos[startind + 2]);

			if (simulator.jointTransforms) {
				var jointind = Math.floor(Math.random() * simulator.jointTransforms.length);
				particle.jointind = jointind;
				var jointTransform = simulator.jointTransforms[jointind];
				transform.matrix.copy(jointTransform.matrix);
				jointTransform.matrix.getTranslation(transform.translation);
				vec.setv(transform.translation);

				// vec.mul(0.01);
			}

			var entityTransform = simulator.entity.transformComponent.worldTransform;
			entityTransform.applyForward(vec, vec);
			particle.position.setv(vec);

			particle.startind = startind;
		}
	};

	ParticleBehaviors.meshFollower = function(tpf, particle, settings, simulator) {
		if (!simulator.entity) {
			return;
		}

		var vec = ParticleBehaviors.vec;
		var transform = ParticleBehaviors.transform;

		var startind = particle.startind;
		var pos = simulator.meshPositions;
		vec.setd(pos[startind + 0], pos[startind + 1], pos[startind + 2]);

		if (simulator.jointTransforms) {
			var jointTransform = simulator.jointTransforms[particle.jointind];
			transform.matrix.copy(jointTransform.matrix);
			jointTransform.matrix.getTranslation(transform.translation);
			vec.setv(transform.translation);

			// vec.mul(0.01);
		}

		var entityTransform = simulator.entity.transformComponent.worldTransform;
		entityTransform.applyForward(vec, vec);
		particle.position.setv(vec);
	};

	ParticleBehaviors.sphereSpawner = function(simulator) {
		var vec = ParticleBehaviors.vec;
		var vec2 = ParticleBehaviors.vec2;
		while (simulator.aliveParticles < simulator.settings.poolCount) {
			var size = 2;
			var x = (Math.random() * 2 - 1) * size;
			var y = (Math.random() * 2 - 1) * size;
			var z = (Math.random() * 2 - 1) * size;
			var particle = simulator.wakeParticle();
			vec.setd(x, y, z);
			vec.normalize().mul(3);
			particle.position.setv(vec);

			var x = (Math.random() * 2 - 1) * size;
			var y = (Math.random() * 2 - 1) * size;
			var z = (Math.random() * 2 - 1) * size;
			vec2.setd(x, y, z);
			vec2.cross(vec).normalize().mul(5.5);
			particle.velocity.setv(vec2);
		}
	};

	ParticleBehaviors.randomSpawner = function(simulator) {
		var vec = ParticleBehaviors.vec;
		var vec2 = ParticleBehaviors.vec2;
		if (simulator.aliveParticles < simulator.settings.poolCount && Math.random() > 0.5) {
			var size = 30;
			var x = (Math.random() * 2 - 1) * size;
			var y = (Math.random() * 2 - 1) * size + size;
			var z = (Math.random() * 2 - 1) * size + 52;
			var particle = simulator.wakeParticle();
			vec.setd(x, y, z);
			// vec.normalize().mul(Math.random()*3);
			particle.position.setv(vec);

			// var x = (Math.random() * 2 - 1) * size;
			// var y = (Math.random() * 2 - 1) * size;
			// var z = (Math.random() * 2 - 1) * size;
			// vec2.setd(x, y, z);
			// vec2.cross(vec).normalize().mul(1.0);
			// particle.velocity.setv(vec2);
		}
	};

	ParticleBehaviors.basic = function(tpf, particle, settings) {
		particle.velocity.y -= 9.8 * tpf;
	};

	ParticleBehaviors.flockcenter = function(tpf, particle, settings) {
		var vec = ParticleBehaviors.vec;
		vec.setd(0, 0, 0).subv(particle.position).muld(tpf, tpf, tpf);
		particle.velocity.addv(vec);
	};

	ParticleBehaviors.sineWorld = function(tpf, particle, settings, simulator) {
		var vec = ParticleBehaviors.vec;
		var place = (particle.id % settings.poolCount) / settings.poolCount;
		var t = simulator.goo.world.time * 0.04 * (particle.id % 2 == 0 ? 1 : -1) * (1 + place * 0.5) + place * Math.PI * 2;
		var dist = 70 + place * 30;
		var x = Math.sin(t * 0.8) * dist;
		var y = Math.sin(t * (5 + 3 * place) + place * 100) * (5 * place + 10) + 40 + place * 20;
		var z = Math.cos(t) * dist;
		vec.setd(x, y, z);
		particle.position.setv(vec);
	};

	ParticleBehaviors.flockcenter2 = function(tpf, particle, settings, simulator) {
		var vec = ParticleBehaviors.vec;
		var mul = 2.5;
		vec.setd(0, 0, 0).subv(particle.position).muld(tpf * mul, tpf * mul, tpf * mul);
		particle.velocity.addv(vec);

		// if (Math.random() > 0.992) {
		// 	var particle2 = simulator.wakeParticle();
		// 	if (!particle2) {
		// 		return;
		// 	}
		// 	particle2.position.setv(particle.position);
		// 	particle2.velocity.setv(particle.velocity);
		// 	particle2.velocity.add_d(
		// 		(Math.random()-0.5)*1,
		// 		(Math.random()-0.5)*1,
		// 		(Math.random()-0.5)*1
		// 	);
		// }
	};

	ParticleBehaviors.flockall = function(tpf, particle, settings, simulator) {
		var vec = ParticleBehaviors.vec;
		var vec2 = ParticleBehaviors.vec2;

		vec.setd(0, 0, 0);
		for (var i = 0; i < simulator.aliveParticles; i++) {
			var otherParticle = simulator.particles[i];
			if (particle === otherParticle) {
				continue;
			}

			var dist = vec2.setv(particle.position).subv(otherParticle.position).length();
			var mult = 1 - MathUtils.smoothstep(0, 1, dist);
			vec2.muld(mult, mult, mult);
			vec.addv(vec2);
		}

		vec.muld(tpf, tpf, tpf);
		vec2.setd(0, 0, 0).subv(particle.position).muld(tpf, tpf, tpf);
		var s = 0.5;
		vec.muld(s, s, s);

		particle.velocity.addv(vec);
		particle.velocity.addv(vec2);
	};

	return ParticleBehaviors;
});