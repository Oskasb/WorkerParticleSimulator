define({
	"behaviors":[
		{
			"id":"defaultBehavior",
			"follow": {
				"value": "box",
				"type": "string"
			},
			"followType": {
				"value": "Mesh",
				"type": "option",
				"values": ["Mesh", "Joint"],
				"texts": ["Mesh", "Joint"]
			},


			"spawner": {
				"value": "meshSpawner",
				"type": "option",
				"values": ["sphereSpawner", "randomSpawner", "meshSpawner"],
				"texts": ["sphereSpawner", "randomSpawner", "meshSpawner"]
			},
			"behaviors": [
				// "flockcenter2"
				"meshFollower"
			]
		}
	]
})