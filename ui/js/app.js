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
			.when('/book/:id', {templateUrl: 'ui/tpl/storage.html', controller: 'book'});
		
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

	.controller('init', ['$scope', '$timeout', '$location', '$route', 'Storage', 'DB', 'Session',
		function($scope, $timeout, $location, $route, Storage, DB, Session) {
			$scope.minHeight=$(window).height()-3;
			$scope.headerURL = 'ui/tpl/header.html';
			$scope.footerURL = 'ui/tpl/footer.html';
			$scope.DB = DB;
			$scope.Session = Session;

			$scope.log = function(data){
				console.log(data);
				return true;
			}

			$scope.refresh = function(){
				$route.reload();
				return true;
			}

			$scope.sessionCheck = function(){
				DB.get()
			}

			$scope.newBook = function(){
				var book = { name: 'Untitled Notes' };
				DB.save( 'books', book, false, function(){
					$location.path( '/book/' + book.uuid );
				} );
			}

			$scope.deleteBook = function( book ){
				DB.drop( 'book.'+ book.uuid +'.notes' );
				DB.remove( 'books', book, function(){
					$location.path('/');
				} );
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

	.controller('book', ['$scope', 'DB', '$routeParams', 'Session',
		function($scope, DB, $routeParams, Session) {
			Session.check(function(){
				DB.get( $routeParams.id || 'easy-notes', false, function(book){
					$scope.book = book;
					if( !$scope.book ){
						$scope.book = { name: 'Easy Notes' };
						DB.save( 'books', $scope.book, 'easy-notes' );
					}

					DB.query( 'book.'+ $scope.book.uuid +'.notes', function(notes){
						//console.log('Retrieving Notes: ', notes);
						$scope.notes = notes;
					});
				} );
				
				DB.query( 'books', function(books){
					//console.log('Retrieving Books: ', books);
					$scope.books = books; 
				});

				$('#newnote').focus();
			});
		}
	]);



/*
window.onbeforeunload = confirmExit;
function confirmExit(){
    return confirm("Save your data. Confirm exit?");
}
*/
