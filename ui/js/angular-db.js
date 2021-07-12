/**
 *	Angular DB Implementation
 *
 *	Vibhaj Rajan <vibhaj8@gmail.com>
 *
 *	Licensed under MIT License 
 *	http://www.opensource.org/licenses/mit-license.php
 *
**/

angular.module( 'DB', [ 'Storage' ] )
	.factory( 'DB', [ 'Storage', function( Storage ) {
		var db = {};

		db.get = function( key, def, callback ){
			return Storage.query( key, callback, def );
		}

		db.query = function( name, callback ){
			Storage.query( name, function(collection, extra){
				var data = [];
				var list = collection.objects;

				if(list){
					for( var i in list ){
						data.push( JSON.parse(extra[list[i]].value) )
					}
				}

				if(callback) callback(data);
			}, { objects: [] } );
			
			return true;
		}

		db.save = function( name, object, key, callback, add ){
			var obj = object;
			object = angular.copy(object);
			var old = object['id'] || false;
			Storage.save( key, object, function(data){
				obj.uuid = object.uuid;

				// create
				if( !old || add ){
					Storage.query( name, function(collection){
						console.log('Retrieving Collection: ', collection);
						collection.objects.push( object.id );
						Storage.save( name, collection, callback );
					}, { objects: [] } );
				}
				else {
					if(callback) callback(object);
				}
			} );

			// update 
			return object;
		}

		db.remove = function( name, object, callback, del ){
			Storage.query( name, function(collection){
					collection.objects.splice(collection.objects.indexOf( object.uuid ), 1);
					
					Storage.save( name, collection, function(collection){
						if(del){
							Storage.remove( object.id, callback );	
						}
						else {
							if(callback) callback(object);
						}
					} );
				}, { objects: [] } );

			return true;
		}

		db.drop = function( name, callback ){
			//var collection = db.get( name, { objects: [] } );
			//Storage.remove( collection.objects );
			
			Storage.remove( name, callback );
		}

		db.clear = function(){
			return Storage.clear();
		}

		window.DB = db;
		return db;
	}]);

