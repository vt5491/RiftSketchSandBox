var t3 = THREE;
	 var light = new t3.PointLight();
	 light.position.set(1, 1, 1);
	 scene.add(light);
	 
	 var makeCube = function (x, y, z) {
		 var cube = new t3.Mesh(
				 new t3.BoxGeometry(1, 1.1, 1),
				 new t3.MeshLambertMaterial(
					 {color: 'red'})
				 );
			 cube.position.set(0, 0, 0).add(
					 new t3.Vector3(x, y, z));
			 scene.add(cube);
			 return cube;
	 };
	 
	 var cube = makeCube(0, 2, 2);
	 var i = 0;
	 return function () {
		 i += -0.02;
			 cube.rotation.y = i;
	 };
