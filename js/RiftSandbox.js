// vt note:
// x : left and right
// y : up and down
// z : forward and backward
define([
  'Three',

  'TextArea',

  'VRControls',
  'VREffect',
  'WebVRPolyfill',
  'WebVRManager',
],
function (
  THREE,
  TextArea,
  VRControls,
  VREffect,
  WebVRPolyfill,
  WebVRManager
) {
  'use strict';
  // Note BASE_POSITION and BASE_ROTATION not used.  Use BasePosition and BaseRotation instead
  var BASE_POSITION = new THREE.Vector3(0, 1.5, -2);
    //vt alter
   // var BASE_ROTATION = new THREE.Quaternion().setFromEuler(
   //     new THREE.Euler(0, Math.PI, 0), 'YZX');
  var BASE_ROTATION = new THREE.Quaternion().setFromEuler(
     new THREE.Euler(0, 0, 0), 'YZX');    
    //vt end

  //vt add
  var ONE_DEGREE = Math.PI / 180.0;
  // the distance between the camera and the editor
  var EDITOR_CAMERA_DISTANCE = 2.0;
  //vt end
   var constr = function (width, height, domTextArea, callback) {
		 
    this.width = width;
    this.height = height;
    this.domTextArea = domTextArea;
     window.HMDRotation = this.HMDRotation = new THREE.Quaternion();

     //vt add
     this.editor_is_visible = true;
     //vt end
     //this.BasePosition = new THREE.Vector3(0, 1.5, -2);
     // this works, but the text is backwards
     // it would be better if I could flip the cammera around
     //this.BasePosition = new THREE.Vector3(0, 1, 8);// this works
     //vt-xthis.BasePosition = new THREE.Vector3(0.0, 0.8, 1.2);//this works
     this.BasePosition = new THREE.Vector3(0.0, 2.0, EDITOR_CAMERA_DISTANCE);
     //this.BasePosition = new THREE.Vector3(0, 1.5, 2); // totally doesn't work
     //this.BasePosition = new THREE.Vector3(0, -1.5, 2); // totally doesn't work
    this.HMDPosition = new THREE.Vector3();
     this.BaseRotation = new THREE.Quaternion();
     //this.BaseRotation.z = -1 * ONE_DEGREE * 10;
     // this.BaseRotation = new THREE.Quaternion().setFromEuler(
     //   new THREE.Euler(0, 0, ONE_DEGREE * 90), 'YZX');     
     //vt add
     //this.BaseRotation.y = ONE_DEGREE * 10.0;
     //this.updateBaseRotation(0, ONE_DEGREE * 90,0);
     //vt end
      this.plainRotation = new THREE.Vector3();
      //vt alter
     //this.BaseRotationEuler = new THREE.Euler(0, Math.PI,0); // no effect
     this.BaseRotationEuler = new THREE.Euler(0, 0,0); 
     //this.BaseRotationEuler = new THREE.Euler(0, 0);
     //this.BaseRotationEuler.y += ONE_DEGREE * 180.0; // not effect
      //console.log("vt:RiftSandbox: this.BaseRotationEuler.y=" + this.BaseRotationEuler.y);
      //vt end
    this.scene = null;
    this.sceneStuff = [];
    this.renderer = null;
    this.vrMode = false;
    this._targetVelocity = 0;
    this._velocity = 0;
    this._rampUp = true;
     this._rampRate = 0;
     this.xAxisLine = null;

    this.initWebGL();
    this.initScene(callback);
  };


  //vt add
  // set up the initial camera position and editor placement
  constr.prototype.initPosition = function () {
    this.BasePosition = new THREE.Vector3(0.0, 2.0, EDITOR_CAMERA_DISTANCE);
    this.BaseRotation = new THREE.Quaternion();
    this.BaseRotationEuler = new THREE.Euler(0, 0,0);

    this.textArea.object.position.set(0.0, 1.5, 0);
    this.textArea.object.rotation.y = ONE_DEGREE * (0);    
  };
  // setup some pointer info at the axes
  constr.prototype.initAxes = function() {
    var line_geometry, line_material;
    
    
    // x-axis
    line_material = new THREE.LineBasicMaterial();
    line_material.color = new THREE.Color(255,0,0);

    line_geometry = new THREE.Geometry();
    
    line_geometry.vertices.push( new THREE.Vector3(0,0,0));
    line_geometry.vertices.push( new THREE.Vector3(1,0,0));

    this.xAxisLine = new THREE.Line(line_geometry, line_material);

    this.scene.add(this.xAxisLine);

    // y-axis
    line_material = new THREE.LineBasicMaterial();
    line_material.color = new THREE.Color(0,255,0);

    line_geometry = new THREE.Geometry();

    line_geometry.vertices.push( new THREE.Vector3(0,0,0));
    line_geometry.vertices.push( new THREE.Vector3(0,1,0));

    this.yAxisLine = new THREE.Line(line_geometry, line_material);

    this.scene.add(this.yAxisLine);

    // z-axis
    line_material = new THREE.LineBasicMaterial();
    line_material.color = new THREE.Color(0,0,255);

    line_geometry = new THREE.Geometry();

    line_geometry.vertices.push( new THREE.Vector3(0,0,0));
    line_geometry.vertices.push( new THREE.Vector3(0,0,1));

    this.zAxisLine = new THREE.Line(line_geometry, line_material);

    this.scene.add(this.zAxisLine);        
  };

  //vt end
  constr.prototype.initScene = function (callback) {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75, this.width / this.height, 1, 10000);

    //vt add
    //this.camera.lookAt(new THREE.Vector3(0,0,0));
    //vt end

    this.controls = new THREE.VRControls(this.camera);
    this.effect = new THREE.VREffect(this.renderer);
    this.effect.setSize(this.width, this.height);

    this.vrManager = new WebVRManager(this.renderer, this.effect);

    var maxAnisotropy = this.renderer.getMaxAnisotropy();
      //vtvar groundTexture = THREE.ImageUtils.loadTexture('img/background.png');
      var groundTexture = THREE.ImageUtils.loadTexture('RiftSketchSandBox/img/background.png');
    groundTexture.anisotropy = maxAnisotropy;
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 1000, 1000 );

    //vt add
    // to avoid the
    //THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter. 
    //groundTexture.minFilter = new THREE.NearestFilter();
    groundTexture.minFilter = THREE.NearestFilter;
    //vt end
    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry( 1000, 1000 ),
      new THREE.MeshBasicMaterial({map: groundTexture}) );
    ground.rotation.x = -Math.PI / 2;
    //ground.rotation.x = 0.0;
    this.scene.add(ground);

    this.textArea = new TextArea(this.domTextArea);
    //this.textArea.object.position.set(0, 1.5, 0);
    this.textArea.object.position.set(0.0, 1.5, 0);
    //vt add
    this.textArea.object.name = "textArea";
    // this obviously doesn't default to zero, as explicitly setting it to zero has an effect
    this.textArea.object.rotation.y = ONE_DEGREE * (0);
    //vt end
    //this.textArea.object.position.set(1.5, 0, 0);
    //this.textArea.object.position.set(-4.0, 1.5, 0);=
      //vt add9
      // undo the default rotation in TextArea.js of Math.PI for y-rot
      //this.textArea.object.rotation.y = 0;
      //vt end
      this.scene.add(this.textArea.object);

    // add a second textara
    // this.textArea2 = new TextArea(this.domTextArea);
    // this.textArea2.object.position.set(5.0, 1.5, 0);
    // this.textArea2.object.name = "textArea2";
    // this.textArea2.object.rotation.y = ONE_DEGREE * (0);
    //   this.scene.add(this.textArea2.object);
    
      //vt add
    //   this.helperTextArea = new TextArea(this.domTextArea, "helper_pane");
    // //this.helperTextArea.object.position.set(-2, 3.5, -4.0);
    // this.helperTextArea.object.position.set(0, 4.2, 0.0);
    // this.helperTextArea.object.rotation.y = ONE_DEGREE * (0);
    // console.log("RiftSandbox.initScene: this.helperTextArea.object.rotation.y=" + this.helperTextArea.object.rotation.y);
    //   this.scene.add(this.helperTextArea.object);
    //this.textArea.
      //vt end

    //vt add
    this.initAxes();
    
    //vt end
    var oldAdd = this.scene.add;
    this.scene.add = function (obj) {
      this.sceneStuff.push(obj);
      oldAdd.call(this.scene, obj);
    }.bind(this);
  };

  constr.prototype.toggleTextArea = function (shouldBeVisible) {
    this.textArea.toggle(shouldBeVisible);

    //vt add
    this.editor_is_visible = !this.editor_is_visible;
    //console.log("RiftSandbox.toggleTextArea: this.editor_is_visible=" + this.editor_is_visible);
    //vt end
  };

  function angleRangeRad(angle) {
    while (angle > Math.PI) angle -= 2*Math.PI;
    while (angle <= -Math.PI) angle += 2*Math.PI;
    return angle;
  }

  constr.prototype.setBaseRotation = function () {
    this.BaseRotationEuler.set(
      angleRangeRad(this.BaseRotationEuler.x),
      angleRangeRad(this.BaseRotationEuler.y), 0.0 );
    this.BaseRotation.setFromEuler(this.BaseRotationEuler, 'YZX');
  };


  //vt add
  constr.prototype.updateBasePosition = function (dx, dy, dz) {
    //console.log("vt:RiftSandbox.updateBasePosition: entered");
    this.BasePosition.x += dx;
    this.BasePosition.y += dy;
    this.BasePosition.z += dz;
  };

  constr.prototype.updateBaseRotation = function (dx, dy, dz) {
    console.log("vt:RiftSandbox.updateBaseRotation: entered");
    this.BaseRotationEuler.x += dx;
    this.BaseRotationEuler.y += dy;
    this.BaseRotationEuler.z += dz;

    //this.BaseRotation.setFromEuler(this.BaseRotationEuler, 'YZX');
    this.setBaseRotation();
  };  
  //vt end
  constr.prototype.initWebGL = function () {
    try {
      this.renderer = new THREE.WebGLRenderer({
          antialias: true,
          canvas: document.getElementById('viewer')
      });
    }
    catch(e){
      alert('This application needs WebGL enabled!');
      return false;
    }

    this.renderer.setClearColor(0xD3D3D3, 1.0);
    this.renderer.setSize(this.width, this.height);

    this.container = document.getElementById('container');
  };

  constr.prototype.clearScene = function () {
    for (var i = 0; i < this.sceneStuff.length; i++) {
      this.scene.remove(this.sceneStuff[i]);
    }
    this.sceneStuff = [];
  };

  constr.prototype.render = function () {
    //vt add
    // note hasVR is not set anywhere in the code base.  hmd is set by default though
    this.hasVR = true;
    //vt end
    this.vrManager.getHMD().then(function (hmd) {

      //vt add
      if (this.editor_is_visible) {
        this.textArea.update();
      }
      //vt end
      //vtthis.textArea.update();
      this.controls.update();

      //console.log("vt:RiftSandbox.render: hmd=" + hmd + "this.hasVR=" + this.hasVR + ",vrManager.hasVR=" + this.vrManager.hasVR);
      if (!hmd) {
        this.camera.quaternion.multiplyQuaternions(BASE_ROTATION, this.camera.quaternion);
      }

      if (this.hasVR) {
        //if (false) {
        // working version
        // this.camera.position.copy(this.BasePosition);
        // //vt end        
        // var rotatedHMDPosition = new THREE.Vector3();
        // rotatedHMDPosition.copy(this.camera.position);
        
        // rotatedHMDPosition.applyQuaternion(this.BaseRotation);
        // //this.camera.position.copy(BASE_POSITION).add(rotatedHMDPosition);
        // this.camera.position.copy(this.BasePosition).add(rotatedHMDPosition);
        //end working version
      //if (this.vrManager.hasVR) {
        //vt add
        //console.log("vt:RiftSandbox.render: now in hmd path");
        this.camera.position.copy(this.BasePosition);
        //vt end        
        var rotatedHMDPosition = new THREE.Vector3();
        rotatedHMDPosition.copy(this.camera.position);
        
        rotatedHMDPosition.applyQuaternion(this.BaseRotation);
        //this.camera.position.copy(BASE_POSITION).add(rotatedHMDPosition);
        //vt-xthis.camera.position.copy(this.BasePosition).add(rotatedHMDPosition);
        //this.camera.position.copy(this.BasePosition).add(rotatedHMDPosition);
        this.camera.quaternion.multiplyQuaternions(this.BaseRotation, this.camera.quaternion);

      }
      else {
        console.log("vt:RiftSandbox.render: now in non-hmd path");
        this.camera.position.copy(BASE_POSITION);
        //this.camera.position.copy(this.BasePosition);
      }

      if (this.vrManager.isVRMode()) {
        this.effect.render(this.scene, this.camera);
      }
      else {
        this.renderer.render(this.scene, this.camera);
      }
    }.bind(this));
  };

  constr.prototype.resize = function () {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.effect.setSize(this.width, this.height);
  };

  constr.prototype.setRotation = function (rotation) {
    this.plainRotation.set(0, rotation.y, 0);
  };

  // Note: I don't think this function is being called at all.
  constr.prototype.setHmdPositionRotation = function (vrState) {
    if (!vrState) { return; }
    var rotation = vrState.orientation;
    var position = vrState.position;
    //console.log("vt:RiftSandbox.setHmdPositionRotation: rotation=" + rotation + ",position=" + position);
      //vt add
    //rotation.y += (1.5 *  Math.PI);
    rotation.y += (0.5 *  Math.PI);
    console.log("vt:RiftSandbox.setHmdPositionRotation: rotation.y=" + rotation.y);
      //vt end
    this.HMDRotation.set(rotation.x, rotation.y, rotation.z, rotation.w);
    var VR_POSITION_SCALE = 1;
    if (position) {
      this.HMDPosition.set(
        position.x * VR_POSITION_SCALE,
        position.y * VR_POSITION_SCALE,
        position.z * VR_POSITION_SCALE
      );
    }
  };

  constr.prototype.toggleVrMode = function () {
      this.vrMode = !this.vrMode;
  };

  // constr.prototype.updateCameraPositionRotation = function () {
  //   this._move();
  //   if (!this.vrMode) {
  //     this.camera.rotation.set(0 , this.plainRotation.y, 0);
  //   }
  //   this.cameraPivot.quaternion.multiplyQuaternions(
  //     this.BaseRotation, this.HMDRotation);
  //
  //   var rotatedHMDPosition = new THREE.Vector3();
  //   rotatedHMDPosition.copy(this.HMDPosition);
  //   rotatedHMDPosition.applyQuaternion(this.BaseRotation);
  //   this.cameraPivot.position.copy(this.BasePosition).add(rotatedHMDPosition);
  // };

  constr.prototype.setVelocity = function (velocity) {
    this._rampUp = velocity > this._targetVelocity;
    this._rampRate = Math.abs(velocity - this._targetVelocity) * 0.1;
    this._targetVelocity = velocity;
  };

  constr.prototype._move = function () {
    if (this._rampUp && this._velocity < this._targetVelocity) {
      this._velocity += this._rampRate;
    }
    else if (!this._rampUp && this._velocity > this._targetVelocity) {
      this._velocity -= this._rampRate;
    }
    var movementVector = new THREE.Vector3(0, 0, -1);
    movementVector.applyQuaternion(this.BaseRotation);
    movementVector.multiplyScalar(this._velocity);
    this.BasePosition.add(movementVector);
  };

