var profileMod = angular.module('ProfileMod', ['ServiceMod', 'ngStorage', 'ionic', 'FriendService']);
profileMod.controller('ProfileCtrl',
        ['$scope', '$localStorage', 'toast', '$location', '$ionicLoading', 'friendHelper', '$stateParams', '$rootScope', '$timeout', 'wishlistHelper',
            function ($scope, $localStorage, toast, $location, $ionicLoading, friendHelper, $stateParams, $rootScope, $timeout, wishlistHelper) {
                var user_id = false;
                $scope.$on('logout_event', function () {
                    $location.path('/app/home');
                });
                if ($stateParams.user_id) {
                    user_id = $stateParams.user_id;
                    if (user_id === 'me') {
                        user_id = $localStorage.user.id;
                    }
                } else if ($localStorage.user.id) {
                    user_id = $localStorage.user.id;
                }
                $scope.user = false;
                $scope.myScoll = false;
                $scope.selected_class = '';

                $scope.pin_status = {
                    pin_page: 0,
                    showMore: false
                };

                $scope.getData = function (page) {
                    return friendHelper.loadMoreProfilePins(user_id, page);
                };

                $rootScope.$on('$viewContentLoaded', function (event) {
                    var path = $location.path();
                    if (path === '/app/profile/' + user_id + '/mine') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'wishlist';
                    } else if (path === '/app/profile/' + user_id + '/followers') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'followers';
                    } else if (path === '/app/profile/' + user_id + '/following') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'following';
                    } else if (path === '/app/profile/' + user_id + '/pins') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'pins';
                    } else if (path === '/app/profile/' + user_id + '/profile') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'profile';
                    } else if (path === '/app/profile/' + user_id + '/update') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'update';
                    } else if (path === '/app/profile/' + user_id + '/friends') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'friends';
                    }
                });
                $scope.me = false;
                $scope.menu_update = function () {
                    $location.path('/app/profile/' + user_id + '/update');
                };
                $scope.menu_wishlist = function () {
                    $location.path('/app/profile/' + user_id + '/mine');
                };
                $scope.menu_followers = function () {
                    $location.path('/app/profile/' + user_id + '/followers');
                };
                $scope.menu_following = function () {
                    $location.path('/app/profile/' + user_id + '/following');
                };
                $scope.menu_pins = function () {
                    $location.path('/app/profile/' + user_id + '/pins');
                };
                $scope.menu_profile = function () {
                    $location.path('/app/profile/' + user_id + '/profile');
                };
                $scope.menu_friends = function () {
                    $location.path('/app/profile/' + user_id + '/friends');
                };
                
                if (user_id) {
                    $ionicLoading.show({
                        template: 'Loading...'
                    });
                    $scope.following = false;
                    var ajax = friendHelper.fullProfile(user_id);
                    ajax.then(function (data) {

                        if (data.lists_mine) {
                            for (var i = 0; i < data.lists_mine.length; i++) {
                                var name = data.lists_mine[i].name;
                                var list_symbol = name.substring(0, 1).toUpperCase();
                                var bg_color = wishlistHelper.getRandomColor();
                                data.lists_mine[i].list_symbol = list_symbol;
                                data.lists_mine[i].bg_color = bg_color;
                            }
                        }

                        $scope.user = data;
                        if ($scope.user._id === $localStorage.user.id) {
                            $scope.me = true;
                        }
                        if (data.followers)
                            for (var i = 0; i < data.followers.length; i++) {
                                if (data.followers[i]._id === $localStorage.user.id) {
                                    $scope.following = true;
                                    break;
                                }
                            }

                        $ionicLoading.hide();
                        $scope.$broadcast('user_info');

                        var width = 125;
                        if ($scope.me) {
                            width = width * 7;
                        } else {
                            width = width * 5;
                        }
                        angular.element(document.querySelector('#menu_scroller')).attr('style', 'width:' + width + 'px');
                        $timeout(function () {
                            $scope.myScroll = new IScroll('#menu_sliding', {scrollX: true, scrollY: false, eventPassthrough: true, preventDefault: false, tap: true});
                        }, 50);

                    }, function () {
                        $ionicLoading.hide();
                    });

                } else {
                    toast.showShortBottom('You Need To Be Logged In To Access This Page');
                    $location.path('/app/signup');
                }

                var self = this;

                self.followUserID = function (user_id, type) {
                    return friendHelper.user_follow(user_id, type);
                };
                $scope.followProfileUser = function () {
                    if ($scope.request_process) {
                        toast.showProgress();
                        return;
                    }
                    $scope.request_process = true;
                    var ajax = self.followUserID(user_id);
                    ajax.then(function () {
                        $scope.following = true;
                        $scope.request_process = false;
                    }, function () {
                        $scope.request_process = false;
                    });
                };
                $scope.unFollowProfileUser = function () {
                    if ($scope.request_process) {
                        toast.showProgress();
                        return;
                    }
                    $scope.request_process = true;
                    var ajax = self.followUserID(user_id, 'remove');
                    ajax.then(function () {
                        $scope.following = false;
                        $scope.request_process = false;
                    }, function () {
                        $scope.request_process = false;
                    });
                };
            }
        ]);