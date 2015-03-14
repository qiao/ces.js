var CES = (function() {var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/src/class.js",function(require,module,exports,__dirname,__filename,process,global){/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

// The base Class implementation (does nothing)
var Class = module.exports = function(){};

// Create a new Class that inherits from this class
Class.extend = function(prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
        // Check if we're overwriting an existing function
        prototype[name] = typeof prop[name] == "function" && 
            typeof _super[name] == "function" && fnTest.test(prop[name]) ?
            (function(name, fn){
            return function() {
                var tmp = this._super;

                // Add a new ._super() method that is the same method
                // but on the super-class
                this._super = _super[name];

                // The method only need to be bound temporarily, so we
                // remove it when we're done executing
                var ret = fn.apply(this, arguments);        
                this._super = tmp;

                return ret;
            };
        })(name, prop[name]) :
            prop[name];
    }

    // The dummy class constructor
    function Class() {
        // All construction is actually done in the init method
        if ( !initializing && this.init )
            this.init.apply(this, arguments);
    }

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
};

});

require.define("/src/component.js",function(require,module,exports,__dirname,__filename,process,global){var Class = require('./class');

/**
 * The components is the container of some properties that
 * the entity possesses. It may also contain some methods.
 * @class
 */
var Component = module.exports = Class.extend({
    /**
     * Name of this component. It is expected to be overriden and
     * should be unique.
     * @public
     * @readonly
     * @property {String} name
     */
    name: ''
});

});

require.define("/src/entity.js",function(require,module,exports,__dirname,__filename,process,global){var Class  = require('./class'),
    Signal = require('./signal');

/**
 * The entity is the container of components.
 * @class
 */
var Entity = module.exports = Class.extend({
    /**
     * @constructor
     */
    init: function () {
        /**
         * @public
         * @readonly
         */
        this.id = Entity._id++;

        /**
         * Map from component names to components.
         * @private
         * @property
         */
        this._components = {};

        /**
         * @public
         * @readonly
         */
        this.onComponentAdded = new Signal();

        /**
         * @public
         * @readonly
         */
        this.onComponentRemoved = new Signal();
    },

    /**
     * Check if this entity has a component by name.
     * @public
     * @param {String} componentName
     * @return {Boolean}
     */
    hasComponent: function (componentName) {
        return this._components['$' + componentName] !== undefined;
    },

    /**
     * Get a component of this entity by name.
     * @public
     * @param {String} componentName
     * @return {Component}
     */
    getComponent: function (componentName) {
        return this._components['$' + componentName];
    },

    /**
     * Add a component to this entity.
     * @public
     * @param {Component} component
     */
    addComponent: function (component) {
        this._components['$' + component.name] = component;
        this.onComponentAdded.emit(this, component.name);
    },

    /**
     * Remove a component from this entity by name.
     * @public
     * @param {String} componentName
     */
    removeComponent: function (componentName) {
        var removedComponent = this._components['$' + componentName];
        this._components['$' + componentName] = undefined;
        this.onComponentRemoved.emit(this, componentName, removedComponent);
    }
});


/**
 * @static
 */
Entity._id = 0;

});

require.define("/src/signal.js",function(require,module,exports,__dirname,__filename,process,global){var Class = require('./class');

/**
 * The signal can register listeners and invoke the listeners with messages.
 * @class
 */
var Signal = module.exports = Class.extend({
    /**
     * @constructor
     */
    init: function () {
        this._listeners = [];
    },

    /**
     * Add a listener to this signal.
     * @public
     * @param {Function} listener
     */
    add: function (listener) {
        this._listeners.push(listener);
    },

    /**
     * Remove a listener from this signal.
     * @public
     * @param {Function} listener
     */
    remove: function (listener) {
        var listeners = this._listeners,
            i, len;

        for (i = 0, len = listeners.length; i < len; ++i) {
            if (listeners[i] === listener) {
                listeners.splice(i, 1);
                return true;
            }
        }
        return false;
    },

    /**
     * Emit a message.
     * @public
     * @param {...*} messages
     */
    emit: function (/* messages */) {
        var messages = arguments,
            listeners = this._listeners,
            i, len;

        for (i = 0, len = listeners.length; i < len; ++i) {
            listeners[i].apply(null, messages);
        }
    }
});

});

