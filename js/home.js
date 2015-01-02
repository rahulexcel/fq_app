var homeMod = angular.module('HomeMod', ['ServiceMod', 'ngStorage', 'ionic']);

homeMod.controller('HomeCtrl',
        ['$scope', 'ajaxRequest', '$localStorage', '$location', '$ionicNavBarDelegate', '$rootScope', 'timeStorage', 'toast', '$ionicModal',
            function ($scope, ajaxRequest, $localStorage, $location, $ionicNavBarDelegate, $rootScope, timeStorage, toast, $ionicModal) {
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
                    $location.path('/app/wishlist');
                }
                $scope.account = function () {
                    $location.path('/app/account');
                }
                $scope.feedback = function () {
                    $location.path('/app/feedback');
                }
                $scope.aboutus = function () {

                }

                $rootScope.showSearchBox = false;
                $rootScope.search = {
                    text: ''
                }
                $scope.searchNow = function () {
                    $rootScope.showSearchBox = true;
                }
                $scope.$on('$destroy', function () {
                    $scope.modal.remove();
                });
                $scope.closeModel = function () {
                    $scope.modal.hide();
                }
                $ionicModal.fromTemplateUrl('template/partial/search-category.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.modal = modal;
                });
                $scope.doSearch = function () {
                    if ($rootScope.search.text.length > 0) {

                        var path = $location.path();
                        if (path.indexOf('/app/category') != -1) {
                            $scope.$broadcast('search_event');
                        } else if (path.indexOf('/app/product') != -1) {
                            $scope.$broadcast('search_product_event');
                        } else {
                            $scope.modal.show();
                        }

                    } else {
                        toast.showShortBottom('Enter Search Term');
                    }
                }
                $scope.search_cat = false;
                $scope.selectSearchCategory = function (cat) {
                    console.log(cat);
                    $scope.search_cat = cat;
                    $scope.modal.hide();
                    $rootScope.search.text = '';
                    $rootScope.showSearchBox = false;
                    var father_key = cat.father_key;
                    $location.path('/app/search/' + father_key + "/" + $rootScope.search.text);
                    $rootScope.search.text = '';
                    $rootScope.showSearchBox = false;
                }
            }
        ]);