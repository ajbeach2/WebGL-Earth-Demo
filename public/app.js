(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var message = require("./message")

function Components(Cs) {
  this._count = Cs.length
  this._types = Cs
}

Components.prototype.index = function(C) {
  for (var i = 0; i < this._types.length; i++) {
    if (this._types[i] === C) return i
  }

  throw new TypeError(message("unknown_component", C))
}

Components.prototype.mask = function(C) {
  return 1 << this.index(C)
}

Object.defineProperty(Components.prototype, "count", {
  get: function() {
    return this._count
  }
})

module.exports = Components

},{"./message":6}],2:[function(require,module,exports){
var utils = require("./utils")
var arrayCreate = utils.arrayCreate
var arrayExpand = utils.arrayExpand
var arrayFill = utils.arrayFill

function ContiguousStorage(components, capacity) {
  if (capacity === void 0) {
    capacity = 0
  }

  this._count = components.count
  this._components = arrayCreate(this._count * capacity, null)
}

ContiguousStorage.prototype.get = function(id, index) {
  return this._components[this._count * id + index]
}

ContiguousStorage.prototype.set = function(id, index, component) {
  this._components[this._count * id + index] = component
}

ContiguousStorage.prototype.delete = function(id, index) {
  this.set(id, index, null)
}

ContiguousStorage.prototype.destroy = function(id) {
  arrayFill(this._components, null, this._count * id, this._count * (id + 1))
}

ContiguousStorage.prototype.resize = function(capacity) {
  arrayExpand(this._components, this._count * capacity, null)
}

module.exports = ContiguousStorage

},{"./utils":7}],3:[function(require,module,exports){
function Entity(manager, id) {
  this._manager = manager
  this._id = id
}

Entity.prototype.add = function(C) {
  this._manager._add(this._id, C)
}

Entity.prototype.remove = function(C) {
  this._manager._remove(this._id, C)
}

Entity.prototype.has = function(C) {
  return this._manager._has(this._id, C)
}

Entity.prototype.get = function(C) {
  return this._manager._get(this._id, C)
}

Entity.prototype.destroy = function() {
  return this._manager._destroy(this._id)
}

Object.defineProperty(Entity.prototype, "id", {
  get: function() {
    return this._id
  }
})

Object.defineProperty(Entity.prototype, "valid", {
  get: function() {
    return this._manager.valid(this)
  }
})

module.exports = Entity

},{}],4:[function(require,module,exports){
var Entity = require("./entity")
var utils = require("./utils")

var arrayCreate = utils.arrayCreate
var arrayExpand = utils.arrayExpand
var typedArrayExpand = utils.typedArrayExpand

var INITIAL_CAPACITY = 1024
var ENTITY_DEAD = 0
var ENTITY_ALIVE = 1

function EntityManager(components, storage) {
  // Components storages
  this._components = components
  this._storage = storage
  this._storage.resize(INITIAL_CAPACITY)

  // Entities storages
  this._entityFlag = new Uint8Array(INITIAL_CAPACITY)
  this._entityMask = new Uint32Array(INITIAL_CAPACITY)
  this._entityInst = arrayCreate(INITIAL_CAPACITY, null)

  this._entityPool = []
  this._entityCounter = 0
}

EntityManager.prototype.create = function() {
  var id
  if (this._entityPool.length > 0) {
    id = this._entityPool.pop()
  } else {
    id = this._entityCounter++
    this._entityInst[id] = new Entity(this, id)
    this._accomodate(id)
  }

  var entity = this._entityInst[id]
  this._entityFlag[id] = ENTITY_ALIVE

  return entity
}

EntityManager.prototype.get = function(id) {
  return this._entityInst[id]
}

EntityManager.prototype.query = function() {
  var mask = 0
  for (var i = 0; i < arguments.length; i++) {
    mask |= this._components.mask(arguments[i])
  }

  if (mask === 0) {
    return []
  }

  var result = []
  for (var id = 0; id < this._entityCounter; id++) {
    if (this._entityFlag[id] === ENTITY_ALIVE && (this._entityMask[id] & mask) === mask) {
      result.push(this._entityInst[id])
    }
  }

  return result
}

EntityManager.prototype.valid = function(entity) {
  var id = entity._id
  return this._entityFlag[id] === ENTITY_ALIVE && this._entityInst[id] === entity
}

EntityManager.prototype._accomodate = function(id) {
  var capacity = this._entityFlag.length
  if (capacity <= id) {
    capacity *= 2

    this._entityFlag = typedArrayExpand(this._entityFlag, capacity)
    this._entityMask = typedArrayExpand(this._entityMask, capacity)
    this._entityInst = arrayExpand(this._entityInst, capacity, null)
    this._storage.resize(capacity)
  }
}

EntityManager.prototype._add = function(id, component) {
  var ctor = component.constructor
  var index = this._components.index(ctor)
  this._entityMask[id] |= 1 << index
  this._storage.set(id, index, component)
}

EntityManager.prototype._remove = function(id, C) {
  var index = this._components.index(C)
  this._entityMask[id] &= ~(1 << index)
  this._storage.delete(id, index)
}

EntityManager.prototype._has = function(id, C) {
  var mask = this._components.mask(C)
  return (this._entityMask[id] & mask) !== 0
}

EntityManager.prototype._get = function(id, C) {
  var index = this._components.index(C)
  return this._storage.get(id, index)
}

EntityManager.prototype._destroy = function(id) {
  if (this._entityFlag[id] === ENTITY_ALIVE) {
    this._entityFlag[id] = ENTITY_DEAD
    this._entityMask[id] = 0
    this._entityPool.push(id)
    this._storage.destroy(id)
  }
}

Object.defineProperty(EntityManager.prototype, "capacity", {
  get: function() {
    return this._entityFlag.length
  }
})

module.exports = EntityManager

},{"./entity":3,"./utils":7}],5:[function(require,module,exports){
var Components = require("./components")
var ContiguousStorage = require("./contiguous_storage")
var EntityManager = require("./entity_manager")
var message = require("./message")

module.exports = function() {
  var count = arguments.length
  if (count > 32) throw new RangeError(message("too_many_components", 32))

  var Cs = new Array(count)
  for (var i = 0; i < Cs.length; i++) {
    Cs[i] = arguments[i]
  }

  var components = new Components(Cs)
  var storage = new ContiguousStorage(components)

  return new EntityManager(components, storage)
}

},{"./components":1,"./contiguous_storage":2,"./entity_manager":4,"./message":6}],6:[function(require,module,exports){
var messages = {
  "too_many_components":  "Too many components declared (only {0} allowed)",
  "unknown_component":    "Unknown component type '{0}'",
  "invalid_entity":       "Invalid entity '{0}'",
  "illegal_entity":       "Illegal access to entity '{0}'",
  "realloc_performed":    "Reallocation performed to handle {0} entities"
}

function message(type) {
  return messages[type].replace(/{(\d+)}/g, function(i) {
    return arguments[i + 1]
  })
}

module.exports = message

},{}],7:[function(require,module,exports){
exports.arrayCreate = arrayCreate
exports.arrayExpand = arrayExpand
exports.arrayFill = arrayFill
exports.typedArrayExpand = typedArrayExpand

// Arrays
// ------

function arrayCreate(length, value) {
  return arrayFill(new Array(length), value, 0, length)
}

function arrayExpand(source, length, value) {
  return arrayFill(source, value, source.length, length)
}

function arrayFill(target, value, start, end) {
  for (var i = start; i < end; i++) {
    target[i] = value
  }

  return target
}

// Typed arrays
// ------------

function typedArrayExpand(source, length) {
  var SourceTypedArray = source.constructor
  var target = new SourceTypedArray(length)

  target.set(source)
  return target
}

},{}],8:[function(require,module,exports){
"use strict";

var _makr = require("makr");

var _makr2 = _interopRequireDefault(_makr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Body = function Body(x, y) {
  _classCallCheck(this, Body);

  this.x = x;
  this.y = y;
  this.dx = 0;
  this.dy = 0;
};

var Display = function Display(img) {
  _classCallCheck(this, Display);

  this.img = img;
};

// Create the entity manager

var em = (0, _makr2.default)(Body, Display);

function movementSystem(dt) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = em.query(Body)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var entity = _step.value;

      var body = entity.get(Body);
      body.x += body.dx * dt;
      body.y += body.dy * dt;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

function renderingSystem() {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = em.query(Body, Display)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var entity = _step2.value;

      var body = entity.get(Body);

      var _entity$get = entity.get(Display);

      var img = _entity$get.img;

      img.x = body.x;
      img.y = body.y;
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
}

renderingSystem();

// var camera, scene, renderer;
// var mesh;

// init();
// animate();

// function init() {

// 	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
// 	camera.position.z = 400;

// 	scene = new THREE.Scene();

// 	var texture = THREE.ImageUtils.loadTexture( 'textures/crate.gif' );

// 	var geometry = new THREE.BoxGeometry( 200, 200, 200 );
// 	var material = new THREE.MeshBasicMaterial( { map: texture } );

// 	mesh = new THREE.Mesh( geometry, material );
// 	scene.add( mesh );

// 	renderer = new THREE.WebGLRenderer();
// 	renderer.setPixelRatio( window.devicePixelRatio );
// 	renderer.setSize( window.innerWidth, window.innerHeight );
// 	document.body.appendChild( renderer.domElement );

// 	//

// 	window.addEventListener( 'resize', onWindowResize, false );

// }

// function onWindowResize() {

// 	camera.aspect = window.innerWidth / window.innerHeight;
// 	camera.updateProjectionMatrix();

// 	renderer.setSize( window.innerWidth, window.innerHeight );

// }

// function animate() {

// 	requestAnimationFrame( animate );

// 	mesh.rotation.x += 0.005;
// 	mesh.rotation.y += 0.01;

// 	renderer.render( scene, camera );

// }

},{"makr":5}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvbWFrci9saWIvY29tcG9uZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9tYWtyL2xpYi9jb250aWd1b3VzX3N0b3JhZ2UuanMiLCJub2RlX21vZHVsZXMvbWFrci9saWIvZW50aXR5LmpzIiwibm9kZV9tb2R1bGVzL21ha3IvbGliL2VudGl0eV9tYW5hZ2VyLmpzIiwibm9kZV9tb2R1bGVzL21ha3IvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21ha3IvbGliL21lc3NhZ2UuanMiLCJub2RlX21vZHVsZXMvbWFrci9saWIvdXRpbHMuanMiLCJzcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0lDaENNLElBQUksR0FDUixTQURJLElBQUksQ0FDSSxDQUFDLEVBQUUsQ0FBQyxFQUFFO3dCQURkLElBQUk7O0FBRU4sTUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDVixNQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNWLE1BQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0FBQ1gsTUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7Q0FDWjs7SUFHRyxPQUFPLEdBQ1gsU0FESSxPQUFPLENBQ0MsR0FBRyxFQUFFO3dCQURiLE9BQU87O0FBRVQsTUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7Q0FDZjs7OztBQUlILElBQU0sRUFBRSxHQUFHLG9CQUFLLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTs7QUFFOUIsU0FBUyxjQUFjLENBQUMsRUFBRSxFQUFFOzs7Ozs7QUFDMUIseUJBQW1CLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLDhIQUFFO1VBQTFCLE1BQU07O0FBQ2IsVUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUM3QixVQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBO0FBQ3RCLFVBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUE7S0FDdkI7Ozs7Ozs7Ozs7Ozs7OztDQUNGOztBQUVELFNBQVMsZUFBZSxHQUFHOzs7Ozs7QUFDekIsMEJBQW1CLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxtSUFBRTtVQUFuQyxNQUFNOztBQUNiLFVBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7O3dCQUNmLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDOztVQUExQixHQUFHLGVBQUgsR0FBRzs7QUFDVixTQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUE7QUFDZCxTQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUE7S0FDZjs7Ozs7Ozs7Ozs7Ozs7O0NBQ0Y7O0FBRUQsZUFBZSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBtZXNzYWdlID0gcmVxdWlyZShcIi4vbWVzc2FnZVwiKVxuXG5mdW5jdGlvbiBDb21wb25lbnRzKENzKSB7XG4gIHRoaXMuX2NvdW50ID0gQ3MubGVuZ3RoXG4gIHRoaXMuX3R5cGVzID0gQ3Ncbn1cblxuQ29tcG9uZW50cy5wcm90b3R5cGUuaW5kZXggPSBmdW5jdGlvbihDKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fdHlwZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodGhpcy5fdHlwZXNbaV0gPT09IEMpIHJldHVybiBpXG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKG1lc3NhZ2UoXCJ1bmtub3duX2NvbXBvbmVudFwiLCBDKSlcbn1cblxuQ29tcG9uZW50cy5wcm90b3R5cGUubWFzayA9IGZ1bmN0aW9uKEMpIHtcbiAgcmV0dXJuIDEgPDwgdGhpcy5pbmRleChDKVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQ29tcG9uZW50cy5wcm90b3R5cGUsIFwiY291bnRcIiwge1xuICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9jb3VudFxuICB9XG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbXBvbmVudHNcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpXG52YXIgYXJyYXlDcmVhdGUgPSB1dGlscy5hcnJheUNyZWF0ZVxudmFyIGFycmF5RXhwYW5kID0gdXRpbHMuYXJyYXlFeHBhbmRcbnZhciBhcnJheUZpbGwgPSB1dGlscy5hcnJheUZpbGxcblxuZnVuY3Rpb24gQ29udGlndW91c1N0b3JhZ2UoY29tcG9uZW50cywgY2FwYWNpdHkpIHtcbiAgaWYgKGNhcGFjaXR5ID09PSB2b2lkIDApIHtcbiAgICBjYXBhY2l0eSA9IDBcbiAgfVxuXG4gIHRoaXMuX2NvdW50ID0gY29tcG9uZW50cy5jb3VudFxuICB0aGlzLl9jb21wb25lbnRzID0gYXJyYXlDcmVhdGUodGhpcy5fY291bnQgKiBjYXBhY2l0eSwgbnVsbClcbn1cblxuQ29udGlndW91c1N0b3JhZ2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGlkLCBpbmRleCkge1xuICByZXR1cm4gdGhpcy5fY29tcG9uZW50c1t0aGlzLl9jb3VudCAqIGlkICsgaW5kZXhdXG59XG5cbkNvbnRpZ3VvdXNTdG9yYWdlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihpZCwgaW5kZXgsIGNvbXBvbmVudCkge1xuICB0aGlzLl9jb21wb25lbnRzW3RoaXMuX2NvdW50ICogaWQgKyBpbmRleF0gPSBjb21wb25lbnRcbn1cblxuQ29udGlndW91c1N0b3JhZ2UucHJvdG90eXBlLmRlbGV0ZSA9IGZ1bmN0aW9uKGlkLCBpbmRleCkge1xuICB0aGlzLnNldChpZCwgaW5kZXgsIG51bGwpXG59XG5cbkNvbnRpZ3VvdXNTdG9yYWdlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oaWQpIHtcbiAgYXJyYXlGaWxsKHRoaXMuX2NvbXBvbmVudHMsIG51bGwsIHRoaXMuX2NvdW50ICogaWQsIHRoaXMuX2NvdW50ICogKGlkICsgMSkpXG59XG5cbkNvbnRpZ3VvdXNTdG9yYWdlLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbihjYXBhY2l0eSkge1xuICBhcnJheUV4cGFuZCh0aGlzLl9jb21wb25lbnRzLCB0aGlzLl9jb3VudCAqIGNhcGFjaXR5LCBudWxsKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRpZ3VvdXNTdG9yYWdlXG4iLCJmdW5jdGlvbiBFbnRpdHkobWFuYWdlciwgaWQpIHtcbiAgdGhpcy5fbWFuYWdlciA9IG1hbmFnZXJcbiAgdGhpcy5faWQgPSBpZFxufVxuXG5FbnRpdHkucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKEMpIHtcbiAgdGhpcy5fbWFuYWdlci5fYWRkKHRoaXMuX2lkLCBDKVxufVxuXG5FbnRpdHkucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKEMpIHtcbiAgdGhpcy5fbWFuYWdlci5fcmVtb3ZlKHRoaXMuX2lkLCBDKVxufVxuXG5FbnRpdHkucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKEMpIHtcbiAgcmV0dXJuIHRoaXMuX21hbmFnZXIuX2hhcyh0aGlzLl9pZCwgQylcbn1cblxuRW50aXR5LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihDKSB7XG4gIHJldHVybiB0aGlzLl9tYW5hZ2VyLl9nZXQodGhpcy5faWQsIEMpXG59XG5cbkVudGl0eS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fbWFuYWdlci5fZGVzdHJveSh0aGlzLl9pZClcbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEVudGl0eS5wcm90b3R5cGUsIFwiaWRcIiwge1xuICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9pZFxuICB9XG59KVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoRW50aXR5LnByb3RvdHlwZSwgXCJ2YWxpZFwiLCB7XG4gIGdldDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hbmFnZXIudmFsaWQodGhpcylcbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBFbnRpdHlcbiIsInZhciBFbnRpdHkgPSByZXF1aXJlKFwiLi9lbnRpdHlcIilcbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpXG5cbnZhciBhcnJheUNyZWF0ZSA9IHV0aWxzLmFycmF5Q3JlYXRlXG52YXIgYXJyYXlFeHBhbmQgPSB1dGlscy5hcnJheUV4cGFuZFxudmFyIHR5cGVkQXJyYXlFeHBhbmQgPSB1dGlscy50eXBlZEFycmF5RXhwYW5kXG5cbnZhciBJTklUSUFMX0NBUEFDSVRZID0gMTAyNFxudmFyIEVOVElUWV9ERUFEID0gMFxudmFyIEVOVElUWV9BTElWRSA9IDFcblxuZnVuY3Rpb24gRW50aXR5TWFuYWdlcihjb21wb25lbnRzLCBzdG9yYWdlKSB7XG4gIC8vIENvbXBvbmVudHMgc3RvcmFnZXNcbiAgdGhpcy5fY29tcG9uZW50cyA9IGNvbXBvbmVudHNcbiAgdGhpcy5fc3RvcmFnZSA9IHN0b3JhZ2VcbiAgdGhpcy5fc3RvcmFnZS5yZXNpemUoSU5JVElBTF9DQVBBQ0lUWSlcblxuICAvLyBFbnRpdGllcyBzdG9yYWdlc1xuICB0aGlzLl9lbnRpdHlGbGFnID0gbmV3IFVpbnQ4QXJyYXkoSU5JVElBTF9DQVBBQ0lUWSlcbiAgdGhpcy5fZW50aXR5TWFzayA9IG5ldyBVaW50MzJBcnJheShJTklUSUFMX0NBUEFDSVRZKVxuICB0aGlzLl9lbnRpdHlJbnN0ID0gYXJyYXlDcmVhdGUoSU5JVElBTF9DQVBBQ0lUWSwgbnVsbClcblxuICB0aGlzLl9lbnRpdHlQb29sID0gW11cbiAgdGhpcy5fZW50aXR5Q291bnRlciA9IDBcbn1cblxuRW50aXR5TWFuYWdlci5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBpZFxuICBpZiAodGhpcy5fZW50aXR5UG9vbC5sZW5ndGggPiAwKSB7XG4gICAgaWQgPSB0aGlzLl9lbnRpdHlQb29sLnBvcCgpXG4gIH0gZWxzZSB7XG4gICAgaWQgPSB0aGlzLl9lbnRpdHlDb3VudGVyKytcbiAgICB0aGlzLl9lbnRpdHlJbnN0W2lkXSA9IG5ldyBFbnRpdHkodGhpcywgaWQpXG4gICAgdGhpcy5fYWNjb21vZGF0ZShpZClcbiAgfVxuXG4gIHZhciBlbnRpdHkgPSB0aGlzLl9lbnRpdHlJbnN0W2lkXVxuICB0aGlzLl9lbnRpdHlGbGFnW2lkXSA9IEVOVElUWV9BTElWRVxuXG4gIHJldHVybiBlbnRpdHlcbn1cblxuRW50aXR5TWFuYWdlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oaWQpIHtcbiAgcmV0dXJuIHRoaXMuX2VudGl0eUluc3RbaWRdXG59XG5cbkVudGl0eU1hbmFnZXIucHJvdG90eXBlLnF1ZXJ5ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBtYXNrID0gMFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIG1hc2sgfD0gdGhpcy5fY29tcG9uZW50cy5tYXNrKGFyZ3VtZW50c1tpXSlcbiAgfVxuXG4gIGlmIChtYXNrID09PSAwKSB7XG4gICAgcmV0dXJuIFtdXG4gIH1cblxuICB2YXIgcmVzdWx0ID0gW11cbiAgZm9yICh2YXIgaWQgPSAwOyBpZCA8IHRoaXMuX2VudGl0eUNvdW50ZXI7IGlkKyspIHtcbiAgICBpZiAodGhpcy5fZW50aXR5RmxhZ1tpZF0gPT09IEVOVElUWV9BTElWRSAmJiAodGhpcy5fZW50aXR5TWFza1tpZF0gJiBtYXNrKSA9PT0gbWFzaykge1xuICAgICAgcmVzdWx0LnB1c2godGhpcy5fZW50aXR5SW5zdFtpZF0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5FbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS52YWxpZCA9IGZ1bmN0aW9uKGVudGl0eSkge1xuICB2YXIgaWQgPSBlbnRpdHkuX2lkXG4gIHJldHVybiB0aGlzLl9lbnRpdHlGbGFnW2lkXSA9PT0gRU5USVRZX0FMSVZFICYmIHRoaXMuX2VudGl0eUluc3RbaWRdID09PSBlbnRpdHlcbn1cblxuRW50aXR5TWFuYWdlci5wcm90b3R5cGUuX2FjY29tb2RhdGUgPSBmdW5jdGlvbihpZCkge1xuICB2YXIgY2FwYWNpdHkgPSB0aGlzLl9lbnRpdHlGbGFnLmxlbmd0aFxuICBpZiAoY2FwYWNpdHkgPD0gaWQpIHtcbiAgICBjYXBhY2l0eSAqPSAyXG5cbiAgICB0aGlzLl9lbnRpdHlGbGFnID0gdHlwZWRBcnJheUV4cGFuZCh0aGlzLl9lbnRpdHlGbGFnLCBjYXBhY2l0eSlcbiAgICB0aGlzLl9lbnRpdHlNYXNrID0gdHlwZWRBcnJheUV4cGFuZCh0aGlzLl9lbnRpdHlNYXNrLCBjYXBhY2l0eSlcbiAgICB0aGlzLl9lbnRpdHlJbnN0ID0gYXJyYXlFeHBhbmQodGhpcy5fZW50aXR5SW5zdCwgY2FwYWNpdHksIG51bGwpXG4gICAgdGhpcy5fc3RvcmFnZS5yZXNpemUoY2FwYWNpdHkpXG4gIH1cbn1cblxuRW50aXR5TWFuYWdlci5wcm90b3R5cGUuX2FkZCA9IGZ1bmN0aW9uKGlkLCBjb21wb25lbnQpIHtcbiAgdmFyIGN0b3IgPSBjb21wb25lbnQuY29uc3RydWN0b3JcbiAgdmFyIGluZGV4ID0gdGhpcy5fY29tcG9uZW50cy5pbmRleChjdG9yKVxuICB0aGlzLl9lbnRpdHlNYXNrW2lkXSB8PSAxIDw8IGluZGV4XG4gIHRoaXMuX3N0b3JhZ2Uuc2V0KGlkLCBpbmRleCwgY29tcG9uZW50KVxufVxuXG5FbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5fcmVtb3ZlID0gZnVuY3Rpb24oaWQsIEMpIHtcbiAgdmFyIGluZGV4ID0gdGhpcy5fY29tcG9uZW50cy5pbmRleChDKVxuICB0aGlzLl9lbnRpdHlNYXNrW2lkXSAmPSB+KDEgPDwgaW5kZXgpXG4gIHRoaXMuX3N0b3JhZ2UuZGVsZXRlKGlkLCBpbmRleClcbn1cblxuRW50aXR5TWFuYWdlci5wcm90b3R5cGUuX2hhcyA9IGZ1bmN0aW9uKGlkLCBDKSB7XG4gIHZhciBtYXNrID0gdGhpcy5fY29tcG9uZW50cy5tYXNrKEMpXG4gIHJldHVybiAodGhpcy5fZW50aXR5TWFza1tpZF0gJiBtYXNrKSAhPT0gMFxufVxuXG5FbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5fZ2V0ID0gZnVuY3Rpb24oaWQsIEMpIHtcbiAgdmFyIGluZGV4ID0gdGhpcy5fY29tcG9uZW50cy5pbmRleChDKVxuICByZXR1cm4gdGhpcy5fc3RvcmFnZS5nZXQoaWQsIGluZGV4KVxufVxuXG5FbnRpdHlNYW5hZ2VyLnByb3RvdHlwZS5fZGVzdHJveSA9IGZ1bmN0aW9uKGlkKSB7XG4gIGlmICh0aGlzLl9lbnRpdHlGbGFnW2lkXSA9PT0gRU5USVRZX0FMSVZFKSB7XG4gICAgdGhpcy5fZW50aXR5RmxhZ1tpZF0gPSBFTlRJVFlfREVBRFxuICAgIHRoaXMuX2VudGl0eU1hc2tbaWRdID0gMFxuICAgIHRoaXMuX2VudGl0eVBvb2wucHVzaChpZClcbiAgICB0aGlzLl9zdG9yYWdlLmRlc3Ryb3koaWQpXG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEVudGl0eU1hbmFnZXIucHJvdG90eXBlLCBcImNhcGFjaXR5XCIsIHtcbiAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fZW50aXR5RmxhZy5sZW5ndGhcbiAgfVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBFbnRpdHlNYW5hZ2VyXG4iLCJ2YXIgQ29tcG9uZW50cyA9IHJlcXVpcmUoXCIuL2NvbXBvbmVudHNcIilcbnZhciBDb250aWd1b3VzU3RvcmFnZSA9IHJlcXVpcmUoXCIuL2NvbnRpZ3VvdXNfc3RvcmFnZVwiKVxudmFyIEVudGl0eU1hbmFnZXIgPSByZXF1aXJlKFwiLi9lbnRpdHlfbWFuYWdlclwiKVxudmFyIG1lc3NhZ2UgPSByZXF1aXJlKFwiLi9tZXNzYWdlXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBjb3VudCA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgaWYgKGNvdW50ID4gMzIpIHRocm93IG5ldyBSYW5nZUVycm9yKG1lc3NhZ2UoXCJ0b29fbWFueV9jb21wb25lbnRzXCIsIDMyKSlcblxuICB2YXIgQ3MgPSBuZXcgQXJyYXkoY291bnQpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgQ3MubGVuZ3RoOyBpKyspIHtcbiAgICBDc1tpXSA9IGFyZ3VtZW50c1tpXVxuICB9XG5cbiAgdmFyIGNvbXBvbmVudHMgPSBuZXcgQ29tcG9uZW50cyhDcylcbiAgdmFyIHN0b3JhZ2UgPSBuZXcgQ29udGlndW91c1N0b3JhZ2UoY29tcG9uZW50cylcblxuICByZXR1cm4gbmV3IEVudGl0eU1hbmFnZXIoY29tcG9uZW50cywgc3RvcmFnZSlcbn1cbiIsInZhciBtZXNzYWdlcyA9IHtcbiAgXCJ0b29fbWFueV9jb21wb25lbnRzXCI6ICBcIlRvbyBtYW55IGNvbXBvbmVudHMgZGVjbGFyZWQgKG9ubHkgezB9IGFsbG93ZWQpXCIsXG4gIFwidW5rbm93bl9jb21wb25lbnRcIjogICAgXCJVbmtub3duIGNvbXBvbmVudCB0eXBlICd7MH0nXCIsXG4gIFwiaW52YWxpZF9lbnRpdHlcIjogICAgICAgXCJJbnZhbGlkIGVudGl0eSAnezB9J1wiLFxuICBcImlsbGVnYWxfZW50aXR5XCI6ICAgICAgIFwiSWxsZWdhbCBhY2Nlc3MgdG8gZW50aXR5ICd7MH0nXCIsXG4gIFwicmVhbGxvY19wZXJmb3JtZWRcIjogICAgXCJSZWFsbG9jYXRpb24gcGVyZm9ybWVkIHRvIGhhbmRsZSB7MH0gZW50aXRpZXNcIlxufVxuXG5mdW5jdGlvbiBtZXNzYWdlKHR5cGUpIHtcbiAgcmV0dXJuIG1lc3NhZ2VzW3R5cGVdLnJlcGxhY2UoL3soXFxkKyl9L2csIGZ1bmN0aW9uKGkpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzW2kgKyAxXVxuICB9KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1lc3NhZ2VcbiIsImV4cG9ydHMuYXJyYXlDcmVhdGUgPSBhcnJheUNyZWF0ZVxuZXhwb3J0cy5hcnJheUV4cGFuZCA9IGFycmF5RXhwYW5kXG5leHBvcnRzLmFycmF5RmlsbCA9IGFycmF5RmlsbFxuZXhwb3J0cy50eXBlZEFycmF5RXhwYW5kID0gdHlwZWRBcnJheUV4cGFuZFxuXG4vLyBBcnJheXNcbi8vIC0tLS0tLVxuXG5mdW5jdGlvbiBhcnJheUNyZWF0ZShsZW5ndGgsIHZhbHVlKSB7XG4gIHJldHVybiBhcnJheUZpbGwobmV3IEFycmF5KGxlbmd0aCksIHZhbHVlLCAwLCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGFycmF5RXhwYW5kKHNvdXJjZSwgbGVuZ3RoLCB2YWx1ZSkge1xuICByZXR1cm4gYXJyYXlGaWxsKHNvdXJjZSwgdmFsdWUsIHNvdXJjZS5sZW5ndGgsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYXJyYXlGaWxsKHRhcmdldCwgdmFsdWUsIHN0YXJ0LCBlbmQpIHtcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICB0YXJnZXRbaV0gPSB2YWx1ZVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldFxufVxuXG4vLyBUeXBlZCBhcnJheXNcbi8vIC0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiB0eXBlZEFycmF5RXhwYW5kKHNvdXJjZSwgbGVuZ3RoKSB7XG4gIHZhciBTb3VyY2VUeXBlZEFycmF5ID0gc291cmNlLmNvbnN0cnVjdG9yXG4gIHZhciB0YXJnZXQgPSBuZXcgU291cmNlVHlwZWRBcnJheShsZW5ndGgpXG5cbiAgdGFyZ2V0LnNldChzb3VyY2UpXG4gIHJldHVybiB0YXJnZXRcbn1cbiIsImltcG9ydCBtYWtyIGZyb20gXCJtYWtyXCI7XG5cbmNsYXNzIEJvZHkge1xuICBjb25zdHJ1Y3Rvcih4LCB5KSB7XG4gICAgdGhpcy54ID0geFxuICAgIHRoaXMueSA9IHlcbiAgICB0aGlzLmR4ID0gMFxuICAgIHRoaXMuZHkgPSAwXG4gIH1cbn1cblxuY2xhc3MgRGlzcGxheSB7XG4gIGNvbnN0cnVjdG9yKGltZykge1xuICAgIHRoaXMuaW1nID0gaW1nXG4gIH1cbn1cblxuLy8gQ3JlYXRlIHRoZSBlbnRpdHkgbWFuYWdlclxuY29uc3QgZW0gPSBtYWtyKEJvZHksIERpc3BsYXkpXG5cbmZ1bmN0aW9uIG1vdmVtZW50U3lzdGVtKGR0KSB7ICBcbiAgZm9yIChsZXQgZW50aXR5IG9mIGVtLnF1ZXJ5KEJvZHkpKSB7XG4gICAgY29uc3QgYm9keSA9IGVudGl0eS5nZXQoQm9keSlcbiAgICBib2R5LnggKz0gYm9keS5keCAqIGR0XG4gICAgYm9keS55ICs9IGJvZHkuZHkgKiBkdFxuICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlcmluZ1N5c3RlbSgpIHsgIFxuICBmb3IgKGxldCBlbnRpdHkgb2YgZW0ucXVlcnkoQm9keSwgRGlzcGxheSkpIHtcbiAgICBjb25zdCBib2R5ID0gZW50aXR5LmdldChCb2R5KVxuICAgIGNvbnN0IHtpbWd9ID0gZW50aXR5LmdldChEaXNwbGF5KVxuICAgIGltZy54ID0gYm9keS54XG4gICAgaW1nLnkgPSBib2R5LnlcbiAgfVxufVxuXG5yZW5kZXJpbmdTeXN0ZW0oKTtcblxuXG4vLyB2YXIgY2FtZXJhLCBzY2VuZSwgcmVuZGVyZXI7XG4vLyB2YXIgbWVzaDtcblxuLy8gaW5pdCgpO1xuLy8gYW5pbWF0ZSgpO1xuXG4vLyBmdW5jdGlvbiBpbml0KCkge1xuXG4vLyBcdGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSggNzAsIHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0LCAxLCAxMDAwICk7XG4vLyBcdGNhbWVyYS5wb3NpdGlvbi56ID0gNDAwO1xuXG4vLyBcdHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cbi8vIFx0dmFyIHRleHR1cmUgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCAndGV4dHVyZXMvY3JhdGUuZ2lmJyApO1xuXG4vLyBcdHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSggMjAwLCAyMDAsIDIwMCApO1xuLy8gXHR2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoIHsgbWFwOiB0ZXh0dXJlIH0gKTtcblxuLy8gXHRtZXNoID0gbmV3IFRIUkVFLk1lc2goIGdlb21ldHJ5LCBtYXRlcmlhbCApO1xuLy8gXHRzY2VuZS5hZGQoIG1lc2ggKTtcblxuLy8gXHRyZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKCk7XG4vLyBcdHJlbmRlcmVyLnNldFBpeGVsUmF0aW8oIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvICk7XG4vLyBcdHJlbmRlcmVyLnNldFNpemUoIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQgKTtcbi8vIFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggcmVuZGVyZXIuZG9tRWxlbWVudCApO1xuXG4vLyBcdC8vXG5cbi8vIFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdyZXNpemUnLCBvbldpbmRvd1Jlc2l6ZSwgZmFsc2UgKTtcblxuLy8gfVxuXG4vLyBmdW5jdGlvbiBvbldpbmRvd1Jlc2l6ZSgpIHtcblxuLy8gXHRjYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4vLyBcdGNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG5cbi8vIFx0cmVuZGVyZXIuc2V0U2l6ZSggd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCApO1xuXG4vLyB9XG5cbi8vIGZ1bmN0aW9uIGFuaW1hdGUoKSB7XG5cbi8vIFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCBhbmltYXRlICk7XG5cbi8vIFx0bWVzaC5yb3RhdGlvbi54ICs9IDAuMDA1O1xuLy8gXHRtZXNoLnJvdGF0aW9uLnkgKz0gMC4wMTtcblxuLy8gXHRyZW5kZXJlci5yZW5kZXIoIHNjZW5lLCBjYW1lcmEgKTtcblxuLy8gfVxuIl19