require.define("/src/system.js",function(require,module,exports,__dirname,__filename,process,global){var Class = require('./class');

/**
 * The system is responsible for updating the entities.
 * @class
 */
var System = module.exports = Class.extend({
    /**
     * @constructor
     */
    init: function () {
        /**
         * This property will be set when the system is added to a world.
         * @public
         */
        this.world = null;
    },

    addedToWorld: function(world) {
        this.world = world;
    },

    removedFromWorld: function(world) {
        this.world = null;
    },

    /**
     * Update the entities.
     * @public
     * @param {Number} dt time interval between updates
     */
    update: function (dt) {
        throw new Error('Subclassed should override this method');
    }
});

});

require.define("/src/world.js",function(require,module,exports,__dirname,__filename,process,global){var Class = require('./class'),
    Family = require('./family'),
    EntityList = require('./entitylist');

/**
 * The world is the container of all the entities and systems.
 * @class
 */
var World = module.exports = Class.extend({
    /**
     * @constructor
     */
    init: function () {
        /**
         * A map from familyId to family
         * @private
         */
        this._families = {};

        /**
         * @private
         */
        this._systems = [];

        /**
         * @private
         */
        this._entities = new EntityList();
    },

    /**
     * Add a system to this world.
     * @public
     * @param {System} system
     */
    addSystem: function (system) {
        this._systems.push(system);
        system.addedToWorld(this);
        return this;
    },

    /**
     * Remove a system from this world.
     * @public
     * @param {System} system
     */
    removeSystem: function (system) {
        var systems, i, len;

        systems = this._systems;
        for (i = 0, len = systems.length; i < len; ++i) {
            if (systems[i] === system) {
                systems.splice(i, 1);
                system.removedFromWorld();
            }
        }
    },

    /**
     * Add an entity to this world.
     * @public
     * @param {Entity} entity
     */
    addEntity: function (entity) {
        var families, familyId, self;

        // try to add the entity into each family
        families = this._families;
        for (familyId in families) {
            families[familyId].addEntityIfMatch(entity);
        }

        self = this;

        // update the entity-family relationship whenever components are
        // added to or removed from the entities
        entity.onComponentAdded.add(function (entity, componentName, component) {
            self._onComponentAdded(entity, componentName, component);
        });
        entity.onComponentRemoved.add(function (entity, componentName, component) {
            self._onComponentRemoved(entity, componentName, component);
        });

        this._entities.add(entity);
    },

    /**
     * Remove and entity from this world.
     * @public
     * @param {Entity} entity
     */
    removeEntity: function (entity) {
        var families, familyId;

        // try to remove the entity from each family
        families = this._families;
        for (familyId in families) {
            families[familyId].removeEntity(entity);
        }

        this._entities.remove(entity);
    },

    /**
     * Get the entities having all the specified componets.
     * @public
     * @param {...String} componentNames
     * @return {Array} an array of entities.
     */
    getEntities: function (/* componentNames */) {
        var familyId, families;

        familyId = this._getFamilyId(arguments);
        this._ensureFamilyExists(arguments);

        return this._families[familyId].getEntities();
    },

    /**
     * For each system in the world, call its `update` method.
     * @public
     * @param {Number} dt time interval between updates.
     */
    update: function (dt) {
        var systems, i, len;

        systems = this._systems;
        for (i = 0, len = systems.length; i < len; ++i) {
            systems[i].update(dt);
        }
    },

    /**
     * Returns the signal for entities added with the specified components. The
     * signal is also emitted when a component is added to an entity causing it
     * match the specified component names.
     * @public
     * @param {...String} componentNames
     * @return {Signal} A signal which is emitted every time an entity with
     *     specified components is added.
     */
    entityAdded: function(/* componentNames */) {
        var familyId, families;

        familyId = this._getFamilyId(arguments);
        this._ensureFamilyExists(arguments);

        return this._families[familyId].entityAdded;
    },

    /**
     * Returns the signal for entities removed with the specified components.
     * The signal is also emitted when a component is removed from an entity
     * causing it to no longer match the specified component names.
     * @public
     * @param {...String} componentNames
     * @return {Signal} A signal which is emitted every time an entity with
     *     specified components is removed.
     */
    entityRemoved: function(/* componentNames */) {
        var familyId, families;

        familyId = this._getFamilyId(arguments);
        this._ensureFamilyExists(arguments);

        return this._families[familyId].entityRemoved;
    },

    /**
     * Creates a family for the passed array of component names if it does not
     * exist already.
     * @param {Array.<String>} components
     */
    _ensureFamilyExists: function(components) {
        var families = this._families;
        var familyId = this._getFamilyId(components);

        if (!families[familyId]) {
            families[familyId] = new Family(
                Array.prototype.slice.call(components)
            );
            for (var node = this._entities.head; node; node = node.next) {
                families[familyId].addEntityIfMatch(node.entity);
            }
        }
    },

    /**
     * Returns the family ID for the passed array of component names. A family
     * ID is a comma separated string of all component names with a '$'
     * prepended.
     * @param {Array.<String>} components
     * @return {String} The family ID for the passed array of components.
     */
    _getFamilyId: function(components) {
        return '$' + Array.prototype.join.call(components, ',');
    },

    /**
     * Handler to be called when a component is added to an entity.
     * @private
     * @param {Entity} entity
     * @param {String} componentName
     */
    _onComponentAdded: function (entity, componentName) {
        var families, familyId;

        families = this._families;
        for (familyId in families) {
            families[familyId].onComponentAdded(entity, componentName);
        }
    },

    /**
     * Handler to be called when component is removed from an entity.
     * @private
     * @param {Entity} entity
     * @param {String} componentName
     */
    _onComponentRemoved: function (entity, componentName, component) {
        var families, familyId;

        families = this._families;
        for (familyId in families) {
            families[familyId].onComponentRemoved(entity, componentName, component);
        }
    }
});

});

