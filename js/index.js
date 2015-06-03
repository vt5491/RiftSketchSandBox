//vt add
//var root_dir = "RiftSketchSandBox/";
var root_dir = '';
//vt end
/* global require */
require.config({
  waitSeconds: 30,
  baseUrl: '/projects/RiftSketchSandBox',
  paths: {
    firebase: 'bower_components/firebase/firebase',
    jquery: 'bower_components/jquery/dist/jquery',
    leap: 'lib/leap-0.6.3',
    oauth: 'bower_components/oauth-js/dist/oauth',
    lodash: 'bower_components/lodash/dist/lodash',
    kibo: 'lib/kibo',
    Three: 'lib/three',
    VRControls: 'lib/VRControls',
    VREffect: 'lib/VREffect',
    WebVRPolyfill: 'lib/webvr-polyfill',
    WebVRManager: 'lib/webvr-manager',

    RiftSandbox: 'js/RiftSandbox',  
    // TextArea: root_dir + 'js/TextArea',
    // File: root_dir + 'js/File',
    // Sketch: root_dir + 'js/Sketch',
    TextArea: 'js/TextArea',
    File: 'js/File',
    Sketch: 'js/Sketch',
    
    //vt add
    //RSUtils: root_dir + 'js/RSUtils'
    RSUtils: 'js/RSUtils'
    //vt end
  },
  shim: {
    firebase: {exports: 'Firebase'},
    jquery: {exports: 'jQuery'},
    leap: {exports: 'Leap'},
    oauth: {exports: 'OAuth'},
    kibo: {exports: 'Kibo'},
    Three: {exports: 'THREE'},
    WebVRPolyfill: {deps: ['Three']},
    VRControls: {deps: ['Three']},
    VREffect: {deps: ['Three']},
    WebVRManager: {exports: 'WebVRManager'}
  },
  //vt add
  urlArgs: "bust=" + (new Date()).getTime()
  //vt end    
});

