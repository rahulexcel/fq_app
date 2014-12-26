// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter',
        [
            'ionic',
            'CategoryMod',
            'HomeMod',
            'ProductMod',
            'RegisterMod'
        ]
        );
app.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.views.maxCache(5);
    $stateProvider
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'template/menu.html',
                controller: 'HomeCtrl'
            })
            .state('app.home', {
                url: '/home',
                views: {
                    'menuContent': {
                        templateUrl: 'template/category.html',
                        controller: 'CategoryCtrl'
                    }
                }
            })
            .state('app.product', {
                url: '/product/:product_id',
                views: {
                    'menuContent': {
                        templateUrl: 'template/product.html',
                        controller: 'ProductCtrl'
                    }
                }
            })
            .state('app.signup', {
                url: '/signup',
                views: {
                    'menuContent': {
                        templateUrl: 'template/register.html',
                        controller: 'AccountCtrl'
                    }
                }
            });
    $urlRouterProvider.otherwise('/app/home');
});
app.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

    });
})