require.define("/src/family.js",function(require,module,exports,__dirname,__filename,process,global){var Class = require('./class'),
    EntityList = require('./entitylist'),
    Signal = require('./signal');

/**
 * The family is a collection of entities having all the specified components.
 * @class
 */
var Family = module.exports = Class.extend({
    /**
     * @constructor
     * @param {Array} componentNames
     */
    init: function (componentNames) {
        /**
         * @private
         */
        this._componentNames = componentNames;

        /**
         * A linked list holding the entities;
         * @private
         */
        this._entities = new EntityList();

        /**
         * @public
         * @readonly
         */
        this.entityAdded = new Signal();
        /**
         * @public
         * @readonly
         */
        this.entityRemoved = new Signal();
    },

    /**
     * Get the entities of this family.
     * @public
     * @return {Array}
     */
    getEntities: function () {
        return this._entities.toArray();
    },

    /**
     * Add the entity into the family if match.
     * @public
     * @param {Entity} entity
     */
    addEntityIfMatch: function (entity) {
        if (!this._entities.has(entity) && this._matchEntity(entity)) {
            this._entities.add(entity);
            this.entityAdded.emit(entity);
        }
    },

    /**
     * Remove the entity into the family if match.
     * @public
     * @function
     * @param {Entity} entity
     */
    removeEntity: function (entity) {
        if (this._entities.has(entity)) {
            this._entities.remove(entity);
            this.entityRemoved.emit(entity);
        }
    },

    /**
     * Handler to be called when a component is added to an entity.
     * @public
     * @param {Entity} entity
     * @param {String} componentName
     */
    onComponentAdded: function (entity, componentName) {
        this.addEntityIfMatch(entity);
    },

    /**
     * Handler to be called when a component is removed from an entity.
     * @public
     * @param {Entity} entity
     * @param {String} componentName
     */
    onComponentRemoved: function (entity, componentName, removedComponent) {
        var names, i, len;

        // return if the entity is not in this family
        if (!this._entities.has(entity)) {
            return;
        }

        // remove the node if the removed component is required by this family
        names = this._componentNames;
        for (i = 0, len = names.length; i < len; ++i) {
            if (names[i] === componentName) {
                this._entities.remove(entity);
                this.entityRemoved.emit(entity, removedComponent);
            }
        }
    },

    /**
     * Check if an entity belongs to this family.
     * @private
     * @param {Entity} entity
     * @return {Boolean}
     */
    _matchEntity: function (entity) {
        var componentNames, i, len;

        componentNames = this._componentNames;

        for (i = 0, len = componentNames.length; i < len; ++i) {
            if (!entity.hasComponent(componentNames[i])) {
                return false;
            }
        }

        return true;
    }
});

});

