var t3 = THREE;
var light = new t3.PointLight();
light.position.set(1, 1, 1);
scene.add(light);

var makeCube = function (x, y, z, c) {
  var cube = new t3.Mesh(
    new t3.BoxGeometry(1, 1.1, 1),
    new t3.MeshLambertMaterial(
      {color: c})
  );
  cube.position.set(0, 0, 0).add(
    new t3.Vector3(x, y, z));
  scene.add(cube);
  return cube;
};
//
var cube = makeCube(0, 2,-51,'blue');
var cube2 = makeCube(2, 3,-18,'red');
var i = 0;
//return function () {
  //i += -0.02;
  //cube.rotation.y = i;
  //cube2.rotation.y = i;
//};
var cubes = [];
for(var cubes_i = 0; cubes_i < 6; cubes_i++) {
     cubes[cubes_i] = makeCube
(cubes_i * 1.4 -4.2, 0,-5,'green');
}
return function() {
    i += 0.0;
    for(var j=0; j < 6 ; j++) {
       cubes[j].rotation.y = i;
   }
}