var inviteMod = angular.module('InviteMod', ['AccountService', 'ServiceMod', 'ngStorage', 'InviteService']);

inviteMod.controller('InviteCtrl',
        ['$scope', '$localStorage', '$location', 'toast', 'accountHelper', 'inviteHelper', 'dataShare', 'socialJs',
            function ($scope, $localStorage, $location, toast, accountHelper, inviteHelper, dataShare, socialJs) {

                if (!$localStorage.user.id) {
                    $location.path('/app/home');
                    return;
                }
                $scope.friends = [];
                $scope.$on('logout_event', function () {
                    $location.path('/app/signup');
                });
                var data = false;
                var ajax = false;
                if ($localStorage.user.type === 'facebook') {
                    data = dataShare.getData();
                    if (data && data.data) {
                        ajax = inviteHelper.lookUpFacebookFriends(data.data);
                        ajax.then(function (data) {
                            $scope.friends = data;
                        });
                    }
                } else if ($localStorage.user.type === 'google') {
                    data = dataShare.getData();
                    if (data && data.data) {
                        ajax = inviteHelper.lookUpGoogleFriends(data.data);
                        ajax.then(function (data) {
                            $scope.friends = data.friends_data;
                        });
                    }
                }

                $scope.text = 'Message and link';
                $scope.link = 'http://www.pricegenie.co';
                $scope.isMobile = false;
                if (window.plugins && window.plugins.socialsharing) {
                    $scope.isMobile = true;
                } else {
                    socialJs.addSocialJs();
                }

                $scope.shareAll = function () {
                    window.plugins.socialsharing.share($scope.text, null, null, 'http://www.pricegenie.co');
                };
                $scope.twitter = function () {
                    window.plugins.socialsharing.shareViaTwitter(
                            $scope.text, null,
                            'http://www.pricegenie.co');
                };
                $scope.whatsapp = function () {
                    window.plugins.socialsharing.shareViaWhatsApp(
                            $scope.text, null,
                            'http://www.pricegenie.co');
                };

                $scope.facebook = function () {
                    if (window.cordova.platformId === "browser") {
                        if (!accountHelper.isFbInit()) {
                            facebookConnectPlugin.browserInit('765213543516434');
                            accountHelper.fbInit();
                        }
                    }
                    facebookConnectPlugin.showDialog({
                        method: 'share',
                        href: 'http://www.pricegenie.co',
                        picture: 'https://raw.github.com/fbsamples/ios-3.x-howtos/master/Images/iossdk_logo.png',
                        message: 'Message and link'
                    }, function (data) {
                        console.log(data);
                    }, function (data) {
                        console.log(data);
                    });
                };
                $scope.next = function () {
                    if ($localStorage.previous.url) {
                        var prev_url = $localStorage.previous.url;
                        $localStorage.previous.url = false;
                        console.log('previous url ' + prev_url);
                        $location.path(prev_url);
                    } else {
                        $location.path('/app/account');
                    }
                };

            }
        ]);