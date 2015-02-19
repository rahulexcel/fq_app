var wishlistItemsMod = angular.module('WishlistItemsMod', ['ServiceMod', 'ngStorage', 'ionic']);
wishlistItemsMod.controller('WishlistItemsCtrl',
        ['$scope', '$q', '$stateParams', 'wishlistHelper', '$ionicLoading', '$localStorage', 'toast', 'friendHelper',
            function ($scope, $q, $stateParams, wishlistHelper, $ionicLoading, $localStorage, toast, friendHelper) {
                if ($stateParams.list_id) {
                    $scope.wishlist_name = $stateParams.list_name;
                    $scope.list_id = $stateParams.list_id;
                    $scope.list_detail = false;
                    $scope.follow = false;
                    $scope.getData = function (page) {
                        var defer = $q.defer();
                        var ajax = wishlistHelper.listItems($stateParams.list_id, page);
                        ajax.then(function (data) {
                            var list = data.list;
                            if (list.followers && $localStorage.user.id) {
                                for (var i = 0; i < list.followers.length; i++) {
                                    if (list.followers[i] === $localStorage.user.id) {
                                        $scope.follow = true;
                                        break;
                                    }
                                }
                            }
                            $scope.list_detail = list;
                            var items = data.items;
                            defer.resolve(items);
                        }, function () {
                            defer.reject();
                        });
                        return defer.promise;
                    };
                    $scope.request_process = false;
                    $scope.followList = function () {
                        if (!$localStorage.user.id) {
                            $localStorage.previous.state = {
                                function: 'followList'
                            };
                            toast.showShortBottom('SignUp/Login To Follow List');
                        } else {
                            if ($scope.request_process) {
                                toast.showProgress();
                                return;
                            }
                            $scope.request_process = true;
                            var list_id = $scope.list_id;
                            var ajax = friendHelper.list_follow(list_id);
                            $ionicLoading.show({
                                template: 'Loading...'
                            });
                            ajax.then(function (data) {
                                $scope.follow = true;
                                $scope.request_process = false;
                                $ionicLoading.hide();
                            }, function () {
                                $ionicLoading.hide();
                                $scope.request_process = false;
                            });
                        }
                    };
                    $scope.unFollowList = function () {
                        if (!$localStorage.user.id) {
                            $localStorage.previous.state = {
                                function: 'unFollowList'
                            };
                            toast.showShortBottom('SignUp/Login To UnFollow From List');
                        } else {
                            if ($scope.request_process) {
                                toast.showProgress();
                                return;
                            }
                            $scope.request_process = true;
                            var list_id = $scope.list_id;
                            var ajax = friendHelper.list_follow(list_id, 'remove');
                            $ionicLoading.show({
                                template: 'Loading...'
                            });
                            ajax.then(function (data) {
                                $ionicLoading.hide();
                                $scope.follow = false;
                                $scope.request_process = false;
                            }, function () {
                                $ionicLoading.hide();
                                $scope.request_process = false;
                            });
                        }
                    };
                }
            }
        ]);