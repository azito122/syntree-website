/** @namespace */
Syntree = {}; // Single global object, append any other 'globals' to this

/**
 * Data on what properties can be configured onto given object types.
 *
 * @property classname {object} - the data for each class
 * @property classname.accept_unmapped_config {boolean} - whether or not accept configuration properties that are not represented in the config map
 * @property classname.map {object} - an object representing the possible configuration properties, their required types, and the default values to provide if the type check is not passed
 * @type {object}
 * @see Syntree.Lib.config
 */
Syntree.config_maps = {};

Syntree.initialize = function(initial_matrix) {
    /**
     * The snap object tied to our svg workspace.
     *
     * @memberof Syntree
     */
    Syntree.snap = Snap('#workspace');
    Syntree.Workspace.initialize(initial_matrix);
}

/** @class
 * @classdesc What you'd expect -- various utility and cross-class functions.
 */
Syntree.Lib = {
    /**
     * Add properties to a given object, using that object's config_map property to check types and apply defaults.
     *
     * @param {object} matrix - An object of properties to be appended to the target
     * @param {object} target - The object to be 'configured'
     */
    config: function(matrix, target) {
        var targetType = Syntree.Lib.typeOf(target);
        var map = Syntree.config_maps[targetType].map;
        var accept_unmapped_config = Syntree.config_maps[targetType].accept_unmapped_config;

        for (property_name in map) {
            var require = map[property_name].require;
            var default_value = map[property_name].default_value;

            if (!this.checkType(matrix[property_name], require)) {
                if (this.checkType(default_value, 'undefined')) {
                    // If default_value is undefined, we assume that the property is required.
                    throw new Error('You must provide a value for "' + property_name + '"');
                } else {
                    // If default_value is the special string '#undefined', we assume that it should be allowed to remain undefined.
                    // Otherwise, we use the default_value.
                    if (default_value !== '#undefined') {
                        target[property_name] = default_value;
                    }
                }
            } else {
                target[property_name] = matrix[property_name];
            }
        }

        if (typeof accept_unmapped_config === 'boolean' && accept_unmapped_config) {
            for (property_name in matrix) {
                if (typeof map[property_name] === 'undefined') {
                    target[property_name] = matrix[property_name];
                }
            }
        }
    },

    /**
     * Just a function that allows us to focus an element without auto-scrolling to it.
     * Useful if the app is embedded in a larger page.
     *
     * @param {jQuery_Object} elem - A page element to scroll to
     */
    focusNoScroll: function(elem) {
      var x = window.scrollX;
      var y = window.scrollY;
      elem.focus();
      window.scrollTo(x, y);
    },

    /**
     * Keeps track of ids that have been generated.
     * @see Syntree.Lib.genId
     */
    allIds: [],

    /**
     * The upper bound of random number generation for ids.
     * Increases if we get too close.
     *
     * @see Syntree.Lib.genId
     */
    idN: 1000,

    /**
     * Generates a unique id (unique within this session).
     *
     * @see Syntree.Lib.allIds
     * @see Syntree.Lib.idN
     * @returns {number} a session-unique id
     */
    genId: function() {
        if (this.allIds.length === this.idN / 2) {
            this.idN += 1000;
        }
        while (true) {
            var x = Math.floor(Math.random() * this.idN);
            if (this.allIds.indexOf(x) === -1) {
                this.allIds.push(x)
                return x;
            }
        }
    },

    /**
     * Get the type of anything, taking into account all kinds of JS type weirdness.
     * Returns undefined for NaN and null. Returns specific object type if available, 'object' otherwise.
     *
     * @param {} a - any value
     * @returns {string} the type of the passed value
     */
    typeOf: function(a) {
        // Modified from http://stackoverflow.com/questions/13926213/checking-the-types-of-function-arguments-in-javascript
        var type = ({}).toString.call(a).match(/\s(\w+)/)[1].toLowerCase();
        if (type === 'object') {
            var t = a.toString().match(/\s(\w+)/)[1].toLowerCase();
            // If object's toString returns a valid custom type string, return it
            if (a.toString().match(/\[\w+\s\w+\]/)) {
                return t;
            // Otherwise, return the default type string
            } else {
                return type;
            }
        } else if (type === 'number' && a !== a) {
            return 'NaN';
        } else {
            return type;
        }
    },

    /**
     * Check a value against any given type(s).
     *
     * @param {} a - any value
     * @param {string|string[]} required_type - a string representing the required type, or an array of such strings
     * @returns {boolean} whether the passed value matched the required type(s)
     */
    checkType: function(a, require) {
        if (this.typeOf(require) === 'string') {
            return this.typeOf(a) === require;
        } else if (this.typeOf(require) === 'array') {
            var i = 0;
            while (i < require.length) {
                if (this.typeOf(a) === require[i]) {
                    return true;
                }
                i++;
            }
            return false;
        } else if (this.typeOf(require) === 'function') {
            // Call require function in context of passed object, because it is probably a method
            var r = require.call(a);
            if (this.typeOf(r) === 'boolean') {
                return r;
            } else {
                throw new TypeError('The require function must return true or false');
            }
        } else {
            throw new TypeError('Please pass checkType a type string, array of type strings, or a function that returns true/false (for the second argument)');
        }
    },

    /**
     * Ideal for checking argument types. Checks the passed value against the required type,
     * and returns the default value instead if the check doesn't pass.
     * A default value of '#undefined' will permit the type check to fail, and return nothing.
     * Otherwise (if default_value is actually undefined), will throw an error on type check failure.
     *
     * @param {} passed - any value
     * @param {string|string[]|function} require - a string representing the required type, an array of such strings, or a function returning true/false
     * @param {} default_value - any value, to be returned if the type check fails
     */
    checkArg: function(a, require, default_value) {
        if (this.checkType(require, ['string', 'array', 'function'])) {
            if (this.checkType(a, require)) {
                return a;
            } else {
                if (!this.checkType(default_value, 'undefined')) {
                    if (default_value === '#undefined') {
                        return;
                    } else {
                        return default_value;
                    }
                } else {
                    throw new TypeError('Argument is required to be type ' + String(require).replace(',', ' or ') + ', was type ' + this.typeOf(a));
                }
            }
        } else {
            throw new TypeError('Please pass checkArg a type string, array of type strings, or a function that returns true/false (for the second argument)');
        }
    },

    /**
     * Get the distance between two points.
     *
     * @param {number|object} x1_or_obj - either the x coordinate of point 1, or an object representing all four coordinates
     * @param {number} [y1] - the y coordinate of point 1
     * @param {number} [x2] - the x coordinate of point 2
     * @param {number} [y2] - the y coordinate of point 2
     * @returns {number} the distance between the two points
     */
    distance: function(x1_or_obj,y1,x2,y2) {
        if (this.checkType(x1_or_obj, 'object')) {
            x1 = Syntree.Lib.checkArg(x1_or_obj.x1, 'number');
            y1 = Syntree.Lib.checkArg(x1_or_obj.y1, 'number');
            x2 = Syntree.Lib.checkArg(x1_or_obj.x2, 'number');
            y2 = Syntree.Lib.checkArg(x1_or_obj.y2, 'number');
        } else {
            x1 = Syntree.Lib.checkArg(x1_or_obj, 'number');
            y1 = Syntree.Lib.checkArg(y1, 'number');
            x2 = Syntree.Lib.checkArg(x2, 'number');
            y2 = Syntree.Lib.checkArg(y2, 'number');
        }

        return Math.sqrt(Math.pow((x2 - x1),2)+Math.pow((y2 - y1),2));
    },

    /**
     * Capitalize the first letter of a string.
     * Often used for converting types into corresponding constructor function identifiers.
     *
     * @param {string} string - any string
     * @returns {string} the passed string, with the first letter capitalized
     */
    capitalize: function(string) {
        return string[0].toUpperCase() + string.slice(1, string.length);
    },

    /**
     * Get the mid point of a line spanning two points
     *
     * @param {number|object} x1_or_obj - either the x coordinate of point 1, or an object representing all four coordinates
     * @param {number} [y1] - the y coordinate of point 1
     * @param {number} [x2] - the x coordinate of point 2
     * @param {number} [y2] - the y coordinate of point 2
     * @returns {object} - the x/y coordinates of the mid point
     */
    getMidPoint: function(x1_or_obj,y1,x2,y2) {
        if (this.checkType(x1_or_obj, 'object')) {
            x1 = Syntree.Lib.checkArg(x1_or_obj.x1, 'number');
            y1 = Syntree.Lib.checkArg(x1_or_obj.y1, 'number');
            x2 = Syntree.Lib.checkArg(x1_or_obj.x2, 'number');
            y2 = Syntree.Lib.checkArg(x1_or_obj.y2, 'number');
        } else {
            x1 = Syntree.Lib.checkArg(x1_or_obj, 'number');
            y1 = Syntree.Lib.checkArg(y1, 'number');
            x2 = Syntree.Lib.checkArg(x2, 'number');
            y2 = Syntree.Lib.checkArg(y2, 'number');
        }

        return {
            x: (x1 + x2) / 2,
            y: (y1 + y2) / 2,
        }
    },

    /**
     * Take screen/visual coordinates and convert them to data coordinates based on the current transform matrix (from panning).
     * Basically, remove the effects of the transform matrix from the coordinates.
     * We need this because user mouse events give coordinates that include the transform, since that's what the user sees.
     * But we need to set internal coordinates that are based on a non-transformed coordinate field, since the transform matrix is the final layer of presentation, and shouldn't be contained in the lower level of data.
     *
     * @param {number|object} x_or_object - the x coordinate, or an object containing the x and y coordinate
     * @param {number} [y] - the y coordinate
     * @returns {object} - x and y coordinates after accounting for transform matrix
     */
     visualToActualCoordinates: function(x_or_obj,y) {
        if (this.checkType(x_or_obj, 'object')) {
            x = Syntree.Lib.checkArg(x_or_obj.x, 'number');
            y = Syntree.Lib.checkArg(x_or_obj.y, 'number');
        } else {
            x = Syntree.Lib.checkArg(x_or_obj, 'number');
            y = Syntree.Lib.checkArg(y, 'number');
        }

        var t = Syntree.Workspace.page.getTransform();
        x = x - t.dx;
        y = y - t.dy;

        return {
            x: x,
            y: y,
        }
    },

    /**
     * Extend parent class onto sub class, for instance.
     *
     * @param {function} parentConstructor - constructor function for the parent class
     * @param {function} subConstructor - constructor function for the sub class
     * @param {object} instance - the object instance being produced by subConstructor
     */
    extend: function(parentConstructor, subConstructor, instance) {
        subConstructor.prototype.__proto__ = parentConstructor.prototype;
        parentConstructor.call(instance);
    }

}

