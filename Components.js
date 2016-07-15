/**
 * @description	Simple dependency system
 * @author     	Derek Leung
 * @created    	2016-7-13
 * @updated    	2016-7-14
 *
 * @license
 *         DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
 *                   Version 2, December 2004 
 *
 * Copyright (C) 2004 Sam Hocevar <sam@hocevar.net> 
 *
 * Everyone is permitted to copy and distribute verbatim or modified 
 * copies of this license document, and changing it is allowed as long 
 * as the name is changed. 
 *
 *          DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
 *  TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION 
 *
 *  0. You just DO WHAT THE FUCK YOU WANT TO.
 *  
 */

(function(global){

	/**
	 * Parse arguments of a function
	 * @param  {Function} func Input function
	 * @return {Array}      List of argument names
	 *
	 * @license https://stackoverflow.com/questions/1007981 CC BY-SA 3.0
	 */
	function parseArgs(func){
		var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
		var ARGUMENT_NAMES = /([^\s,]+)/g;
		var fnStr = func.toString().replace(STRIP_COMMENTS, '');
		var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
		if(result === null)	result = [];

		return Array.prototype.slice.call(result);
	}

	/**
	 * @class Unique identifier object
	 */
	function UniqueIdentifier(description){
		this.description = description;
	}
	UniqueIdentifier.prototype = Object.create(null);


	/**
	 * @namespace App
	 */
	var app = {
		/** 
		 * Enum for basic statuses.
		 * @readOnly
		 * @type {Object}
		 */
		Enums: {
			COMPONENT_NOT_EXIST: new UniqueIdentifier("Component not exist")
		},

		/** @type {Object} Storage for all components */
		storedComponents: Object.create(null),

		/**
		 * Check if a component's name exist in storage.
		 * @param  {String} name Name to be checked
		 * @return {Boolean}      True if exists
		 */
		checkIfComponentExists: function(name){
			return name in app.storedComponents;
		},

		/**
		 * Register a new component.
		 * @param  {String} name    Name of component
		 * @param  {Function} factory A function that returns an interface
		 * @return {*}         Returned value of factory
		 */
		registerComponent: function(name, factory){
			if(app.checkIfComponentExists(name)){
				throw "Failed to register component. " + name + " already exists.";
			}

			var computedSingleton = app.depends(factory);

			// Store returned component interface
			app.storedComponents[name] = computedSingleton;

			return computedSingleton;
		},

		/**
		 * Get a component.
		 * @param  {String} name Name of component
		 * @return {*}      Component interface, COMPONENT_NOT_EXIST if not exists
		 */
		getComponent: function(name){
			if(!app.checkIfComponentExists(name))	return app.Enums.COMPONENT_NOT_EXIST;
			else                                 	return app.storedComponents[name];
		},

		/**
		 * Injects dependencies to a function.
		 * @param  {Function} routine Function to inject
		 * @return {*}         Returned value of the exectution of the input function
		 */
		depends: function(routine){
			if(!(routine instanceof Function)){
				throw "Failed to inject dependencies into a non-function object.";
			}

			var dependencyList = parseArgs(routine);
			dependencyList.forEach(function(dependencyName, i){
				var dependency = app.getComponent(dependencyName);

				if(dependency === app.Enums.COMPONENT_NOT_EXIST){
					throw "Failed to inject dependency \"" + dependencyName + "\".";
				}else{
					dependencyList[i] = dependency;
				}
			});

			return routine.apply(global, dependencyList);
		}

	};

	/**
	 * Validate inputs for registerAll method.
	 * @param  {Arguments} args Arguemnts list
	 * @return {Boolean}      True if valid
	 */
	function validateRegisterAllSignature(args){
		// checks if length is even
		if(args.length % 2 === 1)	return false;

		// only checks even indices
		for(var i = 0; i < args.length; i += 2){
			if(typeof args[i] !== "string"){
				return false
			}
		}

		return true;
	}

	/**
	 * @module Components
	 */
	var exports = {
		enum: app.Enums,
		register: app.registerComponent,
		depends: app.depends,

		/**
		 * Shortcut for registering multiple components.
		 *
		 * @description
		 * Arguments format: (name, factory), ...
		 * This method is chosen to preserve input order.
		 */
		registerAll: function(){
			if(!validateRegisterAllSignature(arguments)){
				throw "Failed to register all functions. Invalid arguments.";
			}

			for(var i = 0; i < arguments.length; i += 2){
				app.registerComponent(arguments[i], arguments[i + 1]);
			}
		},

		getSingleton: function(name){
			return app.getComponent(name);
		}
	}

	// Keeps enums from being modified
	Object.freeze(exports.enum);
	
	global.Components = exports;

})(this);