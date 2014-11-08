define([
		'goo/renderer/MeshData',
		'goo/renderer/Shader',
		'goo/renderer/Material',
		'goo/renderer/shaders/ShaderLib',
		'goo/math/Vector3',
		'goo/math/Vector4',
		'goo/math/MathUtils',
		'goo/entities/components/MeshRendererComponent',
		'goo/renderer/Renderer',
		'goo/renderer/TextureCreator'
	],

	function(
		MeshData,
		Shader,
		Material,
		ShaderLib,
		Vector3,
		Vector4,
		MathUtils,
		MeshRendererComponent,
		Renderer,
		TextureCreator
	) {
		"use strict";

		function TrailRenderer() {
			this.settings = null;
			this.entity = null;
			this.meshData = null;

			this.segmentCount = 0;
			this.sprites = {};
			this.trailDatas = [];
			this.facingMode = 'Billboard'; //'Tangent'
			// 	this.updateMode = 'Step'; //'Interpolate'
			this.updateMode = 'Interpolate'; //'Step'
		}

		function TrailData(segments) {
			this.isReset = true;
			this.width = 1;
			this.invalid = true;
			this.throttle = 10;
			this.trailSegmentDatas = [];
			for (var i = segments - 1; i >= 0; i--) {
				this.trailSegmentDatas.push(new TrailSegmentData());
			}
		}

		function TrailSegmentData() {
			this.position = new Vector3();
			this.tangent = new Vector3();
			this.interpolatedPosition = new Vector3();
		}

		function randomBetween(min, max) {
			return Math.random() * (max - min) + min;
		}

		TrailRenderer.prototype.init = function(goo, simConf, settings, spriteAtlas) {
			this.settings = settings;

			this.atlasConf = spriteAtlas;

			for (var i = 0; i < this.atlasConf.sprites.length; i++) {
				this.sprites[this.atlasConf.sprites[i].id] = this.atlasConf.sprites[i];
			}

			this.scaleX = 1 / this.atlasConf.textureUrl.tilesX;
			this.scaleY = 1 / this.atlasConf.textureUrl.tilesY;

			this.segmentCount = settings.segmentCount || 8;

			settings.poolCount = simConf.poolCount;

			var attributeMap = MeshData.defaultMap([MeshData.POSITION, MeshData.TEXCOORD0, MeshData.COLOR]);
			attributeMap.TILE = MeshData.createAttribute(4, 'Float');
			var meshData = new MeshData(attributeMap,
				settings.poolCount * this.segmentCount * 2,
				settings.poolCount * (this.segmentCount - 1) * 6);
			meshData.vertexData.setDataUsage('DynamicDraw');
			this.meshData = meshData;

			var material = new Material(particleShader);
			material.uniforms.alphakill = simConf.alphakill.value;
			material.blendState.blending = simConf.blending.value;
			material.cullState.enabled = false;
			material.depthState.write = false;
			material.renderQueue = settings.renderqueue !== undefined ? settings.renderqueue : 3010;
			var entity = this.entity = goo.world.createEntity(meshData);
			entity.set(new MeshRendererComponent(material));
			entity.name = 'TrailRenderer';
			entity.meshRendererComponent.cullMode = 'Never';
			entity.addToWorld();

			// var material2 = Material.createMaterial(ShaderLib.simpleColored);
			// material2.wireframe = true;
			// material2.uniforms.color = [1.0,0.0,0.0];
			// material2.uniforms.alphakill = settings.alphakill.value;
			// material2.blendState.blending = settings.blending.value;
			// material2.cullState.enabled = false;
			// material2.depthState.enabled = false;
			// material2.renderQueue = 3010;
			// entity.meshRendererComponent.materials[1] = material2;

			entity.skip = true;
			var textureCreator = new TextureCreator();
			var texture = textureCreator.loadTexture2D(this.atlasConf.textureUrl.value, {
				wrapS: 'EdgeClamp',
				wrapT: 'EdgeClamp'
			}, function() {
				entity.skip = false;
			});
			material.setTexture('PARTICLE_MAP', texture);



			var col = this.meshData.getAttributeBuffer(MeshData.COLOR);
			var texcoord = this.meshData.getAttributeBuffer(MeshData.TEXCOORD0);
			var tile = this.meshData.getAttributeBuffer('TILE');
			var indices = this.meshData.getIndexBuffer();
			for (var i = 0; i < settings.poolCount; i++) {
				var trailData = new TrailData(this.segmentCount);
				trailData.width = this.settings.width.value;
				this.trailDatas.push(trailData);

				for (var j = 0; j < this.segmentCount; j++) {
					tile[this.segmentCount * 8 * i + j * 8 + 0] = 0; //offset u
					tile[this.segmentCount * 8 * i + j * 8 + 1] = 0; //offset w
					tile[this.segmentCount * 8 * i + j * 8 + 2] = 1; //scale u
					tile[this.segmentCount * 8 * i + j * 8 + 3] = 1; //scale w
					tile[this.segmentCount * 8 * i + j * 8 + 4] = 0; //offset u
					tile[this.segmentCount * 8 * i + j * 8 + 5] = 0; //offset w
					tile[this.segmentCount * 8 * i + j * 8 + 6] = 1; //scale u
					tile[this.segmentCount * 8 * i + j * 8 + 7] = 1; //scale w

					col[this.segmentCount * 8 * i + j * 8 + 0] = 1;
					col[this.segmentCount * 8 * i + j * 8 + 1] = 1;
					col[this.segmentCount * 8 * i + j * 8 + 2] = 1;
					col[this.segmentCount * 8 * i + j * 8 + 3] = 1;
					col[this.segmentCount * 8 * i + j * 8 + 4] = 1;
					col[this.segmentCount * 8 * i + j * 8 + 5] = 1;
					col[this.segmentCount * 8 * i + j * 8 + 6] = 1;
					col[this.segmentCount * 8 * i + j * 8 + 7] = 1;

					texcoord[this.segmentCount * 4 * i + j * 4 + 0] = j / this.segmentCount;
					texcoord[this.segmentCount * 4 * i + j * 4 + 1] = 0;
					texcoord[this.segmentCount * 4 * i + j * 4 + 2] = j / this.segmentCount;
					texcoord[this.segmentCount * 4 * i + j * 4 + 3] = 1;
				}

				var segCount = this.segmentCount - 1;
				for (var j = 0; j < segCount; j++) {
					indices[segCount * 6 * i + j * 6 + 0] = this.segmentCount * 2 * i + j * 2 + 0;
					indices[segCount * 6 * i + j * 6 + 1] = this.segmentCount * 2 * i + j * 2 + 1;
					indices[segCount * 6 * i + j * 6 + 2] = this.segmentCount * 2 * i + j * 2 + 2;
					indices[segCount * 6 * i + j * 6 + 3] = this.segmentCount * 2 * i + j * 2 + 2;
					indices[segCount * 6 * i + j * 6 + 4] = this.segmentCount * 2 * i + j * 2 + 1;
					indices[segCount * 6 * i + j * 6 + 5] = this.segmentCount * 2 * i + j * 2 + 3;
				}
			}
		};

		TrailRenderer.prototype.setTrailFront = function(trailData, position, tangent, tpf) {
			var trail = null;

			if (trailData.isReset) {
				for (var i = 0; i < this.segmentCount; i++) {
					var trailSegmentData = trailData.trailSegmentDatas[i];
					trailSegmentData.position.setv(position);
				}

				trailData.isReset = false;
			}

			var trailSegmentDatas = trailData.trailSegmentDatas;
			// Check if time to add or wrap the trail sections
			trailData.throttle += tpf * this.settings.updateSpeed.value;
			if (trailData.throttle > 1.0) {
				trailData.throttle %= 1.0;

				trail = trailSegmentDatas.splice(trailSegmentDatas.length - 1, 1)[0]; // removeLast();
				trailSegmentDatas.splice(0, 0, trail); // addFirst(trail);
			} else {
				trail = trailSegmentDatas[0]; // get first
			}

			// Always update the front section
			trail.position.setv(position);
			if (tangent != null) {
				trail.tangent.setv(tangent);
			}
			trailData.invalid = true;
		};

		TrailRenderer.prototype.updateTrail = function(trailData, particle, camPos, index) {


			var trailSegmentDatas = trailData.trailSegmentDatas;

			if (trailData.invalid || this.facingMode == 'Billboard') {
				if (this.updateMode == 'Step') {
					this.updateStep(trailData, particle, camPos, index);
				} else {
					this.updateInterpolate(trailData, particle, camPos, index);
				}
				trailData.invalid = false;
			}
		};

		var trailDirection = new Vector3();
		var trailCamVec = new Vector3();

		TrailRenderer.prototype.updateStep = function(trailData, particle, camPos, index) {
			var trailSegmentDatas = trailData.trailSegmentDatas;

			var pos = this.meshData.getAttributeBuffer(MeshData.POSITION);
			var col = this.meshData.getAttributeBuffer(MeshData.COLOR);

			for (var i = 0; i < this.segmentCount; i++) {
				var trailSegmentData = trailSegmentDatas[i];
				var trailVector = trailSegmentData.position;

				if (this.facingMode == 'Billboard') {
					if (i === 0) {
						trailDirection.set(trailSegmentDatas[i + 1].position).subv(trailVector);
					} else if (i === this.segmentCount - 1) {
						trailDirection.set(trailVector).subv(trailSegmentDatas[i - 1].position);
					} else {
						trailDirection.set(trailSegmentDatas[i + 1].position)
							.subv(trailSegmentDatas[i - 1].position);
					}

					trailCamVec.set(trailVector).subv(camPos);
					trailDirection.cross(trailCamVec);
					trailDirection.normalize().mul(trailData.width * particle.size);
				} else if (trailSegmentData.tangent != null) {
					trailDirection.set(trailSegmentData.tangent).mul(trailData.width * particle.size);
				} else {
					trailDirection.set(trailData.width * particle.size, 0, 0);
				}

				pos[(index * this.segmentCount * 6) + 6 * i + 0] = trailVector.x - trailDirection.x;
				pos[(index * this.segmentCount * 6) + 6 * i + 1] = trailVector.y - trailDirection.y;
				pos[(index * this.segmentCount * 6) + 6 * i + 2] = trailVector.z - trailDirection.z;

				pos[(index * this.segmentCount * 6) + 6 * i + 3] = trailVector.x + trailDirection.x;
				pos[(index * this.segmentCount * 6) + 6 * i + 4] = trailVector.y + trailDirection.y;
				pos[(index * this.segmentCount * 6) + 6 * i + 5] = trailVector.z + trailDirection.z;

				col[(index * this.segmentCount * 8) + 8 * i + 3] = particle.color.data[3];
			}
		};

		TrailRenderer.prototype.updateInterpolate = function(trailData, particle, camPos, index) {
			var trailSegmentDatas = trailData.trailSegmentDatas;
			particle.setTrailInfo(this.sprites[particle.trailSprite], this.scaleX, this.scaleY);
			var pos = this.meshData.getAttributeBuffer(MeshData.POSITION);
			var col = this.meshData.getAttributeBuffer(MeshData.COLOR);
			var tile = this.meshData.getAttributeBuffer('TILE');

			for (var i = 0; i < this.segmentCount; i++) {
				var trailSegmentData = trailSegmentDatas[i];
				var interpolationVector = trailSegmentData.interpolatedPosition;

				interpolationVector.setv(trailSegmentData.position);

				if (i > 0) {
					interpolationVector.lerp(trailSegmentDatas[i - 1].position, trailData.throttle);
				}
			}



			var coldata = particle.color.data;
			var w = particle.size * particle.trailWidth;
			for (var i = 0; i < this.segmentCount; i++) {
				var trailSegmentData = trailSegmentDatas[i];
				var trailVector = trailSegmentData.interpolatedPosition;

				if (this.facingMode == 'Billboard') {
					if (i === 0) {
						trailDirection.setv(trailSegmentDatas[i + 1].interpolatedPosition).subv(trailVector);
					} else if (i === this.segmentCount - 1) {
						trailDirection.setv(trailVector).subv(trailSegmentDatas[i - 1].interpolatedPosition);
					} else {
						trailDirection.setv(trailSegmentDatas[i + 1].interpolatedPosition)
							.subv(trailSegmentDatas[i - 1].interpolatedPosition);
					}

					trailCamVec.setv(trailVector).subv(camPos);

					// trailDirection.cross(trailCamVec);
					var ldata = trailDirection.data;
					var rdata = trailCamVec.data;
					var x = rdata[2] * ldata[1] - rdata[1] * ldata[2];
					var y = rdata[0] * ldata[2] - rdata[2] * ldata[0];
					var z = rdata[1] * ldata[0] - rdata[0] * ldata[1];

					// trailDirection.normalize().muld(w, w, w);
					var l = Math.sqrt(x * x + y * y + z * z); //this.length();

					if (l < 0.0000001) {
						x = 0;
						y = 0;
						z = 0;
					} else {
						l = 1.0 / l;
						x *= l * w;
						y *= l * w;
						z *= l * w;
					}

					trailDirection.data[0] = x;
					trailDirection.data[1] = y;
					trailDirection.data[2] = z;
				} else if (trailSegmentData.tangent !== null) {
					trailDirection.setv(trailSegmentData.tangent).muld(w, w, w);
				} else {
					trailDirection.setd(w, 0, 0);
				}


				tile[(index * this.segmentCount * 8)+ i * 8 + 0] = particle.trailOffsetX; //offset u
				tile[(index * this.segmentCount * 8)+ i * 8 + 1] = particle.trailOffsetY; //offset w
				tile[(index * this.segmentCount * 8)+ i * 8 + 2] = this.scaleX; //scale u
				tile[(index * this.segmentCount * 8)+ i * 8 + 3] = this.scaleY; //scale w
				tile[(index * this.segmentCount * 8)+ i * 8 + 4] = particle.trailOffsetX; //offset u
				tile[(index * this.segmentCount * 8)+ i * 8 + 5] = particle.trailOffsetY; //offset w
				tile[(index * this.segmentCount * 8)+ i * 8 + 6] = this.scaleX; //scale u
				tile[(index * this.segmentCount * 8)+ i * 8 + 7] = this.scaleY; //scale w


				pos[(index * this.segmentCount * 6) + 6 * i + 0] = trailVector.data[0] - trailDirection.data[0];
				pos[(index * this.segmentCount * 6) + 6 * i + 1] = trailVector.data[1] - trailDirection.data[1];
				pos[(index * this.segmentCount * 6) + 6 * i + 2] = trailVector.data[2] - trailDirection.data[2];

				pos[(index * this.segmentCount * 6) + 6 * i + 3] = trailVector.data[0] + trailDirection.data[0];
				pos[(index * this.segmentCount * 6) + 6 * i + 4] = trailVector.data[1] + trailDirection.data[1];
				pos[(index * this.segmentCount * 6) + 6 * i + 5] = trailVector.data[2] + trailDirection.data[2];

				col[(index * this.segmentCount * 8) + 8 * i + 0] = coldata[0];
				col[(index * this.segmentCount * 8) + 8 * i + 1] = coldata[1];
				col[(index * this.segmentCount * 8) + 8 * i + 2] = coldata[2];
				col[(index * this.segmentCount * 8) + 8 * i + 4] = coldata[0];
				col[(index * this.segmentCount * 8) + 8 * i + 5] = coldata[1];
				col[(index * this.segmentCount * 8) + 8 * i + 6] = coldata[2];

				var alpha = i === 0 || i === this.segmentCount - 1 ? 0 : particle.color.data[3];
				col[(index * this.segmentCount * 8) + 8 * i + 3] = alpha;
				col[(index * this.segmentCount * 8) + 8 * i + 7] = alpha;
			}
		};

		TrailRenderer.prototype.rebuild = function() {
			if (this.settings.textureUrl.valueLoaded) {
				this.entity.meshRendererComponent.materials[0].setTexture('PARTICLE_MAP', this.settings.textureUrl.valueLoaded);
			}
			for (var i = 0; i < this.trailDatas.length; i++) {
				var trailData = this.trailDatas[i];
				trailData.width = this.settings.width.value;
			}
		};

		TrailRenderer.prototype.remove = function() {
			this.entity.removeFromWorld();
		};

		TrailRenderer.prototype.setVisible = function(visible) {
			this.entity.meshRendererComponent.hidden = !visible;
			this.entity.hidden = !visible;
		};

		TrailRenderer.prototype.died = function(particle) {
			var trailData = this.trailDatas[particle.index];
			trailData.isReset = true;
		};

		TrailRenderer.prototype.updateParticle = function(tpf, particle) {
			this.renderedCount++;

			if (particle.dead) {
				return;
			}

			var trailData = this.trailDatas[particle.index];
			this.setTrailFront(trailData, particle.position, null, tpf);
			this.updateTrail(trailData, particle, Renderer.mainCamera.translation, this.renderedCount);

			this.lastAlive = this.renderedCount + 1;
		};

		TrailRenderer.prototype.updateMeshdata = function() {
			if (this.entity.hidden) {
				return;
			}

			this.meshData.indexLengths = [this.lastAlive * (this.segmentCount - 1) * 6];
			this.meshData.indexCount = this.lastAlive * (this.segmentCount - 1) * 6;

			this.meshData.setVertexDataUpdated();
			this.lastAlive = 0;
			this.renderedCount = 0;
		};

		var particleShader = {
			attributes: {
				vertexPosition: MeshData.POSITION,
				vertexColor: MeshData.COLOR,
				vertexCoords: MeshData.TEXCOORD0,
				textureTile: 'TILE'
			},
			uniforms: {
				viewMatrix: Shader.VIEW_MATRIX,
				projectionMatrix: Shader.PROJECTION_MATRIX,
				worldMatrix: Shader.WORLD_MATRIX,
				particleMap: 'PARTICLE_MAP',
				cameraPosition: Shader.CAMERA,
				time: Shader.TIME,
				alphakill: 0
			},
			vshader: [
				'attribute vec3 vertexPosition;',
				'attribute vec4 vertexColor;',
				'attribute vec2 vertexCoords;',
				'attribute vec4 textureTile;',

				// 'uniform mat4 viewProjectionMatrix;',
				'uniform mat4 viewMatrix;',
				'uniform mat4 projectionMatrix;',
				'uniform mat4 worldMatrix;',
				'uniform vec3 cameraPosition;',
				'uniform float time;',

				'varying vec4 color;',
				'varying vec2 coords;',

				'void main(void) {',
				'color = vertexColor;',
				'coords = vertexCoords * textureTile.zw + textureTile.xy;',
				'gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition.xyz, 1.0);',
				'}'
			].join('\n'),
			fshader: [
				'uniform sampler2D particleMap;',
				'uniform float alphakill;',

				'varying vec4 color;',
				'varying vec2 coords;',

				'void main(void)',
				'{',
				'vec4 col = color * texture2D(particleMap, coords);',
				'if (col.a <= alphakill) discard;',
				'gl_FragColor = col;',
				'}'
			].join('\n')
		};

		return TrailRenderer;
	});