require([
  'firebase',
  'jquery',
  'leap',
  'oauth',
  'lodash',
  'kibo',

  'RiftSandbox',
  'File',
  'Sketch',
  'RSUtils'
],
function (
  Firebase,
  $,
  Leap,
  OAuth,
  _,
  Kibo,

  RiftSandbox,
  File,
  Sketch,
  RSUtils
) {
  'use strict';
  //vt add
  // TODO: put in a common module, instead of redefining all the time.
  var ONE_DEGREE = Math.PI / 180.0;
  var KBD_MOVE_DELTA = 0.5;
  //vt end
    //vt add
    console.log("vt:index.js: enter the dragon");
    //vt end
    var SketchController = function() {
    //vt add
    //console.log("vt:index.js: entered SketchController");
    //vt end
    var setupVideoPassthrough = function () {
      navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      navigator.getUserMedia(
        {video: true},
        function (stream) {
          var monitor = document.getElementById('monitor');
          monitor.src = window.URL.createObjectURL(stream);
        },
        function () {
          // video pass-through is optional.
        }
      );
    };
    setupVideoPassthrough();

    var loadSketch = function (ref) {
      console.log("vt: loadSketch: ref=" + ref);
      this.sketch = {};
      this.firebaseRef = ref;
      ref.on('value', function (data) {
        this.readCode(data.val().contents);
      }.bind(this));
    }.bind(this);

    var setupSketch = function () {
      var sketches_base = 'https://riftsketch2.firebaseio.com/sketches/';
      var ref;
      if (!window.location.hash) {
        ref = new Firebase(sketches_base);
        ref = ref.push(
          {contents: File.defaultContents},
          function () {
              window.location.hash = '#!' + ref.key();
              //vt disable loadSketch, because it's generating errors'
            loadSketch(ref);
          }
        );
      }
      else {
        ref = new Firebase(sketches_base + window.location.hash.substring(2));
        loadSketch(ref);
      }
    }.bind(this);
    setupSketch();

    var mousePos = {x: 0, y: 0};
    window.addEventListener(
      'mousemove',
      function (e) {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;
      },
      false
    );

    this.sketchLoop = function () {};

    this.mainLoop = function () {

        //vt add
      //console.log("vt: mainLoop: entered:");
        //vt end
      window.requestAnimationFrame( this.mainLoop.bind(this) );

      // Apply movement
      // if (this.deviceManager.sensorDevice && this.riftSandbox.vrMode) {
      //   this.riftSandbox.setHmdPositionRotation(
      //     this.deviceManager.sensorDevice.getState());
      // }
      // else {
      //   this.riftSandbox.setRotation({
      //     y: mousePos.x / window.innerWidth * Math.PI * 2
      //   });
      // }
      // this.riftSandbox.setBaseRotation();
      // this.riftSandbox.updateCameraPositionRotation();

      try {
        this.sketchLoop();
      }
      catch (err) {
        this.riftSandbox.textArea.setInfo(err.toString());
      }

      this.riftSandbox.render();
    };

    var spinNumberAndKeepSelection = function (direction, amount) {
      var start = this.domTextArea.selectionStart;
      File.spinNumberAt(this.sketch, start, direction, amount);
      this.writeCode(this.sketch.contents);
      this.domTextArea.selectionStart = this.domTextArea.selectionEnd = start;
    }.bind(this);

    var offsetNumberAndKeepSelection = function (offset) {
      var start = this.domTextArea.selectionStart;
      File.offsetOriginalNumber(this.sketch, offset);
      this.writeCode(this.sketch.contents);
      this.domTextArea.selectionStart = this.domTextArea.selectionEnd = start;
    }.bind(this);

    this.handStart = this.handCurrent = null;
    this.modifierPressed = this.shiftPressed = false;
    Leap.loop({}, function (frame) {
      if (frame.hands.length) {
        this.handCurrent = frame;
        if (this.modifierPressed && this.handStart) {
          var hand = frame.hands[0];
          var handTranslation = hand.translation(this.handStart);
          var factor = this.shiftPressed ? 10 : 100;
          var offset = Math.round(handTranslation[1] / factor * 1000) / 1000;
          offsetNumberAndKeepSelection(offset);
        }
      }
      this.previousFrame = frame;
    }.bind(this));

      //vt add

      this.rsUtils = new RSUtils();
      //var updateBasePosition = function ( ){
      this.updateBasePosition = function (dx, dy, dz){
        this.riftSandbox.updateBasePosition(dx, dy, dz);
       // console.log("this.riftSandbox.BasePosition.x=" + this.riftSandbox.BasePosition.x.toFixed(2));
      };
        

      this.updateBaseRotation = function (dx, dy, dz){
        this.riftSandbox.updateBaseRotation(dx, dy, dz);
      };

      this.updateTextAreaPosition = function (dx, dy, dz){
        // delete the old textArea from the scene
        //this.riftSandbox.scene.remove( this.riftSandbox.scene.children[1]);
        //var rsUtils = new RSUtils();
        var scene = this.riftSandbox.scene;
        var textArea = this.rsUtils.getSceneObject({scene: this.riftSandbox.scene, name: "textArea"});
        this.riftSandbox.scene.remove(textArea.object);
      
        this.riftSandbox.textArea.object.position.x += dx * 1;
        this.riftSandbox.textArea.object.position.y += dy;
        this.riftSandbox.textArea.object.position.z += dz;

        // console.log("this.riftSandbox.textArea.object.position.x=" + this.riftSandbox.textArea.object.position.x.toFixed(2));
        // console.log("this.riftSandbox.camera.position.x=" + this.riftSandbox.camera.position.x.toFixed(2));
        //this.riftSandbox.textArea.object.geometry.verticesNeedUpdate = true;
        //this.riftSandbox.textArea.object.geometry.elementsNeedUpdate = true;
        // now add the update textArea to the scene
        //this.scene.add
        this.riftSandbox.scene.add(this.riftSandbox.textArea.object);
        //this.riftSandbox.scene.add(this.riftSandbox.textArea);
      };
      
      this.updateTextAreaRotation = function (dx, dy, dz){
        this.riftSandbox.updateTextAreaRotation(dx, dy, dz);
        // delete the old textArea from the scene
        //this.riftSandbox.scene.remove( this.riftSandbox.scene.children[1]);
        //var rsUtils = new RSUtils();
        //var scene = this.riftSandbox.scene;
        //var textArea = this.rsUtils.getSceneObject({scene: this.riftSandbox.scene, name: "textArea"});
        //this.riftSandbox.scene.remove(textArea.object);
        // console.log("indexjs.updateTextAreaRotation: entered");

        // var object = this.riftSandbox.textArea.object;
        
        // object.rotation.x += dx * 1;
        // object.rotation.y += dy;
        // object.rotation.z += dz;

        // // move in the camera's circle
        // object.
        // console.log("this.riftSandbox.textArea.object.position.x=" + this.riftSandbox.textArea.object.position.x.toFixed(2));
        // console.log("this.riftSandbox.camera.position.x=" + this.riftSandbox.camera.position.x.toFixed(2));
        //this.riftSandbox.textArea.object.geometry.verticesNeedUpdate = true;
        //this.riftSandbox.textArea.object.geometry.elementsNeedUpdate = true;
        // now add the update textArea to the scene
        //this.scene.add
        //this.riftSandbox.scene.add(this.riftSandbox.textArea.object);
        //this.riftSandbox.scene.add(this.riftSandbox.textArea);
      };
      
      //vt end
    OAuth.initialize('bnVXi9ZBNKekF-alA1aF7PQEpsU');
    var apiCache = {};
    var api = _.throttle(function (provider, url, data, callback) {
      var cacheKey = url + JSON.stringify(data);
      var cacheEntry = apiCache[cacheKey];
      if (cacheEntry && (Date.now() - cacheEntry.lastCall) < 1000 * 60 * 5) {
        callback(cacheEntry.data);
        return;
      }
      OAuth.popup(
        provider,91,
        {cache: true}
      ).done(function(result) {
        result.get(
          url,
          {data: data, cache: true}
        ).done(function (data) {
          apiCache[cacheKey] = {
             lastCall: Date.now(),
            data: data
          };
          callback(data);
        });
      });
    }, 1000);

    var getShortcut = function (key) {
      key = key || '';
      return ['alt shift ' + key, 'ctrl shift ' + key];
    };

      this.is_editor_visible = true;

      //vt add
      this.command_mode = false;
      //vt end
    this.bindKeyboardShortcuts = function () {
      var kibo = new Kibo(this.domTextArea);
      //vt comment out because it's interfering with my z handler(?)
      // kibo.down(getShortcut('z'), function () {
      //   this.riftSandbox.controls.zeroSensor();
      //   return false;
      // }.bind(this));
      kibo.down(getShortcut('e'), function () {
        this.is_editor_visible = !this.is_editor_visible;
        this.riftSandbox.toggleTextArea(this.is_editor_visible);
        //vt add
        //this.domTextArea.disabled = !this.domTextArea.disabled;
        //vt end
        return false;
      }.bind(this));
      // kibo.down(getShortcut('u'), function () {
      //   spinNumberAndKeepSelection(-1, 10);
      //   return false;
      // });
      kibo.down(getShortcut('i'), function () {
        spinNumberAndKeepSelection(1, 10);
        return false;
      });
      kibo.down(getShortcut('j'), function () {
        spinNumberAndKeepSelection(-1, 1);
        return false;
      });
      kibo.down(getShortcut('k'), function () {
        spinNumberAndKeepSelection(1, 1);
        return false;
      });
      // vt: comment this out as its interering with my up and down
      // kibo.down(getShortcut('n'), function () {
      //   spinNumberAndKeepSelection(-1, 0.1);
      //   return false;
      // });
      kibo.down(getShortcut('m'), function () {
        spinNumberAndKeepSelection(1, 0.1);
        return false;
      });

      //vt add
      // C-<shift>-t toggle the input mode
      kibo.down(getShortcut('u'), function () {
        console.log("index.js: now in alt shift u handler");
        // this.domTextArea.disabled = !this.domTextArea.disabled;
        // this.domTextArea.focus();
        //if (this.domTextArea.disabled == false) {
        if(document.activeElement.id == 'sketchContents') {
          //this.domTextArea.disabled = true;
          //$("#scratch").focus();
          this.scratchTextArea.focus();
        }
        else {
          //this.domTextArea.disabled = false;
          this.domTextArea.focus();
        }
        return false;
      }.bind(this));

      // note: you want to use Alt-Shift-w not Crlt-Shift-w, as the latter will
      // terminate the browser window.
      // forward
      kibo.down(getShortcut('w'), function () {
        console.log("vt:index.js.initialize: now in shortcut w handler");
        //this.riftSandbox.updateBasePosition(0,1,0);
        this.updateBasePosition(0,0.0,-KBD_MOVE_DELTA);
        this.updateTextAreaPosition(0,0,-KBD_MOVE_DELTA);
        return false;
      }.bind(this));

      //backward
      kibo.down(getShortcut('s'), function () {
        //console.log("vt:index.js.initialize: now in shortcut w handler");
        //this.riftSand59box.updateBasePosition(0,1,0);
        this.updateBasePosition(0,0.0,KBD_MOVE_DELTA);
        this.updateTextAreaPosition(0,0,KBD_MOVE_DELTA);
        return false;
      }.bind(this));

      // left
      kibo.down(getShortcut('a'), function () {
        //console.log("vt:index.js.initialize: now in shortcut w handler");
        //this.riftSandbox.updateBasePosition(0,1,0);
        this.updateBasePosition(-KBD_MOVE_DELTA,0,0);
        this.updateTextAreaPosition(-KBD_MOVE_DELTA,0,0);
        return false;
      }.bind(this));

      // right
      kibo.down(getShortcut('d'), function () {
        //console.log("vt:index.js.initialize: now in shortcut w handler");
        //this.riftSandbox.updateBasePosition(0,1,0);
        this.updateBasePosition(KBD_MOVE_DELTA,0,0);
        this.updateTextAreaPosition(KBD_MOVE_DELTA,0,0);
        return false;
      }.bind(this));

      // up 
      kibo.down(getShortcut('p'), function () {
        //console.log("vt:index.js.initialize: now in shortcut w handler");
        //this.riftSandbox.updateBasePosition(0,1,0);
        this.updateBasePosition(0,KBD_MOVE_DELTA,0.0);
        return false;
      }.bind(this));

      // down
      kibo.down(getShortcut('n'), function () {
        console.log("vt:index.js.initialize: now in shortcut n handler");
        //this.riftSandbox.updateBasePosition(0,1,0);
        this.updateBasePosition(0,-KBD_MOVE_DELTA,0);
        return false;
      }.bind(this));

      // rotate left 
      kibo.down(getShortcut('x'), function () {
        //console.log("vt:index.js.initialize: now in shortcut x handler");
        //console.log("vt:index.js.initialize: camera.rotation.y (pre)=" + this.riftSandbox.camera.rotation.y);
        //this.riftSandbox.updateBasePosition(0,1,0);
        this.updateBaseRotation(0,ONE_DEGREE * 5.0,0.0);
        //this.riftSandbox.camera.rotation.y += ONE_DEGREE * 5.0;
        //this.riftSandbox.camera.updateProjectionMatrix();
        //console.log("vt:index.js.initialize: camera.rotation.y (post)=" + this.riftSandbox.camera.rotation.y);
        this.updateTextAreaRotation(0,ONE_DEGREE * 5.0,0);
        return false;
      }.bind(this));

      // rotate right
      kibo.down(getShortcut('c'), function () {
        console.log("vt:index.js.initialize: now in shortcut c handler");
        
        //this.riftSandbox.updateBasePosition(0,1,0);
        this.updateBaseRotation(0,-1 * ONE_DEGREE * 5.0,0);
        this.updateTextAreaRotation(0,-ONE_DEGREE * 5.0,0);
        return false;
      }.bind(this));
      
      //vt end
      var MOVEMENT_RATE = 0.01;
      var ROTATION_RATE = 0.01;

      kibo.down('w', function () {
        if (!this.is_editor_visible) {
          this.riftSandbox.setVelocity(MOVEMENT_RATE);

          //vt add
          return false;
          //vt end
        }
      }.bind(this));
      kibo.up('w', function () {
        if (!this.is_editor_visible) {
          this.riftSandbox.setVelocity(0);
          //vt add
          return false;
          //vt end
        }
      }.bind(this));

      // kibo.down('s', function () {
      //   if (!this.is_editor_visible) {
      //     this.riftSandbox.setVelocity(-MOVEMENT_RATE);
      //   }
      // }.bind(this));
      // kibo.up('s', function () {
      //   if (!this.is_editor_visible) {
      //     this.riftSandbox.setVelocity(0);
      //   }
      // }.bind(this));

      kibo.down('a', function () {
        if (!this.is_editor_visible) {
          this.riftSandbox.BaseRotationEuler.y += ROTATION_RATE;
        }
      }.bind(this));
      kibo.down('d', function () {
        if (!this.is_editor_visible) {
          this.riftSandbox.BaseRotationEuler.y -= ROTATION_RATE;
        }
      }.bind(this));

      kibo.down('q', function () {
        //vt add
        console.log("index.js.bindKeyboardShortcuts: now in q handler, is_editor_visible=" + this.is_editor_visible);
        //vt end
        if (!this.is_editor_visible) {
          //console.log("vt: index.js.bindKeyboardShortcuts: BaseRotationEuler.y pre=" + this.riftSandbox.BaseRotationEuler.y);
          //vtthis.riftSandbox.BaseRotationEuler.y += Math.PI / 4;
          this.updateBaseRotation(0,ONE_DEGREE * 5.0,0.0);
          this.updateTextAreaRotation(0,ONE_DEGREE * 5.0,0);
          //console.log("vt: index.js.bindKeyboardShortcuts: BaseRotationEuler.y post=" + this.riftSandbox.BaseRotationEuler.y);
          //vt add
          // prevent default behavior (inserting into textarea) from happening.
          return false;
          //vt end
        }
      }.bind(this));

      //vt add
      // try binding to the scratch TextArea
      // kibo.down('q', function () {
      //   //vt add
      //   console.log("index.js.bindKeyboardShortcuts: now in scratch q handler");
      //   //vt end
      //   if (!this.is_editor_visible) {
      //     this.riftSandbox.BaseRotationEuler.y += Math.PI / 4;
      //   }
      // }.bind(this.scratchTextArea));
      //vt end
      
      kibo.down('e', function () {
        if (!this.is_editor_visible) {
          //vtthis.riftSandbox.BaseRotationEuler.y -= Math.PI / 4;
          //vt add
          this.updateBaseRotation(0,-ONE_DEGREE * 5.0,0.0);
          this.updateTextAreaRotation(0,-ONE_DEGREE * 5.0,0);

          // prevent default behavior (inserting into textarea) from happening.
          return false;
          //vt end
        }
        return true;
      }.bind(this));

      //vt add
      kibo.down('n', function () {
        if (!this.is_editor_visible) {
          this.updateBasePosition(0,-KBD_MOVE_DELTA,0);
          // and don't insert text
          return false;
        }
        return true;
      }.bind(this));

      kibo.down('p', function () {
        if (!this.is_editor_visible) {
          this.updateBasePosition(0,KBD_MOVE_DELTA,0);
          // and don't insert text
          return false;
        }
        return true;
      }.bind(this));

      // note we override the defaul w,s,a,d here.  We leave the originals intact becuase
      // they have a useful angle that we may want to re-instate in the future.
      kibo.down('w', function () {
        if (!this.is_editor_visible) {
          this.updateBasePosition(0,0,-KBD_MOVE_DELTA);
          this.updateTextAreaPosition(0,0,-KBD_MOVE_DELTA);
          // and don't insert text
          return false;
        }
        return true;
      }.bind(this));

      kibo.down('s', function () {
        if (!this.is_editor_visible) {
          this.updateBasePosition(0,0,KBD_MOVE_DELTA);
          this.updateTextAreaPosition(0,0,KBD_MOVE_DELTA);
          // and don't insert text
          return false;
        }
        return true;
      }.bind(this));

      kibo.down('a', function () {
        if (!this.is_editor_visible) {
          this.updateBasePosition(-KBD_MOVE_DELTA,0,0);
          this.updateTextAreaPosition(-KBD_MOVE_DELTA,0,0);
          // and don't insert text
          return false;
        }
        return true;
      }.bind(this));

      kibo.down('d', function () {
        if (!this.is_editor_visible) {
          this.updateBasePosition(KBD_MOVE_DELTA,0,0);
          this.updateTextAreaPosition(KBD_MOVE_DELTA,0,0);
          // and don't insert text
          return false;
        }
        return true;
      }.bind(this));

      kibo.down('z', function () {
        if (!this.is_editor_visible) {
          this.riftSandbox.initPosition();
          
          // and don't insert text
          return false;
        }
        return true;
      }.bind(this));
      
      //vt end
      
      kibo.down(getShortcut(), function () {
        if (this.shiftPressed) { return false; }
        this.shiftPressed = true;
        return false;
      }.bind(this));
      kibo.up('shift', function () {
        this.shiftPressed = false;
        return false;
      }.bind(this));

      kibo.down(getShortcut(), function () {
        if (this.modifierPressed) { return false; }
        var start = this.domTextArea.selectionStart;
        File.recordOriginalNumberAt(this.sketch, start);
        this.handStart = this.handCurrent;
        this.modifierPressed = true;
        return false;
      }.bind(this));
      kibo.up(getShortcut(), function () {
        this.modifierPressed = false;
        return false;
      }.bind(this));
    }.bind(this);
    // end bindKeyboardShortcuts

    var toggleVrMode = function () {
      if (
        !(document.mozFullScreenElement || document.webkitFullScreenElement) &&
        this.riftSandbox.vrMode
      ) {
        this.isInfullscreen = false;
        this.riftSandbox.toggleVrMode();
      }
      else {
        this.isInfullscreen = true;
      }
    }.bind(this);
    document.addEventListener('mozfullscreenchange', toggleVrMode, false);
    document.addEventListener('webkitfullscreenchange', toggleVrMode, false);
    $(function () {
      // querySelector returns the first
      this.domTextArea = document.querySelector('textarea');
      //this.domTextArea = $('#sketchContents');
      //vt add
      this.scratchTextArea = document.querySelectorAll('textarea')[1];
      //this.scratchTextArea = $('#scratch');
      console.log("index.js: scratchTextArea=" + this.scratchTextArea);
      //vt end
      this.bindKeyboardShortcuts();
      var $domTextArea = $(this.domTextArea);
      $domTextArea.on('blur', function () {
        $domTextArea.focus();
      }.bind(this));
      $domTextArea.on('keydown', function (e) {
        // prevent VR polyfill from hijacking wasd.
        e.stopPropagation();
      });
      $domTextArea.focus();


      //vt add
      // this.scratchTextArea.on('keydown', function (e) {
      //   // prevent VR polyfill from hijacking wasd.
      //   e.stopPropagation();
      // });

        // these are used over anything in the css
        this.domTextArea.rows = 8;
        this.domTextArea.cols = 40;
      //vt end
      this.domTextArea.selectionStart = this.domTextArea.selectionEnd = 0;
      this.riftSandbox = new RiftSandbox(
        window.innerWidth, window.innerHeight, this.domTextArea,
        function (err) {
          this.seemsUnsupported = !!err;
        }.bind(this)
      );

      this.readCode = function (code) {
        this.sketch.contents = code;
        this.domTextArea.value = code;

        this.riftSandbox.clearScene();
        var _sketchLoop;
        this.riftSandbox.textArea.setInfo('');
        try {
          /* jshint -W054 */
          var _sketchFunc = new Function(
            'scene', 'camera', 'api',
            '"use strict";\n' + code
          );
          /* jshint +W054 */
          _sketchLoop = _sketchFunc(
            this.riftSandbox.scene, this.riftSandbox.cameraPivot, api);
        }
        catch (err) {
          this.riftSandbox.textArea.setInfo(err.toString());
        }
        if (_sketchLoop) {
          this.sketchLoop = _sketchLoop;
        }
      }.bind(this);

      this.writeCode = function (code) {
        this.firebaseRef.set({contents: code});
      };

      $('#sketchContents').on('keyup', function (e) {
        var code = e.target.value;
        if (code === this.sketch.contents) { return; }

        //vt add
        //if (code === )
        // else if (e.keyCode == 85 && e.altKey && e.shiftKey) {
        //   console.log("index.js: now in alt shift u handler #3");
        //   return;
        // };
        //vt end
        this.writeCode(code);
      }.bind(this));


      //vt add
      // viewer
      //  $('#body').on('keyup', function (e) {
      //   console.log("index.js: now in #viewer event handler");
      //   if (e.keyCode == 85 && e.altKey && e.shiftKey) {
      //     console.log("index.js: now in alt shift u handler #3");
      //     return;
      //   };        
      // }.bind(this));
      //vt end
                     
      window.addEventListener(
        'resize',
        this.riftSandbox.resize.bind(this.riftSandbox),
        false
      );

      var kibo = new Kibo(this.domTextArea);
      kibo.down(getShortcut('v'), function () {
        this.riftSandbox.toggleVrMode();
        this.riftSandbox.vrManager.toggleVRMode();
        return false;
      }.bind(this));

      //vt add
      // var kibo_canvas = new Kibo($('#viewer'));
      // kibo_canvas.down(getShortcut('u'), function () {
      //   console.log("index.js: now in alt shift u handler #2");
      //   this.domTextArea.disabled = !this.domTextArea.disabled;
      //   this.domTextArea.focus();
      //   return false;
      // }.bind(this));

      //vt end
      this.riftSandbox.resize();

      this.mainLoop();
    }.bind(this));
  };
  new SketchController();
});
