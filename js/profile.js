var profileMod = angular.module('ProfileMod', ['ServiceMod', 'ngStorage', 'ionic', 'FriendService']);
profileMod.controller('ProfileCtrl',
        ['$scope', '$localStorage', 'toast', '$location', '$ionicLoading', 'friendHelper', '$stateParams', '$rootScope',
            function ($scope, $localStorage, toast, $location, $ionicLoading, friendHelper, $stateParams, $rootScope) {
                var user_id = false;
                if ($localStorage.user.id) {
                    user_id = $localStorage.user.id;
                } else if ($stateParams.user_id) {
                    user_id = $stateParams.user_id;
                }
                $scope.user = false;
                $scope.myScoll = false;
                $scope.selected_class = '';

                $scope.pin_status = {
                    pin_page: 0,
                    showMore: false
                };

                $rootScope.$on('$viewContentLoaded', function (event) {
                    var path = $location.path();
                    if (path === '/app/profile/mine') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'wishlist';
                    } else if (path === '/app/profile/followers') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'followers';
                    } else if (path === '/app/profile/following') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'following';
                    } else if (path === '/app/profile/pins') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'pins';
                    } else if (path === '/app/profile/profile') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'profile';
                    } else if (path == '/app/profile/update') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'update';
                    }
                });
                $scope.me = false;
                $scope.menu_update = function () {
                    $location.path('/app/profile/update');
                }
                $scope.menu_wishlist = function () {
                    $location.path('/app/profile/mine');
                };
                $scope.menu_followers = function () {
                    $location.path('/app/profile/followers');
                };
                $scope.menu_following = function () {
                    $location.path('/app/profile/following');
                };
                $scope.menu_pins = function () {
                    $location.path('/app/profile/pins');
                };
                $scope.menu_profile = function () {
                    $location.path('/app/profile/profile');
                };
                $scope.loadMoreData = function () {
                    var ajax = friendHelper.loadMoreProfilePins(user_id, $scope.pin_status.pin_page + 1);
                    ajax.then(function (data) {
                        $scope.pin_status.pin_page++;
                        if (data.length > 0) {
                            var pins = $scope.user.pins;
                            for (var i = 0; i < data.length; i++) {
                                pins.push(data[i]);
                            }
                            $scope.user.pins = pins;
                        } else {
                            console.log('remove scroll more');
                            $scope.pin_status.showMore = false;
                        }
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        $scope.$broadcast('more_pins');
                    }, function () {
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    });
                };

                if (user_id) {
                    $ionicLoading.show({
                        template: 'Loading...'
                    });
                    var ajax = friendHelper.fullProfile(user_id);
                    ajax.then(function (data) {
                        console.log(data);
                        $scope.user = data;
                        if ($scope.user._id == $localStorage.user.id) {
                            $scope.me = true;
                        }
                        $ionicLoading.hide();
                        $scope.$broadcast('user_info');

                        console.log('initiazling iscroll');
                        var width = 125;
                        if ($scope.me) {
                            width = width * 6;
                        } else {
                            width = width * 5;
                        }
//                        angular.element(document.querySelector('#menu_scroller')).attr('style', 'width:' + width + 'px');
                        $scope.myScroll = new IScroll('#menu_sliding', {scrollX: true, scrollY: false, eventPassthrough: true, preventDefault: false, tap: true});

                    }, function () {
                        $ionicLoading.hide();
                    });

                } else {
                    toast.showShortBottom('You Need To Be Logged In To Access This Page');
                    $location.path('/app/register');
                }
            }
        ]);