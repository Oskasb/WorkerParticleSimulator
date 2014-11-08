define({
	"effects":[
		{
			"id":"firework_blue",
			"effect_data":{
				"color":[0.4,0.4, 1, 1],
				"count":40,
				"opacity":[0.4, 1],
				"alpha":[[0,1], [0.15, 0], [0.3, 1],[0.5, 0], [0.7, 1] ,[1,0]],
				"size":[0.2, 0.22],
				"growthFactor":[0.01, 0.7],
				"growth":[[0, -1], [0.05, 1], [0.3, 2],[0.45, -2], [0.6, 1], [0.75, -1], [0.9,1 ], [1,0]],
				"stretch":1,
				"strength":12,
				"spread":0.6,
				"acceleration":0.97,
				"gravity":-9,
				"rotation":[0,7],
				"spin":"oneToZero",
				"spinspeed":[-15, 15],
				"lifespan":[1, 3],
				"sprite":"dot_seq",
				"loopcount":15,
				"trailsprite":"bluetrails",
				"trailwidth":0.8
			}
		},
		{
			"id":"firework_red",
			"effect_data":{
				"color":[1,0.3, 0.3, 1],
				"count":30,
				"opacity":[0.99, 1],
				"alpha":"oneToZero",
				"size":[0.02, 0.2],
				"growthFactor":[0.01, 0.7],
				"growth":"posToNeg",
				"stretch":0.0001,
				"strength":22,
				"spread":1,
				"acceleration":0.97,
				"gravity":-9,
				"rotation":[0,7],
				"spin":"oneToZero",
				"spinspeed":[0, 1],
				"lifespan":[1, 2],
				"sprite":"fielddot",
				"loopcount":1,
				"trailsprite":"wave",
				"trailwidth":0.8
			}
		},
		{
			"id":"firework_green",
			"effect_data":{
				"color":[0.4, 1, 0.4, 1],
				"count":30,
				"opacity":[0.4, 1],
				"alpha":"oneToZero",
				"size":[0.02, 0.2],
				"growthFactor":[0.01, 0.7],
				"growth":"posToNeg",
				"stretch":0.0001,
				"strength":22,
				"spread":0.95,
				"acceleration":0.97,
				"gravity":-9,
				"rotation":[0,7],
				"spin":"oneToZero",
				"spinspeed":[25, 45],
				"lifespan":[1, 2],
				"sprite":"sinedot",
				"loopcount":15,
				"trailsprite":"tail",
				"trailwidth":0.3
			}
		},
		{
			"id":"firework_cone_yellow",
			"effect_data":{
				"color":[0.8,0.8, 0.3, 1],
				"count":15,
				"opacity":[0.7, 1],
				"alpha":"oneToZero",
				"size":[0.22, 0.3],
				"growthFactor":[-0.01, -0.7],
				"growth":"oneToZero",
				"stretch":0.0001,
				"strength":6,
				"spread":0.7,
				"acceleration":0.997,
				"gravity":-7,
				"rotation":[0,7],
				"spin":"zeroToOne",
				"spinspeed":[-15, -55],
				"lifespan":[0.4, 2],
				"sprite":"spinfield",
				"loopcount":15,
				"trailsprite":"tail",
				"trailwidth":0.1
			}
		},
        {
            "id":"tail_orange",
            "effect_data":{
                "color":[1,0.4, 0.2, 1],
                "count":1,
                "opacity":[0.7, 1],
                "alpha":"oneToZero",
                "size":[0.22, 0.3],
                "growthFactor":[1.01, 0.7],
                "growth":"posToNeg",
                "stretch":0.0001,
                "strength":0,
                "spread":0.7,
                "acceleration":0.997,
                "gravity":0,
                "rotation":[0,7],
                "spin":"posToNeg",
                "spinspeed":[-45, 45],
                "lifespan":[2, 2],
                "sprite":"flaredot",
                "loopcount":15,
                "trailsprite":"tail",
                "trailwidth":1
            }
        }
	]
});