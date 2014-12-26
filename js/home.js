var homeMod = angular.module('HomeMod', ['ServiceMod', 'ngStorage', 'ionic']);

homeMod.controller('HomeCtrl',
        ['$scope', 'ajaxRequest', '$localStorage', '$location', '$ionicNavBarDelegate',
            function ($scope, ajaxRequest, $localStorage, $location, $ionicNavBarDelegate) {
                $ionicNavBarDelegate.showBackButton(false);
                if ($localStorage.cat) {
                    $scope.category = $localStorage.cat;
                } else {
                    $scope.category = [];
                    var ajax = ajaxRequest.send('v1/catalog/list', {});
                    ajax.then(function (data) {
                        $scope.category = data;
                        $localStorage.cat = data;
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
                    $scope.$broadcast('logout_event');
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

                }
                $scope.feedback = function () {

                }
                $scope.aboutus = function () {

                }
            }
        ]);