require.define("/src/entitylist.js",function(require,module,exports,__dirname,__filename,process,global){var Class = require('./class');

/**
 * The entity node is a wrapper around an entity, to be added into
 * the entity list.
 * @class
 */
var EntityNode = Class.extend({
    init: function (entity) {
        this.entity = entity;
        this.prev = null;
        this.next = null;
    }
});

/**
 * The entity list is a doubly-linked-list which allows the
 * entities to be added and removed efficiently.
 * @class
 */
var EntityList = module.exports = Class.extend({
    /**
     * @constructor
     */
    init: function () {
        /**
         * @public
         * @readonly
         */
        this.head = null;

        /**
         * @public
         * @readonly
         */
        this.tail = null;

        /**
         * @public
         * @readonly
         */
        this.length = 0;

        /**
         * Map from entity id to entity node,
         * for O(1) find and deletion.
         * @private
         */
        this._entities = {};
    },

    /**
     * Add an entity into this list.
     * @public
     * @param {Entity} entity
     */
    add: function (entity) {
        var node = new EntityNode(entity);

        if (this.head === null) {
            this.head = this.tail = node;
        } else {
            node.prev = this.tail;
            this.tail.next = node;
            this.tail = node;
        }

        this.length += 1;
        this._entities[entity.id] = node;
    },

    /**
     * Remove an entity from this list.
     * @public
     * @param {Entity} entity
     */
    remove: function (entity) {
        var node = this._entities[entity.id];

        if (node === undefined) {
            return;
        }

        if (node.prev === null) {
            this.head = node.next;
        } else {
            node.prev.next = node.next;
        }
        if (node.next === null) {
            this.tail = node.prev;
        } else {
            node.next.prev = node.prev;
        }

        this.length -= 1;
        delete this._entities[entity.id];
    },

    /**
     * Check if this list has the entity.
     * @public
     * @param {Entity} entity
     * @return {Boolean}
     */
    has: function (entity) {
        return this._entities[entity.id] !== undefined;
    },

    /**
     * Remove all the entities from this list.
     * @public
     */
    clear: function () {
        this.head = this.tail = null;
        this.length = 0;
        this._entities = {};
    },

    /**
     * Return an array holding all the entities in this list.
     * @public
     * @return {Array}
     */
    toArray: function () {
        var array, node;

        array = [];
        for (node = this.head; node; node = node.next) {
            array.push(node.entity);
        }

        return array;
    }
});

});

require.define("/index.js",function(require,module,exports,__dirname,__filename,process,global){module.exports = {
    Class     : require('./src/class'),
    Component : require('./src/component'),
    Entity    : require('./src/entity'),
    System    : require('./src/system'),
    World     : require('./src/world')
};

});
require("/index.js");
return require("/index.js");})();