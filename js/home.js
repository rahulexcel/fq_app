var homeMod = angular.module('HomeMod', ['ServiceMod', 'ngStorage', 'ionic']);

homeMod.controller('HomeCtrl',
        ['$scope', 'ajaxRequest', '$localStorage', '$location', '$ionicNavBarDelegate', '$rootScope', 'timeStorage',
            function ($scope, ajaxRequest, $localStorage, $location, $ionicNavBarDelegate, $rootScope, timeStorage) {
                $ionicNavBarDelegate.showBackButton(false);
                if (timeStorage.get('category')) {
                    console.log('category from cache');
                    $scope.category = timeStorage.get('category');
                } else {
                    console.log('category not from cache');
                    $scope.category = [];
                    var ajax = ajaxRequest.send('v1/catalog/list', {});
                    ajax.then(function (data) {
                        $scope.category = data;
                        timeStorage.set('category', data, 24);
                    });
                }

                $scope.login = false;
                if ($localStorage.user && $localStorage.user.id) {
                    $scope.login = true;
                }

                $scope.logout = function () {
                    $scope.login = false;
                    var email = '';
                    if ($localStorage.user && $localStorage.user.email) {
                        email = $localStorage.user.email;
                    }
                    $localStorage.user = {
                        email: email
                    };
                    $rootScope.$broadcast('logout_event');
                }

                $scope.$on('login_event', function () {
                    $ionicNavBarDelegate.showBackButton(false);
                    $scope.login = true;
                })
                $scope.$on('logout_event', function () {
                    $scope.login = false;
                })

                $scope.selectCategory = function (cat) {
                    if (cat.sub_cat_id == 1 || cat.cat_id == -1) {

                        if (cat.open) {
                            cat.open = !cat.open;
                        } else {
                            cat.open = true;
                        }

                        return;
                    }
                    $location.path('/app/category/' + cat.cat_id + '/' + cat.sub_cat_id + '/' + cat.name);
                    //$location.path('/#/app/home');
                    //$scope.current_category = cat;
                }
                $scope.wishlist = function () {
                    alert('wishlist not done yet');
                }
                $scope.account = function () {
                    $location.path('/app/account');
                }
                $scope.feedback = function () {

                }
                $scope.aboutus = function () {

                }
            }
        ]);