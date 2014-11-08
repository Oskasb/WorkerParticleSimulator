define([
	'goo/math/Vector3',
	'goo/math/Vector4'
],

function (
	Vector3,
	Vector4
) {
	"use strict";

	function Particle(idx) {
		this.index = idx;
		this.position 	= new Vector3();
		this.direction = new Vector3();
		this.velocity 	= new Vector3();
		this.color 		= new Vector4();


		this.id = Particle.ID++;
		this.reset();
	}

	Particle.ID = 0;

	Particle.prototype.reset = function () {
		this.position.set(0, 0, 0);
		this.velocity.set(0, 0, 0);
		this.color.set(1, 1, 1, 1);

		this.opacity = 1;
		this.alpha = [[0, 0], [1, 1]];

		this.size = 1;
		this.growthFactor = 1;
		this.growth = [[0, 1], [1, 0]];

		this.acceleration = 1;
		this.gravity = 0;
		this.rotation = 0;
		this.spinspeed = 0;
		this.spin = [[0, 1], [1, 0]];

		this.lifeSpan = 0;
		this.lifeSpanTotal = 0;
		this.progress = 0;
		this.frameOffset = 0;
		this.frameCount = 0;

		this.tileIndex = 0;
		this.offsetX = 0;
		this.offsetY = 0;

		this.dead = true;
	};

	function randomBetween(min, max) {
		return Math.random() * (max - min) + min;
	}


	Particle.prototype.joinSimulation = function (simParams, ratio) {
		var simD = simParams.data;
		this.position.x = simParams.position.x + simParams.normal.x*ratio *simD.stretch;
		this.position.y = simParams.position.y + simParams.normal.y*ratio *simD.stretch;
		this.position.z = simParams.position.z + simParams.normal.z*ratio *simD.stretch;

		this.direction.x = (Math.random() -0.5) * (2*simD.spread) + (1-simD.spread)*simParams.normal.x;
		this.direction.y = (Math.random() -0.5) * (2*simD.spread) + (1-simD.spread)*simParams.normal.y;
		this.direction.z = (Math.random() -0.5) * (2*simD.spread) + (1-simD.spread)*simParams.normal.z;

		this.direction.normalize();

		this.velocity.x = simD.strength*this.direction.x;
		this.velocity.y = simD.strength*this.direction.y;
		this.velocity.z = simD.strength*this.direction.z;

		this.sprite = simD.sprite;
		this.trailSprite = simD.trailsprite;
		this.trailWidth = simD.trailwidth;
		this.loopcount = simD.loopcount;
		this.color.set(simD.color);
		this.opacity = randomBetween(simD.opacity[0], simD.opacity[1]);
		this.alpha = simD.alpha;

		this.size = randomBetween(simD.size[0], simD.size[1]);
		this.growthFactor = randomBetween(simD.growthFactor[0], simD.growthFactor[1]);
		this.growth = simD.growth;

		this.spin = simD.spin;
		this.spinspeed = randomBetween(simD.spinspeed[0], simD.spinspeed[1]);
		this.rotation = randomBetween(simD.rotation[0], simD.rotation[1]);

		this.acceleration = simD.acceleration;
		this.gravity = simD.gravity;

		this.progress = 0;
		this.lifeSpan = randomBetween(simD.lifespan[0], simD.lifespan[1]);
		this.lifeSpanTotal = this.lifeSpan;

		this.frameOffset = ratio;

		this.dead = false;
	};

	Particle.prototype.setTileInfo = function (tileInfo, scaleX, scaleY) {
		this.tileInfo = tileInfo;
		this.scaleX = scaleX;
		this.scaleY = scaleY;
	};

	Particle.prototype.setTrailInfo = function (trailInfo, trailScaleX, trailScaleY) {
		this.trailInfo = trailInfo;
		this.trailScaleX = trailScaleX;
		this.trailScaleY = trailScaleY;
		this.trailOffsetX = this.trailScaleX * this.trailInfo.tiles[0][0];
		this.trailOffsetY = 1 - this.trailScaleY * (this.trailInfo.tiles[0][1]+1);
	};



	Particle.prototype.selectAnimationFrame = function() {
		this.tileIndex = Math.floor(this.tileInfo.tiles.length * this.progress * this.loopcount) % this.tileInfo.tiles.length;
	};

	Particle.prototype.updateAtlasOffsets = function() {
		if (this.tileInfo.tiles.length > 1) {
			this.selectAnimationFrame();
		}
		this.offsetX = this.scaleX * this.tileInfo.tiles[this.tileIndex][0];
		this.offsetY = 1 - this.scaleY * (this.tileInfo.tiles[this.tileIndex][1]+1);
	};

	Particle.prototype.setDataUsage = function () {
	};

	return Particle;
});