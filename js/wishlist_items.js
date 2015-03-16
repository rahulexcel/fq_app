var wishlistItemsMod = angular.module('WishlistItemsMod', ['ServiceMod', 'ngStorage', 'ionic']);
wishlistItemsMod.controller('WishlistItemsCtrl',
        ['$scope', '$q', '$stateParams', 'wishlistHelper', '$ionicLoading', '$localStorage', 'toast', 'friendHelper', '$location', '$ionicBackdrop', '$ionicPopup', '$ionicModal',
            function ($scope, $q, $stateParams, wishlistHelper, $ionicLoading, $localStorage, toast, friendHelper, $location, $ionicBackdrop, $ionicPopup, $ionicModal) {
                if ($stateParams.list_id) {
                    $scope.wishlist_name = $stateParams.list_name;
                    $scope.list_id = $stateParams.list_id;
                    console.log('list id ' + $scope.list_id);
                    $scope.list_detail = false;
                    $scope.follow = false;
                    $scope.my_list = false;
                    $scope.$on('logout_event', function () {
                        $location.path('/app/signup');
                    });
                    $ionicModal.fromTemplateUrl('template/partial/user-follow.html', {
                        scope: $scope,
                        animation: 'slide-in-up'
                    }).then(function (modal) {
                        $scope.friend_list_model = modal;
                    });
                    $scope.$on('$destroy', function () {
                        $scope.friend_list_model.remove();
                    });
                    $scope.listMembers = function () {
                        $scope.user_follow_title = 'Wishlist Members';
                        $scope.friend_list_model.show();
                    };
                    $scope.closeModel = function () {
                        $scope.friend_list_model.hide();
                    };

                    $scope.shareList = function () {
                        var wishname = $scope.wishlist_name.replace(" ", "_");
                        var share_url = 'http://fashioniq.in/m/l/' + $scope.list_id + "/" + wishname;
                        window.plugins.socialsharing.share($scope.wishlist_name, null, null, share_url, function () {
                        }, function () {
                            toast.showShortBottom('Unable to Share');
                        });
                    };
                    $scope.leaveList = function () {
                        $ionicPopup.confirm({
                            title: 'Are you sure you want to leave this wishlist?',
                        }).then(function (res) {
                            var ajax = wishlistHelper.leaveList($scope.list_detail);
                            ajax.then(function () {
                                toast.showShortBottom('Your Have Left The Wishlist');
                                $location.path('/app/profile/me/mine');
                            });
                        });

                    };
                    $scope.editList = function () {
                        $location.path('/app/wishlist_edit/' + $scope.list_id);
                    };
                    $scope.deleteList = function () {
                        $ionicBackdrop.retain();
                        var ajax = wishlistHelper.delete($scope.list_id);
                        ajax.then(function () {
                            $ionicBackdrop.release();
                            toast.showShortBottom('WishList Deleted');
                            $location.path('/app/profile/me/mine');
                        }, function () {
                            $ionicBackdrop.release();
                        });
                    };

                    $scope.users = [];

                    $scope.getData = function (page) {
                        var defer = $q.defer();
                        var ajax = wishlistHelper.listItems($stateParams.list_id, page);
                        ajax.then(function (data) {
                            var list = data.list;
                            $scope.wishlist_name = list.name;

                            if (list.type === 'private') {
                                if (data.list.user_id._id !== $localStorage.user.id) {
                                    toast.showShortBottom('You Cannot Access This List!');
                                    $location.path('/app/profile/me/mine');
                                    return;
                                }
                            } else if (list.type === 'shared') {
                                $scope.users = [];
                                $scope.users.push(data.list.user_id);
                                if (data.list.user_id._id !== $localStorage.user.id) {
                                    var shared_ids = data.list.shared_ids;
                                    var found = false;
                                    for (var i = 0; i < shared_ids.length; i++) {
                                        $scope.users.push(shared_ids[i]);
                                        console.log(shared_ids[i]._id + " ==== " + $localStorage.user.id);
                                        if (shared_ids[i]._id === $localStorage.user.id) {
                                            found = true;
                                        }
                                    }
                                    if (!found)
                                    {
                                        toast.showShortBottom('You Are Not A Member of This List!');
                                        $location.path('/app/profile/me/mine');
                                        return;
                                    }
                                }
                            }

                            if ($localStorage.user.id) {
                                if (data.list.user_id._id === $localStorage.user.id) {
                                    $scope.my_list = true;
                                }
                            }
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
                                toast.showShortBottom('Following List Now');
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
                                toast.showShortBottom('UnFollowing List Now');
                            }, function () {
                                $ionicLoading.hide();
                                $scope.request_process = false;
                            });
                        }
                    };
                }
            }
        ]);