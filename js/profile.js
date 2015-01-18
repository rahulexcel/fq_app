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

                console.log('initiazling iscroll');
                angular.element(document.querySelector('#menu_scroller')).attr('style', 'width:625px');
                $scope.myScroll = new IScroll('#menu_sliding', {scrollX: true, scrollY: false, eventPassthrough: true, preventDefault: false, tap: true});
                $rootScope.$on('$viewContentLoaded', function (event) {
                    var path = $location.path();
                    if (path == '/app/profile/mine') {
                        $scope.selected_class = 'wishlist';
                    } else if (path == '/app/profile/followers') {
                        $scope.selected_class = 'followers';
                    } else if (path == '/app/profile/following') {
                        $scope.selected_class = 'following';
                    } else if (path == '/app/profile/pins') {
                        $scope.selected_class = 'pins';
                    } else if (path == '/app/profile/profile') {
                        $scope.selected_class = 'profile';
                    }
                });

                if (user_id) {
                    $ionicLoading.show({
                        template: 'Loading...'
                    });
                    var ajax = friendHelper.fullProfile(user_id);
                    ajax.then(function (data) {
                        console.log(data);
                        $scope.user = data;
                        $ionicLoading.hide();
                        $scope.$broadcast('user_info');
                    }, function () {
                        $ionicLoading.hide();
                    });
                } else {
                    toast.showShortBottom('You Need To Be Logged In To Access This Page');
                    $location.path('/app/register');
                }
            }
        ]);