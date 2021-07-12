/**
 *	Angular Server Storage Implementation
 *
 *	Vibhaj Rajan <vibhaj8@gmail.com>
 *
 *	Licensed under MIT License 
 *	http://www.opensource.org/licenses/mit-license.php
 *
**/

angular.module( 'Session', ['REST'] )
	.factory( 'Session', [ 'Resource', '$rootScope', '$location', function($resource, $rootScope, $location) {
		var Session = $resource( 'api/v1/session/:id/', { id: '@id' } );

		return {
			check: function(callback){
				console.log("Checking Session");
				if($rootScope.user){
					if(callback) callback($rootScope.user);
				}
				else {
					Session.query().$promise.then(
						function(data){
							console.log(data);
							$rootScope.user = data;
							if(callback) callback(data);
						},
						function(){
							$location.path('/login/');
						}
					);
				}
			},

			login: function(credentials, callback){
				console.log(credentials);
				Session.create(credentials).$promise.then(
					function(data){
						console.log(data);
						$rootScope.user = data;
						if(callback) callback(data);
						$location.path('/');
					},
					function(){}
				);
			},

			logout: function(callback){
				console.log();
				Session.remove({id: $rootScope.user.id}).$promise.then(
					function(data){
						if(callback) callback(data);
						$location.path('/login/');
					},
					function(){}
				);
			}
		};

	}]);

