/**
 *	Angular UI Easy Notes Application
 *
 *	Vibhaj Rajan <vibhaj8@gmail.com>
 *
 *	Licensed under MIT License 
 *	http://www.opensource.org/licenses/mit-license.php
 *
**/

var APP = angular.module('APP', ['ngRoute', 'ngSanitize', 'chieffancypants.loadingBar', 'Storage', 'DB', 'Session'])

	.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider){

		$routeProvider
			//.when('/', {templateUrl: 'ui/tpl/home.html', controller: "init"})
			.when('/', {templateUrl: 'ui/tpl/storage.html', controller: 'book'})
			.when('/login', {templateUrl: 'ui/tpl/login.html', 
				controller: ['$scope', function($scope){
					$scope.book = { name: "Login" };
				}]
			})

			.when('/books/', {templateUrl: 'ui/tpl/storage.html', controller: 'book'})
			.when('/book/:id', {templateUrl: 'ui/tpl/storage.html', controller: 'book'})

			.when('/plans/', {templateUrl: 'ui/tpl/plan.html', controller: 'plan'})
			.when('/plan/:id', {templateUrl: 'ui/tpl/plan.html', controller: 'plan'});
		
		$httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
		$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

	}])

	.filter('reverse', function() {
		return function(items) {
			if(items){
				return items.slice().reverse();	
			}
			return items;
		};
	})

	.controller('init', ['$scope', '$rootScope', '$timeout', '$location', '$route', 'Storage', 'DB', 'Session',
		function($scope, $rootScope, $timeout, $location, $route, Storage, DB, Session) {
			$scope.minHeight=$(window).height()-3;
			$scope.headerURL = 'ui/tpl/header.html';
			$scope.footerURL = 'ui/tpl/footer.html';
			$scope.DB = DB;
			$scope.Session = Session;
			$scope.Number = Number;
			$scope.Date = Date;

			$scope.log = function(data){
				console.log(data);
				return true;
			}

			$scope.refresh = function(){
				$rootScope.collections = undefined;
				$route.reload();
				return true;
			}

			$scope.process = function(objects){
				$rootScope.collections = objects.reverse();
				$rootScope.collections__map = {};
				for(var i in objects){
					$rootScope.collections__map[objects[i].id] = 1;
				}
			}

			$scope.add = function(key, object){
				if($rootScope.collections__map[ object.id ] || false){ } else {
					DB.save( 'user.'+ $scope.user.uuid + '.' + key, object, false, function(){
						//$location.path( '/book/' + book.uuid );
						DB.query( 'user.'+ $scope.user.uuid + '.' + key, function(objects){
							//console.log('Retrieving Books: ', books);
							$scope.process(objects);
						});
					}, true );
				}
			}

			$scope.newBook = function(){
				var book = { name: 'Untitled Notes', owner: $scope.user };
				$rootScope.collections = undefined;

				DB.save( 'user.'+ $scope.user.uuid +'.books', book, false, function(){
					//console.log(book);
					$location.path( '/book/' + book.uuid );
				} );
			}

			$scope.deleteBook = function( book ){
				if(book.owner == $scope.user.uuid){
					DB.drop( 'book.'+ book.uuid +'.notes' );
				}

				DB.remove( 'user.'+ $scope.user.uuid +'.books', book, function(){
					$rootScope.collections = undefined;
					$location.path('/books/');
				}, book.owner.uuid == $scope.user.uuid );
			}

			$scope.newPlan = function(){
				var plan = { name: 'Untitled Plan', owner: $scope.user, total: 0, done: 0, particulars: [] };
				$rootScope.collections = undefined;

				DB.save( 'user.'+ $scope.user.uuid +'.plans', plan, false, function(object){
					//console.log(object);
					$location.path( '/plan/' + plan.uuid );
				} );
			}

			$scope.deletePlan = function( plan ){
				DB.remove( 'user.'+ $scope.user.uuid +'.plans', plan, function(){
					$rootScope.collections = undefined;
					$location.path('/plans/');
				}, plan.owner.uuid == $scope.user.uuid );
			}

			$scope.export = function(){
				var bb = new Blob([Storage.export()], {type: 'application/json'});
				var a = document.createElement('a');
				a.download = 'easy-notes-data.json';
				a.href = window.URL.createObjectURL(bb);
				a.textContent = 'Download Book';
				a.dataset.downloadurl = ['application/json', a.download, a.href].join(':');
				a.click();
			}

			$scope.import = function(){
				var file = $('#upload-file').get(0).files[0];
				console.log(file);
				Storage.import(file, function(){
					$location.path('/');
					$route.reload();
				});
			}
		}
	])

	.controller('book', ['$scope', '$rootScope', 'DB', '$routeParams', 'Session',
		function($scope, $rootScope, DB, $routeParams, Session) {
			$rootScope.collections = $rootScope.entity!='book'?undefined:$rootScope.collections;
			$rootScope.entity = 'book';
			$scope.icon = 'book';
			$scope.title = 'Books';
			$scope.title_one = 'Book';
			$scope.newObj = $scope.newBook;
			$scope.deleteObj = $scope.deleteBook;

			Session.check(function(){
				DB.get( $routeParams.id || 'easy-notes', false, function(book){
					$scope.book = $scope.obj = book;
					if( !$scope.book ){
						$scope.book = $scope.obj = { name: 'Easy Notes' };
						DB.save( 'user.'+ $scope.user.uuid +'.books', $scope.book, 'easy-notes' );
					}

					DB.query( 'book.'+ $scope.book.uuid +'.notes', function(notes){
						//console.log('Retrieving Notes: ', notes);
						$scope.notes = notes;
					});

					if(!$rootScope.collections){
						DB.query( 'user.'+ $scope.user.uuid +'.books', function(books){
							//console.log('Retrieving Books: ', books);
							$scope.process(books);
							$scope.add('books', book);
						});
					}
					else {
						$scope.add('books', book);
					}

				} );

				$('#newnote').focus();
			});
		}
	])

	.controller('plan', ['$scope', '$rootScope', 'DB', '$routeParams', 'Session',
		function($scope, $rootScope, DB, $routeParams, Session) {
			$rootScope.collections = $rootScope.entity!='plan'?undefined:$rootScope.collections;
			$rootScope.entity = 'plan';
			$scope.icon = 'usd';
			$scope.title = 'Plans';
			$scope.title_one = 'Plan';
			$scope.newObj = $scope.newPlan;
			$scope.deleteObj = $scope.deletePlan;

			Session.check(function(){
				DB.get( $routeParams.id || 'easy-plan', false, function(plan){
					$scope.plan = $scope.obj = plan;
					if( !$scope.plan ){
						$scope.plan = $scope.obj = { name: 'Easy Plan', total: 0, done: 0, particulars: [] };
						DB.save( 'user.'+ $scope.user.uuid +'.plans', $scope.plan, 'easy-plan' );
					}

					if(!$rootScope.collections){
						DB.query( 'user.'+ $scope.user.uuid +'.plans', function(plans){
							//console.log('Retrieving Books: ', books);
							$scope.process(plans);
							$scope.add('plans', plan);
						});
					}
					else {
						$scope.add('plans', plan);
					}

				} );

				$('#new').focus();
			});
		}
	]);



/*
window.onbeforeunload = confirmExit;
function confirmExit(){
    return confirm("Save your data. Confirm exit?");
}
*/