test_genId = function(n) {
    var gend = [];
    for (i=0; i<=n; i++) {
        var id = Syntree.Lib.genId();
        if (gend.indexOf(id) > -1) {
            console.log('duplicate: ' + id);
        }
        gend.push(id);
    }
    console.log(gend)
}
time_function = function(f,o) {
    var start_time = new Date().getTime();
    o[f]();
    var end_time = new Date().getTime();
    return end_time - start_time;
}

time_make_child = function(id,n) {
    Syntree.Workspace.page.select(Syntree.Workspace.page.allElements[id]);
    var times = [];
    var i = 0;
    while (i < n) {
        console.log('timing');
        times.push(time_function('_eventDown', Syntree.Workspace));
        Syntree.Workspace._eventUp();
        i++;
    }
    var sum = times.reduce(function(a, b) { return a + b; });
    return sum / times.length;
}

time_make_sibling = function(id,n) {
    Syntree.Workspace.page.select(Syntree.Workspace.page.allElements[id]);
    var times = [];
    var i = 0;
    while (i < n) {
        console.log('timing');
        times.push(time_function('_eventLeft', Syntree.Workspace));
        e = {
            ctrlKey: false,
        };
        Syntree.Workspace._eventRight(e);
        i++;
    }
    var sum = times.reduce(function(a, b) { return a + b; });
    return sum / times.length;
}
