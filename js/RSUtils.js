define(
  'RSUtils',
  [
  'Three',
],
function(
  THREE
){
  'use strict';

  var x = 7;
  
  var constr = function(){
  };
  
  constr.prototype.helloWorld = function () {
           return "Hello world!";
  };

  // example call:
  // result = rsUtils.getSceneObject({scene: scene, name: "abc"});
  constr.prototype.getSceneObject = function (args) {
    // console.log("RSUtils.getSceneObject: args=" + args);
    // console.log("RSUtils.getSceneObject: args.scene=" + args.scene);
    // console.log("RSUtils.getSceneObject: args.name=" + args.name);
    
    var scene = args.scene;
    var name  = args.name;

    var result;
    // console.log("RSUtils. getSceneObject: result=" + "scene=" + scene.name + ",name=" + name);
    // return "scene=" + scene.name + ",name=" + name;
    //return 1;
    for (var i =0; i < scene.children.length; i++){
      if (scene.children[i].name === name){
        result = scene.children[i];

        break;
      }
    }

    return result;
  };

  return constr;
});

      












