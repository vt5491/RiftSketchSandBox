//"use strict";

var root_dir = "RiftSketchSandBox/";

console.log("RSUtilsSpec: point a");

require.config({
  //baseUrl: "projects/RiftSketchSandBox/spec",
  baseUrl: "../js",
  //urlArgs: 'cb=' + Math.random(),
  paths: {
    RSUtils: 'RSUtils',
    //Three: root_dir + 'lib/three'
    Three: '/projects/RiftSketchSandBox/lib/three'
  },
  shim: {
    RSUtils: {exports: 'RSUtils'},
    Three: {exports: 'THREE'}
  }
});


  console.log("RSUtilsSpec: point b");

var my_rs;

//require(['RSUtils'], function (RSUtils) {
define(['RSUtils'], function (RSUtils) {  
  console.log("RSUtilsSpec: point c");
  //console.log("abc=" + RSUtils.helloWorld());
  console.log("RSUtilsSpec: RSUtils.x=" + RSUtils.x);
  var a = new RSUtils();
  //my_rs = new RSUtils(); return;
  
  console.log("RSUtilsSpec: a=" + a);
  console.log("RSUtilsSpec: a.helloWorld()=" + a.helloWorld());

  console.log("RSUtilsSpec: about to call expect");
  //var r = it("abc", function() {expect(rsUtils.helloWorld()).toEqual("Hello world!");});
  // Note: this fukcking works!
  var r = it("abd", function() {expect((new RSUtils ()).helloWorld()).toEqual("Hello world!");});

  
  console.log("RSUtilsSpec: r=" + r);
  //console.log("RSUtilsSpec: expect result = " + expect(a.helloWorld()).toEqual("Hello world!"));
  console.log("RSUtilsSpec: just called expect");

  //return RSUtils;
  //return a;
  
  var foo = function () {
    describe("Hello world", function() {
      var rsUtils = new RSUtils();
      it("says hello", function() {
        expect(rsUtils.helloWorld()).toEqual("Hello world!");
        //expect(RSUtils.helloWorld()).toEqual("Hello world!");
      });
    }
   )};

  var rs;
  
   beforeEach(function(done) {
        require(['RSUtils'], function(rsUtils) {
            rs = new rsUtils();
            done();
        });
   });


    it("should know if list is empty", function() {
      var rs = new RSUtils();
        expect(rs.helloWorld()).toEqual("Hello world!");
    });

  describe("Hello world", function () {
    var rsUtils = new RSUtils();
    it("says hello", function() {
      expect(rsUtils.helloWorld()).toEqual("Hello world!");
      //console.log("scene.children[0] in ut=" + scene.children[0]);
      //expect(RSUtils.helloWorld()).toEqual("Hello world!");
    });
  });
  
  describe("getSceneObject", function() {
    var scene;
    var cubeMesh;
    var rsUtils = new RSUtils();
    
    beforeAll(function() {
      //var scene, cubeMesh;

      scene =  new THREE.Scene();
      scene.name = "jasmine_fixture";

      cubeMesh = new THREE.Mesh(
        new THREE.BoxGeometry( 1, 1, 1 ),
	    new THREE.MeshBasicMaterial({}) );

      cubeMesh.name = "abc";

      scene.add(cubeMesh);
      
      cubeMesh = new THREE.Mesh(
        new THREE.BoxGeometry( 2, 2, 2 ),
	    new THREE.MeshBasicMaterial({}) );

      cubeMesh.name = "def";

      scene.add(cubeMesh);

      console.log("scene a=" + scene);
    });

    it("returns the proper thing", function() {
      //expect(rsUtils.getSceneObject({scene: scene, name: "abc"})).toEqual("scene=jasmine_fixture,name=abc");
      //console.log("scene.children[0].name in ut=" + scene.children[0].name);
      //expect(RSUtils.helloWorld()).toEqual("Hello world!");
      //console.log("rsUtils.getSceneObject({scene: scene, name: \"abc\"})).name = " + rsUtils.getSceneObject({scene: scene, name: "abc"}).name);
      var result;
      
      result = rsUtils.getSceneObject({scene: scene, name: "abc"});
      expect(result.name).toEqual("abc");
      expect(result.geometry.parameters.width).toEqual(1);
      
      expect(rsUtils.getSceneObject({scene: scene, name: "def"}).name).toEqual("def");
      expect(rsUtils.getSceneObject({scene: scene, name: "def"}).geometry.parameters.width).toEqual(2);

      // not found scenario
      result = rsUtils.getSceneObject({scene: scene, name: "xyz"});
      expect(result).toBeUndefined();
      
      
    });
  }
            );
  console.log("RSUtilsSpec: leaving stanza");
  //return foo();
  
});

// console.log("RSUtilsSpec: point d: my_rs=" + my_rs);
// //var my_rs_instance = new my_rs();
// //console.log("RSUtilsSpec: point d: my_rs_instance=" + my_rs_instance);

//     describe("Hello world", function() {
//       //var rsUtils = new RSUtils();
//       it("says hello", function() {
//         expect(my_rs.helloWorld()).toEqual("Hello world!");
//         //expect(RSUtils.helloWorld()).toEqual("Hello world!");
//       });
//     }
//             );


// describe("A suite is just a function", function() {
// 		var a;

// 		it("and so is a spec", function() {
// 			a = true;

// 			expect(a).toBe(true);
// 			});
//         }
// );

//       );
/*
describe("getSceneObject", function() {
  var a;
  var scene;
  var cubeMesh;

  beforeAll(function() {
    //var scene, cubeMesh;

    scene =  new THREE.Scene();

    cubeMesh = new THREE.Mesh(
      new THREE.BoxGeometry( 1, 1, 1 ),
	  new THREE.MeshBasicMaterial({}) );

    cubeMesh.name = "abc";

    scene.add(cubeMesh);
    
    cubeMesh = new THREE.Mesh(
      new THREE.BoxGeometry( 2, 2, 2 ),
	  new THREE.MeshBasicMaterial({}) );

    cubeMesh.name = "def";

    scene.add(cubeMesh);

    console.log("scene a=" + scene);
  });

  
  it("dummy", function() {
	a = true;
	expect(a).toBe(true);

    console.log("scene b=" + scene);
  });


  it("returns the proper object", function() {
    var cube;
    
    cube = getSceneObject({scene: scene, name: "abc"});
     
    expect(cube.width.toEqual(1));
    expect(cube.name.toEqual("abc"));

    cube = getSceneObject({scene: scene, name: "def"});
           
    expect(cube.width.toEqual(2));
    expect(cube.name.toEqual("def"));    
  });  
  

});
*/ 
  




















