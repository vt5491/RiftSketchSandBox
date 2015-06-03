var t3 = THREE;
var light = new t3.PointLight();
light.position.set(1, 1, 1);
scene.add(light);

//
var makeCube = function (x, y, z, c) {
  var cube = new t3.Mesh(
    new t3.BoxGeometry(1, 1.1, 1),
    new t3.MeshLambertMaterial(
      {color: c ||'red'})
  );
  cube.position.set(0, 0, 0).add(
    new t3.Vector3(x, y, z));
  scene.add(cube);
  return cube;
};

// + ooml, - rool, / mmmo, ; roor

// < n-mool, > n-roro, <home> orrr, <end> 
// alt-f4 na-lmoo, _ orol, { r00l, } n-llor
// | n-llro, [ n-rmoo, ] n-room
// * oolm
var cube = makeCube(0, 12, -9, 'blue');
var i = 0;
var rot = 0;

var cube_array = [];
var n_cubes = 26;
var cube_width = 1;
var cube_gap = 0.5;
var ic = 0;
for (ic = 0; ic < n_cubes; ic++) {
    cube_array[ic] = makeCube(
      (ic - n_cubes / 2) * 
      (cube_width + cube_gap),

     2, -6.,ic % 2 == 0 ? 'red' :'green');
}
//
var t = 0;
return function () {
  rot += -0.02;
  cube.rotation.y = rot;

  for (i=0;i < n_cubes; i++) {
    cube_array[i].position.y = 
      //Math.sin(t * Math.PI / 180.0); 

      //Math.sin(t);  
       2 + 0.25 * Math.sin(t + i);
    //t += Math.PI / 7.0;
    //cube_array[i].position.z += 0.1;
      cube_array[i].position.z = 
       -9 + 5.0 * Math.sin(t * 0.1);
      cube_array[i].rotation.z +=
 0.02 * Math.sin(2.0 * Math.PI / n_cubes * t);      
t+= 0.006
  }
};