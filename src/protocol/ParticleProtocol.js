"use strict";

define(function() {

	var ParticleProtocol = function() {
		this.processEntry = {
			id:null,
			posData:null,
			colData:null,
			uvData:null,
			indexTransfer:null,
			tpf:null
		};
	};

	ParticleProtocol.prototype.updateData = function(data) {
		var entry = {
			id:data.id,
			posData:new Float32Array(data.posData),
			colData:new Float32Array(data.colData),
			uvData:new Float32Array(data.uvData),
			indexTransfer:data.indexTransfer,
			tpf:data.tpf
		};
		return entry;
	};

	return ParticleProtocol
});