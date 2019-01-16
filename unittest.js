var errors = {}

function ExpectClass(keyPath, parent, parentPath) {
	var exFunc = this
	if (keyPath) {
		this.variable = keyPath.split('.').reduce((previous, current) => {
	    	return previous[current];
		}, parent);

		if (parentPath) {
			this.keyPath = parentPath + "." + keyPath
		} else {
			this.keyPath = keyPath
		}
	} else {
		this.variable = parent
		this.keyPath = parentPath ? parentPath : ""
	}

	var variable = this.variable

	this.hasCurrentError = function() {
		return errors.hasOwnProperty(exFunc.keyPath)
	}

	this.putError = function(text) {
		errors[exFunc.keyPath] = text
	}

	this.toBeNotNull = function() {
		if (!exFunc.hasCurrentError()) {
			var isNull = typeof variable === 'undefined' || variable === null
			if (isNull) {
				exFunc.putError("is not defined.")
			}
		}
		return exFunc		
	}
	
	this.toBeString = function() {
		exFunc.toBeNotNull()
		if (!exFunc.hasCurrentError()) {
			var isString = typeof variable === 'string' || variable instanceof String
			if (!isString) {
				exFunc.putError("is not a String")
			}
		}
		return exFunc
	}

	this.toBeBoolean = function() {
		exFunc.toBeNotNull()
		if (!exFunc.hasCurrentError()) {
			var isBoolean = typeof variable === 'boolean'
			if (!isBoolean) {
				exFunc.putError("is not a boolean")
			}
		}
		return exFunc
	}

	this.toBeFunction = function() {
		exFunc.toBeNotNull()
		if (!exFunc.hasCurrentError()) {
			var isFunction = typeof variable === 'function'
			if (!isFunction) {
				exFunc.putError("is not a function")
			}
		}
		return exFunc
	}

	this.toBeNumber = function() {
		exFunc.toBeNotNull()
		if (!exFunc.hasCurrentError()) {
			var isNumber = typeof variable === 'number' && isFinite(variable)
			if (!isNumber) {
				exFunc.putError("is not a number")
			}
		}
		return exFunc
	}

	this.toBeObject = function() {
		exFunc.toBeNotNull()
		if (!exFunc.hasCurrentError()) {
			var isObject = typeof variable === 'object'
			if (!isObject) {
				exFunc.putError("is not a number")
			}
		}
		return exFunc
	}

	this.toBeArray = function() {
		exFunc.toBeNotNull()
		if (!exFunc.hasCurrentError()) {
			if (!Array.isArray(variable)) {
				exFunc.putError("is not a number")
			}
		}
		return exFunc
	}

	this.children = function(childCallback) {
		exFunc.toBeObject()
		if (!exFunc.hasCurrentError()) {
			childCallback(variable, exFunc.keyPath)
		}
		return exFunc
	}

}

function union(args, callback) {
	var hasError = false
	for(var i = 0; i < args.length; i++) {
		if (args[i].hasCurrentError()) {
			return
		}
	}
	callback.apply(null, args.map(function(v) { return v.variable } ))
}

Object.defineProperty(Object.prototype, 'expect',{
  value: function(key, parentPath){
		return new ExpectClass(key, this, parentPath)
  },
  writable: true,
  configurable: true,
  enumerable: false
});

Object.defineProperty(Object.prototype, 'expectArray',{
  value: function(key, parentPath, checkElement){
  		return (new ExpectClass(key, this, parentPath)).toBeArray().children(function(a, path) {
  			for (var i = 0; i < a.length; i++) {
  				checkElement(a[i], [path,'[', i, ']'].join(''))
  			}
  		})
  },
  writable: true,
  configurable: true,
  enumerable: false
});

function performUnitTests() {
	errors = {}
	var characteristicsError = expect("characteristics").children(function(c, path) {
	    c.expect("supportsOnOff", path).toBeBoolean()
	    c.expect("supportsTemperature", path).toBeBoolean()
	    c.expect("supportsFanSpeed", path).toBeBoolean()
	    c.expect("fanSpeedUnit", path).toBeString()
	    c.expect("unit", path).toBeString()
	    c.expect("decimals", path).toBeNumber()		
	})

 	expectArray("fields", null, function(e, path) {
 		var eItem = e.expect("item", path).toBeObject()
 		union([e.expect("type", path).toBeString(), eItem], 
   			function(type, item) {
   				switch (type) {
   					case 'textInput':
   						item.expect("key", eItem.keyPath).toBeString()
   						item.expect("isSecure", eItem.keyPath).toBeBoolean()
   						item.expect("localizedPlaceholder", eItem.keyPath).toBeString()
   						item.expect("defaultValue", eItem.keyPath).toBeString()
   						break;
   					case 'switch':
   						item.expect("key", eItem.keyPath).toBeString()
   						item.expect("title", eItem.keyPath).toBeString()
   						item.expect("defaultValue", eItem.keyPath).toBeBoolean()
   						break;
   					case 'choice':
   						item.expect("key", eItem.keyPath).toBeString()
   						item.expect("title", eItem.keyPath).toBeString()
   						item.expectArray("options", eItem.keyPath, function(o, op) {
   							o.expect(null, op).toBeString()
   						})
   						item.expect("defaultValue", eItem.keyPath).toBeNumber()
   						break;   						
   				}
   			})
 	})
	expect("initContext").toBeFunction()
	expect("getCurrentStatus").toBeFunction()
	expect("turnOnOffGpu").toBeFunction()
	
	var errorsArray = []
	return errorsArray.flatMap(function(val) { return val }).flatMap(function(val) { return val != null ? [val] : [] })
}
