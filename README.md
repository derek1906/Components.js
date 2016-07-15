# Components.js
Simple dependency injection system - A light weight solution for handling components that depend on other components.

## Usage
This system requires components to be registered before using.

To register a component:

```js
Components.register("Phonebook", function(){
    var storage = {};

    // outward-facing interface
    return {
        createEntry: function(name, phone_number){
			storage[name] = phone_number;
        },
        retrieveEntry: function(name){
			return storage[name];
        }
    };
});

Components.register("Phone", function(Phonebook){

    // outward-facing interface
	return {
		call: function(name){
			var number = Phonebook.retrieveEntry(name);

			if(number){
				doCall(number);
			}else{
				showError();
			}
		}
	}
});
```

Or all at once:

```js
Components.registerAll(
	"Phonebook", function(){
        var storage = {};

        // outward-facing interface
        return {
	        createEntry: function(name, phone_number){
				storage[name] = phone_number;
	        },
	        retrieveEntry: function(name){
				return storage[name];
	        }
        };
	},

	"Phone", function(Phonebook){

        // outward-facing interface
		return {
			call: function(name){
				var number = Phonebook.retrieveEntry(name);

				if(number){
					doCall(number);
				}else{
					showError();
				}
			}
		}
	}
);
```

These components can then be used as:

```js
Components.depends(function(Phone){
	document.getElementById("call-button").addEventListener(function(){
		Phone.call(person);
	});
});
```

Components can also be requested through `Components.getSingleton`:

```js
Components.getSingleton("Phonebook")
```


## License
<pre>
        DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
                    Version 2, December 2004 

 Copyright (C) 2004 Sam Hocevar <sam@hocevar.net> 

 Everyone is permitted to copy and distribute verbatim or modified 
 copies of this license document, and changing it is allowed as long 
 as the name is changed. 

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION 

  0. You just DO WHAT THE FUCK YOU WANT TO.
</pre>