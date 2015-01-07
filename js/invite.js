var inviteMod = angular.module('InviteMod', ['GoogleLoginService', 'AccountService', 'ServiceMod', 'ngStorage', 'InviteService']);

inviteMod.controller('InviteCtrl',
        ['$scope', '$localStorage', '$location', 'toast', 'googleLogin', 'accountHelper', 'inviteHelper', 'dataShare',
            function ($scope, $localStorage, $location, toast, googleLogin, accountHelper, inviteHelper, dataShare) {

                if (!$localStorage.user.id) {
                    $location.path('/app/home');
                    return;
                }
                $scope.$on('logout_event', function () {
                    $location.path('/app/signup');
                })
                if ($localStorage.user.type == 'facebook') {
                    var data = dataShare.getData();
                    if (data && data.data) {
                        inviteHelper.lookUpFacebookFriends(data.data);
                    }
                }

                $scope.facebook = function () {
                    if (window.cordova.platformId == "browser") {
                        if (!accountHelper.isFbInit()) {
                            facebookConnectPlugin.browserInit('765213543516434');
                            accountHelper.fbInit();
                        }
                    }
                    facebookConnectPlugin.showDialog({
                        method: 'share',
                        href: 'https://developers.facebook.com/android',
                        picture: 'https://raw.github.com/fbsamples/ios-3.x-howtos/master/Images/iossdk_logo.png',
                        message: 'Checkout this awesome app'
                    })

                }

                $scope.google = function () {

                }

            }
        ]);