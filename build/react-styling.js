(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["react-styling"] = factory();
	else
		root["react-styling"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Object$keys = __webpack_require__(1)['default'];
	
	var _getIterator = __webpack_require__(8)['default'];
	
	var _interopRequireDefault = __webpack_require__(24)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports.is_pseudo_class = is_pseudo_class;
	exports.is_media_query = is_media_query;
	
	var _helpers = __webpack_require__(25);
	
	var _tabulator = __webpack_require__(26);
	
	var _tabulator2 = _interopRequireDefault(_tabulator);
	
	// using ES6 template strings
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/template_strings
	
	exports['default'] = function (strings) {
		var style = '';
	
		// restore the whole string from "strings" and "values" parts
		var i = 0;
		while (i < strings.length) {
			style += strings[i];
			if ((0, _helpers.exists)(arguments[i + 1])) {
				style += arguments[i + 1];
			}
			i++;
		}
	
		return parse_style_json_object(style);
	};
	
	// converts text to JSON object
	function parse_style_json_object(text) {
		// remove multiline comments
		text = text.replace(/\/\*([\s\S]*?)\*\//g, '');
	
		// ignore curly braces for now.
		// maybe support curly braces along with tabulation in future
		text = text.replace(/[\{\}]/g, '');
	
		var lines = text.split('\n');
	
		// helper class for dealing with tabulation
		var tabulator = new _tabulator2['default'](_tabulator2['default'].determine_tabulation(lines));
	
		// parse text into JSON object
		var style_json = parse_style_class(tabulator.extract_tabulation(lines), []);
	
		// expand "modifier" style classes
		return expand_modifier_style_classes(style_json);
	}
	
	// parse child nodes' lines (and this node's styles) into this node's style JSON object
	function parse_node_json(styles, children_lines, node_names) {
		// transform this node's style lines from text to JSON properties and their values
		var style_object = styles.map(function (style) {
			var key = style.substring(0, style.indexOf(':')).trim();
			var value = style.substring(style.indexOf(':') + ':'.length).trim();
	
			// transform dashed key to camelCase key (it's required by React)
			key = key.replace(/([-]{1}[a-z]{1})/g, function (character) {
				return character.substring(1).toUpperCase();
			});
	
			// support old CSS syntax
			value = value.replace(/;$/, '').trim();
	
			// check if the value can be parsed into an integer
			if (String(parseInt(value)) === value) {
				value = parseInt(value);
			}
	
			// check if the value can be parsed into a float
			if (String(parseFloat(value)) === value) {
				value = parseFloat(value);
			}
	
			return { key: key, value: value };
		})
		// combine the styles into a JSON object
		.reduce(function (styles, style) {
			styles[style.key] = style.value;
			return styles;
		}, {});
	
		// parse child nodes and add them to this node's JSON object
		return (0, _helpers.extend)(style_object, parse_children(children_lines, node_names));
	}
	
	// separates style lines from children lines
	function split_into_style_lines_and_children_lines(lines) {
		// get this node style lines
		var style_lines = lines.filter(function (line) {
			// styles always have indentation of 1
			if (line.tabs !== 1) {
				return false;
			}
	
			// detect generic css style line (skip modifier classes and media queries)
			var colon_index = line.line.indexOf(':');
	
			// is not a modifier class
			return !(0, _helpers.starts_with)(line.line, '&')
			// is not a media query style class name declaration
			 && !(0, _helpers.starts_with)(line.line, '@')
			// has a colon
			 && colon_index >= 0
			// is not a state class (e.g. :hover) name declaration
			 && colon_index !== 0
			// is not a yaml-style class name declaration
			 && colon_index < line.line.length - 1;
		});
	
		// get children nodes' lines
		var children_lines = lines.filter(function (line) {
			return style_lines.indexOf(line) < 0;
		});
	
		// reduce tabulation for this child node's (or these child nodes') child nodes' lines
		children_lines.forEach(function (line) {
			return line.tabs--;
		});
	
		return { style_lines: style_lines, children_lines: children_lines };
	}
	
	// parses a style class node name
	function parse_node_name(name) {
		// is it a "modifier" style class
		var is_a_modifier = false;
	
		// detect modifier style classes
		if ((0, _helpers.starts_with)(name, '&')) {
			name = name.substring('&'.length);
			is_a_modifier = true;
		}
	
		// support old-school CSS syntax
		if ((0, _helpers.starts_with)(name, '.')) {
			name = name.substring('.'.length);
		}
	
		// if there is a trailing colon in the style class name - trim it
		// (Python people with yaml-alike syntax)
		if ((0, _helpers.ends_with)(name, ':')) {
			name = name.substring(0, name.length - ':'.length)
			// throw new Error(`Remove the trailing colon at line: ${original_line}`)
			;
		}
	
		return { name: name, is_a_modifier: is_a_modifier };
	}
	
	// parses child nodes' lines of text into the corresponding child node JSON objects
	function parse_children(lines, parent_node_names) {
		// preprocess the lines (filter out comments, blank lines, etc)
		lines = filter_lines_for_parsing(lines);
	
		// return empty object if there are no lines to parse
		if (lines.length === 0) {
			return {};
		}
	
		// parse each child node's lines
		return split_lines_by_child_nodes(lines).map(function (lines) {
			// the first line is this child node's name (or names)
			var declaration_line = lines.shift();
	
			// check for excessive indentation of the first child style class
			if (declaration_line.tabs !== 0) {
				throw new Error('Excessive indentation (' + declaration_line.tabs + ' more "tabs" than needed) at line ' + declaration_line.index + ': "' + declaration_line.original_line + '"');
			}
	
			// style class name declaration
			var declaration = declaration_line.line;
	
			// child nodes' names
			var names = declaration.split(',').map(function (name) {
				return name.trim();
			});
	
			// style class nesting validation
			validate_child_style_class_types(parent_node_names, names);
	
			// parse own CSS styles and recursively parse all child nodes
			var style_json = parse_style_class(lines, names);
	
			// generate style json for this child node (or child nodes)
			return names.map(function (node_declaration) {
				// parse this child node name
	
				var _parse_node_name = parse_node_name(node_declaration);
	
				var name = _parse_node_name.name;
				var is_a_modifier = _parse_node_name.is_a_modifier;
	
				// clone the style JSON object for this child node
				var json = (0, _helpers.extend)({}, style_json);
	
				// set the modifier flag if it's the case
				if (is_a_modifier) {
					json._is_a_modifier = true;
				}
	
				// this child node's style JSON object
				return { name: name, json: json };
			});
		})
		// convert an array of arrays to a flat array
		.reduce(function (array, child_array) {
			return array.concat(child_array);
		}, [])
		// combine all the child nodes into a single JSON object
		.reduce(function (nodes, node) {
			// if style already exists for this child node, extend it
			if (nodes[node.name]) {
				(0, _helpers.extend)(nodes[node.name], node.json);
			} else {
				nodes[node.name] = node.json;
			}
	
			return nodes;
		}, {});
	}
	
	// filters out comments, blank lines, etc
	function filter_lines_for_parsing(lines) {
		// filter out blank lines
		lines = lines.filter(function (line) {
			return !(0, _helpers.is_blank)(line.line);
		});
	
		lines.forEach(function (line) {
			// remove single line comments
			line.line = line.line.replace(/^\s*\/\/.*/, '');
			// remove any trailing whitespace
			line.line = line.line.trim();
		});
	
		return lines;
	}
	
	// takes the whole lines array and splits it by its top-tier child nodes
	function split_lines_by_child_nodes(lines) {
		// determine lines with indentation = 0 (child node entry lines)
		var node_entry_lines = lines.map(function (line, index) {
			return { tabs: line.tabs, index: index };
		}).filter(function (line) {
			return line.tabs === 0;
		}).map(function (line) {
			return line.index;
		});
	
		// deduce corresponding child node ending lines
		var node_ending_lines = node_entry_lines.map(function (line_index) {
			return line_index - 1;
		});
		node_ending_lines.shift();
		node_ending_lines.push(lines.length - 1);
	
		// each child node boundaries in terms of starting line index and ending line index
		var from_to = (0, _helpers.zip)(node_entry_lines, node_ending_lines);
	
		// now lines are split by child nodes
		return from_to.map(function (from_to) {
			return lines.slice(from_to[0], from_to[1] + 1);
		});
	}
	
	// expand modifier style classes
	function expand_modifier_style_classes(node) {
		var style = get_node_style(node);
		var pseudo_classes_and_media_queries = get_node_pseudo_classes_and_media_queries(node);
	
		var modifiers = _Object$keys(node)
		// get all modifier style class nodes
		.filter(function (name) {
			return typeof node[name] === 'object' && node[name]._is_a_modifier;
		});
	
		// for each modifier style class node
		modifiers.forEach(function (name) {
			// // delete the modifier flags
			// delete node[name]._is_a_modifier
	
			// include parent node's styles and pseudo-classes into the modifier style class node
			node[name] = (0, _helpers.extend)({}, style, pseudo_classes_and_media_queries, node[name]);
	
			// expand descendant style class nodes of this modifier
			expand_modified_subtree(node, node[name]);
		});
	
		// for each modifier style class node
		modifiers.forEach(function (name) {
			// delete the modifier flags
			delete node[name]._is_a_modifier;
		});
	
		// recurse
		_Object$keys(node)
		// get all style class nodes
		.filter(function (name) {
			return typeof node[name] === 'object';
		})
		// for each style class node
		.forEach(function (name) {
			// recurse
			expand_modifier_style_classes(node[name]);
		});
	
		return node;
	}
	
	// extracts root css styles of this style class node
	function get_node_style(node) {
		return _Object$keys(node)
		// get all CSS styles of this style class node
		.filter(function (property) {
			return typeof node[property] !== 'object';
		})
		// for each CSS style of this style class node
		.reduce(function (style, style_property) {
			style[style_property] = node[style_property];
			return style;
		}, {});
	}
	
	// extracts root pseudo-classes and media queries of this style class node
	function get_node_pseudo_classes_and_media_queries(node) {
		return _Object$keys(node)
		// get all child style classes this style class node,
		// which aren't modifiers and are a pseudoclass or a media query
		.filter(function (property) {
			return typeof node[property] === 'object' && (is_pseudo_class(property) || is_media_query(property)) && !node[property]._is_a_modifier;
		})
		// for each child style class of this style class node
		.reduce(function (pseudo_classes_and_media_queries, name) {
			pseudo_classes_and_media_queries[name] = node[name];
			return pseudo_classes_and_media_queries;
		}, {});
	}
	
	// for each (non-modifier) child style class of the modifier style class,
	// check if "this child style class" is also present
	// as a (non-modifier) "child of the current style class".
	// if it is, then extend "this child style class" with the style
	// from the "child of the current style class".
	// (and repeat recursively)
	function expand_modified_subtree(node, modified_node) {
		// from the modified style class node
		_Object$keys(modified_node)
		// for all non-pseudo-classes and non-media-queries
		.filter(function (name) {
			return !is_pseudo_class(name) && !is_media_query(name);
		})
		// get all non-modifier style class nodes
		.filter(function (name) {
			return typeof modified_node[name] === 'object' && !modified_node[name]._is_a_modifier;
		})
		// which are also present as non-modifier style classes
		// in the base style class node
		.filter(function (name) {
			return typeof node[name] === 'object' && !node[name]._is_a_modifier;
		})
	
		// for each such style class node
		.forEach(function (name) {
			// style of the original style class node
			var style = get_node_style(node[name]);
	
			// pseudo-classes of the original style class node
			var pseudo_classes_and_media_queries = get_node_pseudo_classes_and_media_queries(node[name]);
	
			// mix in the styles
			modified_node[name] = (0, _helpers.extend)({}, style, pseudo_classes_and_media_queries, modified_node[name]);
	
			// recurse
			return expand_modified_subtree(node[name], modified_node[name]);
		});
	}
	
	// checks if this style class name designates a pseudo-class
	
	function is_pseudo_class(name) {
		return (0, _helpers.starts_with)(name, ':');
	}
	
	// checks if this style class name is a media query (i.e. @media (...))
	
	function is_media_query(name) {
		return (0, _helpers.starts_with)(name, '@');
	}
	
	// style class nesting validation
	function validate_child_style_class_types(parent_node_names, names) {
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;
	
		try {
			for (var _iterator = _getIterator(parent_node_names), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var _parent = _step.value;
	
				// if it's a pseudoclass, it can't contain any style classes
				if (is_pseudo_class(_parent) && (0, _helpers.not_empty)(names)) {
					throw new Error('A style class declaration "' + names[0] + '" found inside a pseudoclass "' + _parent + '". Pseudoclasses (:hover, etc) can\'t contain child style classes.');
				}
	
				// if it's a media query style class, it must contain only pseudoclasses
				if (is_media_query(_parent)) {
					var non_pseudoclass = names.filter(function (x) {
						return !is_pseudo_class(x);
					})[0];
	
					if (non_pseudoclass) {
						throw new Error('A non-pseudoclass "' + non_pseudoclass + '" found inside a media query style class "' + _parent + '". Media query style classes can only contain pseudoclasses (:hover, etc).');
					}
				}
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator['return']) {
					_iterator['return']();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	}
	
	// parse CSS style class
	function parse_style_class(lines, node_names) {
		// separate style lines from children lines
	
		var _split_into_style_lines_and_children_lines = split_into_style_lines_and_children_lines(lines);
	
		var style_lines = _split_into_style_lines_and_children_lines.style_lines;
		var children_lines = _split_into_style_lines_and_children_lines.children_lines;
	
		// convert style lines info to just text lines
		var styles = style_lines.map(function (line) {
			return line.line;
		});
	
		// using this child node's (or these child nodes') style lines
		// and this child node's (or these child nodes') child nodes' lines,
		// generate this child node's (or these child nodes') style JSON object
		// (this is gonna be a recursion)
		return parse_node_json(styles, children_lines, node_names);
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(2), __esModule: true };

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	module.exports = __webpack_require__(4).core.Object.keys;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var $        = __webpack_require__(4)
	  , $def     = __webpack_require__(6)
	  , isObject = $.isObject
	  , toObject = $.toObject;
	$.each.call(('freeze,seal,preventExtensions,isFrozen,isSealed,isExtensible,' +
	  'getOwnPropertyDescriptor,getPrototypeOf,keys,getOwnPropertyNames').split(',')
	, function(KEY, ID){
	  var fn     = ($.core.Object || {})[KEY] || Object[KEY]
	    , forced = 0
	    , method = {};
	  method[KEY] = ID == 0 ? function freeze(it){
	    return isObject(it) ? fn(it) : it;
	  } : ID == 1 ? function seal(it){
	    return isObject(it) ? fn(it) : it;
	  } : ID == 2 ? function preventExtensions(it){
	    return isObject(it) ? fn(it) : it;
	  } : ID == 3 ? function isFrozen(it){
	    return isObject(it) ? fn(it) : true;
	  } : ID == 4 ? function isSealed(it){
	    return isObject(it) ? fn(it) : true;
	  } : ID == 5 ? function isExtensible(it){
	    return isObject(it) ? fn(it) : false;
	  } : ID == 6 ? function getOwnPropertyDescriptor(it, key){
	    return fn(toObject(it), key);
	  } : ID == 7 ? function getPrototypeOf(it){
	    return fn(Object($.assertDefined(it)));
	  } : ID == 8 ? function keys(it){
	    return fn(toObject(it));
	  } : __webpack_require__(7).get;
	  try {
	    fn('z');
	  } catch(e){
	    forced = 1;
	  }
	  $def($def.S + $def.F * forced, 'Object', method);
	});

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var global = typeof self != 'undefined' ? self : Function('return this')()
	  , core   = {}
	  , defineProperty = Object.defineProperty
	  , hasOwnProperty = {}.hasOwnProperty
	  , ceil  = Math.ceil
	  , floor = Math.floor
	  , max   = Math.max
	  , min   = Math.min;
	// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
	var DESC = !!function(){
	  try {
	    return defineProperty({}, 'a', {get: function(){ return 2; }}).a == 2;
	  } catch(e){ /* empty */ }
	}();
	var hide = createDefiner(1);
	// 7.1.4 ToInteger
	function toInteger(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	}
	function desc(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	}
	function simpleSet(object, key, value){
	  object[key] = value;
	  return object;
	}
	function createDefiner(bitmap){
	  return DESC ? function(object, key, value){
	    return $.setDesc(object, key, desc(bitmap, value));
	  } : simpleSet;
	}
	
	function isObject(it){
	  return it !== null && (typeof it == 'object' || typeof it == 'function');
	}
	function isFunction(it){
	  return typeof it == 'function';
	}
	function assertDefined(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	}
	
	var $ = module.exports = __webpack_require__(5)({
	  g: global,
	  core: core,
	  html: global.document && document.documentElement,
	  // http://jsperf.com/core-js-isobject
	  isObject:   isObject,
	  isFunction: isFunction,
	  that: function(){
	    return this;
	  },
	  // 7.1.4 ToInteger
	  toInteger: toInteger,
	  // 7.1.15 ToLength
	  toLength: function(it){
	    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	  },
	  toIndex: function(index, length){
	    index = toInteger(index);
	    return index < 0 ? max(index + length, 0) : min(index, length);
	  },
	  has: function(it, key){
	    return hasOwnProperty.call(it, key);
	  },
	  create:     Object.create,
	  getProto:   Object.getPrototypeOf,
	  DESC:       DESC,
	  desc:       desc,
	  getDesc:    Object.getOwnPropertyDescriptor,
	  setDesc:    defineProperty,
	  setDescs:   Object.defineProperties,
	  getKeys:    Object.keys,
	  getNames:   Object.getOwnPropertyNames,
	  getSymbols: Object.getOwnPropertySymbols,
	  assertDefined: assertDefined,
	  // Dummy, fix for not array-like ES3 string in es5 module
	  ES5Object: Object,
	  toObject: function(it){
	    return $.ES5Object(assertDefined(it));
	  },
	  hide: hide,
	  def: createDefiner(0),
	  set: global.Symbol ? simpleSet : hide,
	  each: [].forEach
	});
	/* eslint-disable no-undef */
	if(typeof __e != 'undefined')__e = core;
	if(typeof __g != 'undefined')__g = global;

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = function($){
	  $.FW   = false;
	  $.path = $.core;
	  return $;
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var $          = __webpack_require__(4)
	  , global     = $.g
	  , core       = $.core
	  , isFunction = $.isFunction;
	function ctx(fn, that){
	  return function(){
	    return fn.apply(that, arguments);
	  };
	}
	// type bitmap
	$def.F = 1;  // forced
	$def.G = 2;  // global
	$def.S = 4;  // static
	$def.P = 8;  // proto
	$def.B = 16; // bind
	$def.W = 32; // wrap
	function $def(type, name, source){
	  var key, own, out, exp
	    , isGlobal = type & $def.G
	    , isProto  = type & $def.P
	    , target   = isGlobal ? global : type & $def.S
	        ? global[name] : (global[name] || {}).prototype
	    , exports  = isGlobal ? core : core[name] || (core[name] = {});
	  if(isGlobal)source = name;
	  for(key in source){
	    // contains in native
	    own = !(type & $def.F) && target && key in target;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    if(isGlobal && !isFunction(target[key]))exp = source[key];
	    // bind timers to global for call from export context
	    else if(type & $def.B && own)exp = ctx(out, global);
	    // wrap global constructors for prevent change them in library
	    else if(type & $def.W && target[key] == out)!function(C){
	      exp = function(param){
	        return this instanceof C ? new C(param) : C(param);
	      };
	      exp.prototype = C.prototype;
	    }(out);
	    else exp = isProto && isFunction(out) ? ctx(Function.call, out) : out;
	    // export
	    exports[key] = exp;
	    if(isProto)(exports.prototype || (exports.prototype = {}))[key] = out;
	  }
	}
	module.exports = $def;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var $ = __webpack_require__(4)
	  , toString = {}.toString
	  , getNames = $.getNames;
	
	var windowNames = typeof window == 'object' && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];
	
	function getWindowNames(it){
	  try {
	    return getNames(it);
	  } catch(e){
	    return windowNames.slice();
	  }
	}
	
	module.exports.get = function getOwnPropertyNames(it){
	  if(windowNames && toString.call(it) == '[object Window]')return getWindowNames(it);
	  return getNames($.toObject(it));
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(9), __esModule: true };

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(10);
	__webpack_require__(21);
	__webpack_require__(23);
	module.exports = __webpack_require__(4).core.getIterator;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(11);
	var $           = __webpack_require__(4)
	  , Iterators   = __webpack_require__(14).Iterators
	  , ITERATOR    = __webpack_require__(16)('iterator')
	  , ArrayValues = Iterators.Array
	  , NL          = $.g.NodeList
	  , HTC         = $.g.HTMLCollection
	  , NLProto     = NL && NL.prototype
	  , HTCProto    = HTC && HTC.prototype;
	if($.FW){
	  if(NL && !(ITERATOR in NLProto))$.hide(NLProto, ITERATOR, ArrayValues);
	  if(HTC && !(ITERATOR in HTCProto))$.hide(HTCProto, ITERATOR, ArrayValues);
	}
	Iterators.NodeList = Iterators.HTMLCollection = ArrayValues;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var $          = __webpack_require__(4)
	  , setUnscope = __webpack_require__(12)
	  , ITER       = __webpack_require__(13).safe('iter')
	  , $iter      = __webpack_require__(14)
	  , step       = $iter.step
	  , Iterators  = $iter.Iterators;
	
	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	__webpack_require__(19)(Array, 'Array', function(iterated, kind){
	  $.set(this, ITER, {o: $.toObject(iterated), i: 0, k: kind});
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var iter  = this[ITER]
	    , O     = iter.o
	    , kind  = iter.k
	    , index = iter.i++;
	  if(!O || index >= O.length){
	    iter.o = undefined;
	    return step(1);
	  }
	  if(kind == 'keys'  )return step(0, index);
	  if(kind == 'values')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');
	
	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;
	
	setUnscope('keys');
	setUnscope('values');
	setUnscope('entries');

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var sid = 0;
	function uid(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++sid + Math.random()).toString(36));
	}
	uid.safe = __webpack_require__(4).g.Symbol || uid;
	module.exports = uid;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $                 = __webpack_require__(4)
	  , cof               = __webpack_require__(15)
	  , classof           = cof.classof
	  , assert            = __webpack_require__(18)
	  , assertObject      = assert.obj
	  , SYMBOL_ITERATOR   = __webpack_require__(16)('iterator')
	  , FF_ITERATOR       = '@@iterator'
	  , Iterators         = __webpack_require__(17)('iterators')
	  , IteratorPrototype = {};
	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	setIterator(IteratorPrototype, $.that);
	function setIterator(O, value){
	  $.hide(O, SYMBOL_ITERATOR, value);
	  // Add iterator for FF iterator protocol
	  if(FF_ITERATOR in [])$.hide(O, FF_ITERATOR, value);
	}
	
	module.exports = {
	  // Safari has buggy iterators w/o `next`
	  BUGGY: 'keys' in [] && !('next' in [].keys()),
	  Iterators: Iterators,
	  step: function(done, value){
	    return {value: value, done: !!done};
	  },
	  is: function(it){
	    var O      = Object(it)
	      , Symbol = $.g.Symbol;
	    return (Symbol && Symbol.iterator || FF_ITERATOR) in O
	      || SYMBOL_ITERATOR in O
	      || $.has(Iterators, classof(O));
	  },
	  get: function(it){
	    var Symbol = $.g.Symbol
	      , getIter;
	    if(it != undefined){
	      getIter = it[Symbol && Symbol.iterator || FF_ITERATOR]
	        || it[SYMBOL_ITERATOR]
	        || Iterators[classof(it)];
	    }
	    assert($.isFunction(getIter), it, ' is not iterable!');
	    return assertObject(getIter.call(it));
	  },
	  set: setIterator,
	  create: function(Constructor, NAME, next, proto){
	    Constructor.prototype = $.create(proto || IteratorPrototype, {next: $.desc(1, next)});
	    cof.set(Constructor, NAME + ' Iterator');
	  }
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var $        = __webpack_require__(4)
	  , TAG      = __webpack_require__(16)('toStringTag')
	  , toString = {}.toString;
	function cof(it){
	  return toString.call(it).slice(8, -1);
	}
	cof.classof = function(it){
	  var O, T;
	  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
	    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T : cof(O);
	};
	cof.set = function(it, tag, stat){
	  if(it && !$.has(it = stat ? it : it.prototype, TAG))$.hide(it, TAG, tag);
	};
	module.exports = cof;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(4).g
	  , store  = __webpack_require__(17)('wks');
	module.exports = function(name){
	  return store[name] || (store[name] =
	    global.Symbol && global.Symbol[name] || __webpack_require__(13).safe('Symbol.' + name));
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var $      = __webpack_require__(4)
	  , SHARED = '__core-js_shared__'
	  , store  = $.g[SHARED] || ($.g[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(4);
	function assert(condition, msg1, msg2){
	  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
	}
	assert.def = $.assertDefined;
	assert.fn = function(it){
	  if(!$.isFunction(it))throw TypeError(it + ' is not a function!');
	  return it;
	};
	assert.obj = function(it){
	  if(!$.isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};
	assert.inst = function(it, Constructor, name){
	  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
	  return it;
	};
	module.exports = assert;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var $def            = __webpack_require__(6)
	  , $redef          = __webpack_require__(20)
	  , $               = __webpack_require__(4)
	  , cof             = __webpack_require__(15)
	  , $iter           = __webpack_require__(14)
	  , SYMBOL_ITERATOR = __webpack_require__(16)('iterator')
	  , FF_ITERATOR     = '@@iterator'
	  , KEYS            = 'keys'
	  , VALUES          = 'values'
	  , Iterators       = $iter.Iterators;
	module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
	  $iter.create(Constructor, NAME, next);
	  function createMethod(kind){
	    function $$(that){
	      return new Constructor(that, kind);
	    }
	    switch(kind){
	      case KEYS: return function keys(){ return $$(this); };
	      case VALUES: return function values(){ return $$(this); };
	    } return function entries(){ return $$(this); };
	  }
	  var TAG      = NAME + ' Iterator'
	    , proto    = Base.prototype
	    , _native  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , _default = _native || createMethod(DEFAULT)
	    , methods, key;
	  // Fix native
	  if(_native){
	    var IteratorPrototype = $.getProto(_default.call(new Base));
	    // Set @@toStringTag to native iterators
	    cof.set(IteratorPrototype, TAG, true);
	    // FF fix
	    if($.FW && $.has(proto, FF_ITERATOR))$iter.set(IteratorPrototype, $.that);
	  }
	  // Define iterator
	  if($.FW || FORCE)$iter.set(proto, _default);
	  // Plug for library
	  Iterators[NAME] = _default;
	  Iterators[TAG]  = $.that;
	  if(DEFAULT){
	    methods = {
	      keys:    IS_SET            ? _default : createMethod(KEYS),
	      values:  DEFAULT == VALUES ? _default : createMethod(VALUES),
	      entries: DEFAULT != VALUES ? _default : createMethod('entries')
	    };
	    if(FORCE)for(key in methods){
	      if(!(key in proto))$redef(proto, key, methods[key]);
	    } else $def($def.P + $def.F * $iter.BUGGY, NAME, methods);
	  }
	};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(4).hide;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var set   = __webpack_require__(4).set
	  , $at   = __webpack_require__(22)(true)
	  , ITER  = __webpack_require__(13).safe('iter')
	  , $iter = __webpack_require__(14)
	  , step  = $iter.step;
	
	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(19)(String, 'String', function(iterated){
	  set(this, ITER, {o: String(iterated), i: 0});
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var iter  = this[ITER]
	    , O     = iter.o
	    , index = iter.i
	    , point;
	  if(index >= O.length)return step(1);
	  point = $at(O, index);
	  iter.i += point.length;
	  return step(0, point);
	});

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	// true  -> String#at
	// false -> String#codePointAt
	var $ = __webpack_require__(4);
	module.exports = function(TO_STRING){
	  return function(that, pos){
	    var s = String($.assertDefined(that))
	      , i = $.toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l
	      || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	        ? TO_STRING ? s.charAt(i) : a
	        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var core  = __webpack_require__(4).core
	  , $iter = __webpack_require__(14);
	core.isIterable  = $iter.is;
	core.getIterator = $iter.get;

/***/ },
/* 24 */
/***/ function(module, exports) {

	"use strict";
	
	exports["default"] = function (obj) {
	  return obj && obj.__esModule ? obj : {
	    "default": obj
	  };
	};
	
	exports.__esModule = true;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	// // if the variable is defined
	'use strict';
	
	var _getIterator = __webpack_require__(8)['default'];
	
	var _Object$keys = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports.is_object = is_object;
	exports.extend = extend;
	exports.merge = merge;
	exports.clone = clone;
	exports.convert_from_camel_case = convert_from_camel_case;
	exports.replace_all = replace_all;
	exports.starts_with = starts_with;
	exports.ends_with = ends_with;
	exports.is_empty = is_empty;
	exports.not_empty = not_empty;
	exports.repeat = repeat;
	exports.is_blank = is_blank;
	exports.zip = zip;
	var exists = function exists(what) {
		return typeof what !== 'undefined';
	};
	
	exports.exists = exists;
	// used for JSON object type checking
	var object_constructor = ({}).constructor;
	
	// detects a JSON object
	
	function is_object(object) {
		return exists(object) && object !== null && object.constructor === object_constructor;
	}
	
	// extends the first object with
	/* istanbul ignore next: some weird transpiled code, not testable */
	
	function extend() {
		var _this = this,
		    _arguments = arguments;
	
		var _again = true;
	
		_function: while (_again) {
			_len = objects = _key = to = from = last = intermediary_result = _iteratorNormalCompletion = _didIteratorError = _iteratorError = undefined;
			_again = false;
	
			for (var _len = _arguments.length, objects = Array(_len), _key = 0; _key < _len; _key++) {
				objects[_key] = _arguments[_key];
			}
	
			var to = objects[0];
			var from = objects[1];
	
			if (objects.length > 2) {
				var last = objects.pop();
				var intermediary_result = extend.apply(_this, objects);
				_this = undefined;
				_arguments = [intermediary_result, last];
				_again = true;
				continue _function;
			}
	
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;
	
			try {
				for (var _iterator = _getIterator(_Object$keys(from)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var key = _step.value;
	
					if (is_object(from[key])) {
						if (!is_object(to[key])) {
							to[key] = {};
						}
	
						extend(to[key], from[key]);
					} else {
						to[key] = from[key];
					}
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator['return']) {
						_iterator['return']();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
	
			return to;
		}
	}
	
	function merge() {
		var parameters = Array.prototype.slice.call(arguments, 0);
		parameters.unshift({});
		return extend.apply(this, parameters);
	}
	
	function clone(object) {
		return merge({}, object);
	}
	
	// creates camelCased aliases for all the keys of an object
	
	function convert_from_camel_case(object) {
		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;
	
		try {
			for (var _iterator2 = _getIterator(_Object$keys(object)), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var key = _step2.value;
	
				if (/[A-Z]/.test(key))
					// if (key.indexOf('_') >= 0)
					{
						// const camel_cased_key = key.replace(/_(.)/g, function(match, group_1)
						// {
						// 	return group_1.toUpperCase()
						// })
	
						// if (!exists(object[camel_cased_key]))
						// {
						// 	object[camel_cased_key] = object[key]
						// 	delete object[key]
						// }
	
						var lo_dashed_key = key.replace(/([A-Z])/g, function (match, group_1) {
							return '_' + group_1.toLowerCase();
						});
	
						if (!exists(object[lo_dashed_key])) {
							object[lo_dashed_key] = object[key];
							delete object[key];
						}
					}
			}
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2['return']) {
					_iterator2['return']();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}
	
		return object;
	}
	
	function escape_regexp(string) {
		var specials = new RegExp('[.*+?|()\\[\\]{}\\\\]', 'g');
		return string.replace(specials, '\\$&');
	}
	
	function replace_all(where, what, with_what) {
		var regexp = new RegExp(escape_regexp(what), 'g');
		return where.replace(regexp, with_what);
	}
	
	function starts_with(string, substring) {
		return string.indexOf(substring) === 0;
	}
	
	function ends_with(string, substring) {
		var index = string.lastIndexOf(substring);
		return index >= 0 && index === string.length - substring.length;
	}
	
	function is_empty(array) {
		return array.length === 0;
	}
	
	function not_empty(array) {
		return array.length > 0;
	}
	
	// repeat string N times
	
	function repeat(what, times) {
		var result = '';
		while (times > 0) {
			result += what;
			times--;
		}
		return result;
	}
	
	// if the text is blank
	
	function is_blank(text) {
		return !exists(text) || !text.replace(/\s/g, '');
	}
	
	// zips two arrays
	
	function zip(a, b) {
		return a.map(function (_, index) {
			return [a[index], b[index]];
		});
	}

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = __webpack_require__(27)['default'];
	
	var _classCallCheck = __webpack_require__(30)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _helpers = __webpack_require__(25);
	
	// tabulation utilities
	
	var Tabulator = (function () {
		function Tabulator(tab) {
			_classCallCheck(this, Tabulator);
	
			this.tab = tab;
		}
	
		_createClass(Tabulator, [{
			key: 'reduce_indentation',
	
			// remove some tabs in the beginning
			value: function reduce_indentation(line, how_much) {
				return line.substring(this.tab.symbol.length * how_much);
			}
		}, {
			key: 'calculate_indentation',
	
			// how many "tabs" are there before content of this line
			value: function calculate_indentation(line) {
				var matches = line.match(this.tab.regexp);
	
				if (!matches || matches[0] === '') {
					return 0;
				}
	
				return matches[0].length / this.tab.symbol.length;
			}
		}, {
			key: 'extract_tabulation',
			value: function extract_tabulation(lines) {
				var _this = this;
	
				lines = lines
				// preserve line indexes
				.map(function (line, index) {
					index++;
					return { line: line, index: index };
				})
				// filter out blank lines
				.filter(function (line) {
					return !(0, _helpers.is_blank)(line.line);
				});
	
				// calculate each line's indentation
				lines.forEach(function (line) {
					var tabs = _this.calculate_indentation(line.line);
					var pure_line = _this.reduce_indentation(line.line, tabs);
	
					// check for messed up space indentation
					if ((0, _helpers.starts_with)(pure_line, ' ')) {
						var reason = undefined;
						if (_this.tab.symbol === '\t') {
							reason = 'mixed tabs and spaces';
						} else {
							reason = 'extra leading spaces';
						}
	
						throw new Error('Invalid indentation (' + reason + ') at line ' + line.index + ': "' + _this.reveal_whitespace(line.line) + '"');
					}
	
					// check for tabs in spaced intentation
					if ((0, _helpers.starts_with)(pure_line, '\t')) {
						throw new Error('Invalid indentation (mixed tabs and spaces) at line ' + line.index + ': "' + _this.reveal_whitespace(line.line) + '"');
					}
	
					line.tabs = tabs;
					line.original_line = line.line;
					line.line = pure_line;
				});
	
				// get the minimum indentation level
				var minimum_indentation = lines.reduce(function (minimum, line) {
					return Math.min(minimum, line.tabs);
				}, Infinity);
	
				// if there is initial tabulation missing - add it
				if (minimum_indentation === 0) {
					lines.forEach(function (line) {
						line.tabs++;
					});
				}
				// if there is excessive tabulation - trim it
				else if (minimum_indentation > 1) {
					lines.forEach(function (line) {
						line.tabs -= minimum_indentation - 1;
					});
				}
	
				// check for messed up tabulation
				if (lines.length > 0 && lines[0].tabs !== 1) {
					throw new Error('Invalid indentation at line ' + lines[0].index + ': "' + lines[0].original_line + '"');
				}
	
				return lines;
			}
		}, {
			key: 'reveal_whitespace',
			value: function reveal_whitespace(text) {
				var whitespace_count = text.length - text.replace(/^\s*/, '').length;
	
				var whitespace = text.substring(0, whitespace_count + 1).replace(this.tab.regexp_anywhere, '[indent]').replace(/ /g, '[space]').replace(/\t/g, '[tab]');
	
				var rest = text.substring(whitespace_count + 1);
	
				return whitespace + rest;
			}
		}]);
	
		return Tabulator;
	})();
	
	exports['default'] = Tabulator;
	
	// decide whether it's tabs or spaces
	Tabulator.determine_tabulation = function (lines) {
		var substract = function substract(pair) {
			return pair[0] - pair[1];
		};
	
		function is_tabulated(line) {
			// if we're using tabs for tabulation
			if ((0, _helpers.starts_with)(line, '\t')) {
				var _tab = {
					symbol: '\t',
					regexp: new RegExp('^(\t)+', 'g'),
					regexp_anywhere: new RegExp('(\t)+', 'g')
				};
	
				return _tab;
			}
		}
	
		function spaced_tab(tab_width) {
			var symbol = (0, _helpers.repeat)(' ', tab_width);
	
			var spaced_tab = {
				symbol: symbol,
				regexp: new RegExp('^(' + symbol + ')+', 'g'),
				regexp_anywhere: new RegExp('(' + symbol + ')+', 'g')
			};
	
			return spaced_tab;
		}
	
		function calculate_leading_spaces(line) {
			var counter = 0;
			line.replace(/^( )+/g, function (match) {
				counter = match.length;
			});
			return counter;
		}
	
		// take all meaningful lines
		lines = lines.filter(function (line) {
			return !(0, _helpers.is_blank)(line);
		});
	
		// has to be at least two of them
		if (lines.length === 0) {
			return tab
			// throw new Error(`Couldn't decide on tabulation type. Not enough lines.`)
			;
		}
	
		if (lines.length === 1) {
			var _tab2 = is_tabulated(lines[0]);
			if (_tab2) {
				return _tab2;
			}
	
			return spaced_tab(calculate_leading_spaces(lines[0]));
		}
	
		// if we're using tabs for tabulation
		var tab = is_tabulated(lines[1]);
		if (tab) {
			return tab;
		}
	
		// take the first two lines,
		// calculate their indentation,
		// substract it and you've got the tab width
		var tab_width = Math.abs(substract(lines.slice(0, 2).map(calculate_leading_spaces))) || 1;
	
		// if (tab_width === 0)
		// {
		// 	throw new Error(`Couldn't decide on tabulation type. Same indentation.`)
		// }
	
		return spaced_tab(tab_width);
	};
	module.exports = exports['default'];

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _Object$defineProperty = __webpack_require__(28)["default"];
	
	exports["default"] = (function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	
	      _Object$defineProperty(target, descriptor.key, descriptor);
	    }
	  }
	
	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	})();
	
	exports.__esModule = true;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(29), __esModule: true };

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(4);
	module.exports = function defineProperty(it, key, desc){
	  return $.setDesc(it, key, desc);
	};

/***/ },
/* 30 */
/***/ function(module, exports) {

	"use strict";
	
	exports["default"] = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};
	
	exports.__esModule = true;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=react-styling.js.map