//vt add
  constr.prototype.updateTextAreaRotation = function (dx, dy, dz) {
    console.log("indexjs.updateTextAreaRotation: entered, dy=" + dy);

    var object = this.textArea.object;
    
    object.rotation.x += dx * 1;
    object.rotation.y += dy;
    object.rotation.z += dz;

    // move in orbit around the camera.
    //object.position.x = this.camera.position.x + EDITOR_CAMERA_DISTANCE * Math.sin(object.rotation.y);
    object.position.x = this.camera.position.x + EDITOR_CAMERA_DISTANCE * Math.sin(this.BaseRotationEuler.y + Math.PI);
    //object.position.z = this.camera.position.z + EDITOR_CAMERA_DISTANCE * Math.cos(object.rotation.y);
    object.position.z = this.camera.position.z + EDITOR_CAMERA_DISTANCE * Math.cos(this.BaseRotationEuler.y + Math.PI);

  };

//vt end
  
  return constr;
});

//vt scratch
//var a = `hello;
//there`;
// var a = 18;

// var vt_foo = function () {
//   var a = 2;
//   return 1 + a};

// function vt_foo_2 () {
//   var a = 3
//   return 1 + a;
// }

// function vt_vrDeviceCallback(vrdevs) { return 8;};

// var b;
// for( b in window) { 
//   if(window.hasOwnProperty(b)) skewer.log(b); 
// }

// skewer.log("hi");
function foo() {
  this.a = 2;
  return 1 + a;
}


