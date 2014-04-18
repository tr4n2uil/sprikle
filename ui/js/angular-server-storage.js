/**
 *	Angular Server Storage Implementation
 *
 *	Vibhaj Rajan <vibhaj8@gmail.com>
 *
 *	Licensed under MIT License 
 *	http://www.opensource.org/licenses/mit-license.php
 *
**/

angular.module( 'Storage', ['REST'] )
	.factory( 'Storage', [ 'Resource', function($resource) {
		var Store = $resource( 'api/v1/data/:key/', { key: '@key' } );

		var storage = {};

		storage.uuid = function(){
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
			}

			return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
		}

		storage.query = function( key, callback, def ){
			Store.query({key: key})
				.$promise.then(
	                function(data){
	                    //data = data.trim();
	                    if(data && data.value){
	                    	console.log('API Query: '+JSON.stringify(data));
	                    	if(callback) callback(JSON.parse(data.value), data.extra);
	                    }
	                    else {
	                    	if(callback) callback(def, {});
	                    }
	                }, 
	                function(data){
	                    //TODO
	                    console.log('API Query Error');
	                    if(callback) callback(def);
	                }
	            );

			return true;
		}

		storage.save = function( key, object, callback ){
			if(!object.uuid) object.uuid = storage.uuid();
			if(!key) key = object.uuid;
			var created = object.id || false;
			if(!object.id) object.id = key;

			var obj = {
				key: key,
				value: JSON.stringify( object )
			}

			var r = created ? Store.update(obj) : Store.create(obj);
			r.$promise.then(
                function(data){
                    console.log('API Save: '+JSON.stringify(data));
                    if(callback) callback(data);
                }, 
                function(data){
                    //TODO
                }
            );

			return object;
		}

		storage.remove = function( key, callback ){
			Store.remove({key: key})
				.$promise.then(
	                function(data){
	                    console.log('API Query: '+JSON.stringify(data));
	                    if(callback) callback(data);
	                }, 
	                function(data){
	                    //TODO
	                }
	            );
			
			return true;
		}

		/*storage.export = function(){
			return JSON.stringify(store);
		}

		storage.import = function(file, callback){
			var reader = new FileReader();
			reader.onload = function(event) {
				var contents = event.target.result;

				var data = JSON.parse(contents);
				store.clear();
				for(var i in data){
					store[i] = data[i];
				}

				if(callback) callback();
			};

			reader.onerror = function(event) {
				console.error("File could not be read! Code " + event.target.error.code);
			};
			reader.readAsText(file);
		}*/

		return storage;

	}]);

