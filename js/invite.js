var inviteMod = angular.module('InviteMod', ['AccountService', 'ServiceMod', 'ngStorage', 'InviteService']);

inviteMod.controller('InviteCtrl',
        ['$scope', '$localStorage', '$location', 'toast', 'accountHelper', 'inviteHelper', 'dataShare',
            function ($scope, $localStorage, $location, toast, accountHelper, inviteHelper, dataShare) {

                if (!$localStorage.user.id) {
                    $location.path('/app/home');
                    return;
                }
                $scope.friends = [];
                $scope.$on('logout_event', function () {
                    $location.path('/app/signup');
                })
                if ($localStorage.user.type == 'facebook') {
                    var data = dataShare.getData();
                    if (data && data.data) {
                        var ajax = inviteHelper.lookUpFacebookFriends(data.data);
                        ajax.then(function (data) {
                            $scope.friends = data;
                        });
                    }
                } else if ($localStorage.user.type == 'google') {
                    var data = dataShare.getData();
                    if (data && data.data) {
                        var ajax = inviteHelper.lookUpGoogleFriends(data.data);
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
                    (function (d, s, id) {
                        var js, fjs = d.getElementsByTagName(s)[0];
                        if (d.getElementById(id))
                            return;
                        js = d.createElement(s);
                        js.id = id;
                        js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&appId=765213543516434&version=v2.0";
                        fjs.parentNode.insertBefore(js, fjs);
                    }(document, 'script', 'facebook-jssdk'));
                    window.twttr = (function (d, s, id) {
                        var t, js, fjs = d.getElementsByTagName(s)[0];
                        if (d.getElementById(id)) {
                            return
                        }
                        js = d.createElement(s);
                        js.id = id;
                        js.src = "https://platform.twitter.com/widgets.js";
                        fjs.parentNode.insertBefore(js, fjs);
                        return window.twttr || (t = {_e: [], ready: function (f) {
                                t._e.push(f)
                            }})
                    }(document, "script", "twitter-wjs"));

                }

                $scope.shareAll = function () {
                    window.plugins.socialsharing.share($scope.text, null, null, 'http://www.pricegenie.co')
                }
                $scope.twitter = function () {
                    window.plugins.socialsharing.shareViaTwitter(
                            $scope.text, null,
                            'http://www.pricegenie.co');
                }
                $scope.whatsapp = function () {
                    window.plugins.socialsharing.shareViaWhatsApp(
                            $scope.text, null,
                            'http://www.pricegenie.co');
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
                        href: 'http://www.pricegenie.co',
                        picture: 'https://raw.github.com/fbsamples/ios-3.x-howtos/master/Images/iossdk_logo.png',
                        message: 'Message and link'
                    }, function (data) {
                        console.log(data);
                    }, function (data) {
                        console.log(data);
                    })

                }

                $scope.next = function () {
                    if ($localStorage.previous.url) {
                        var prev_url = $localStorage.previous.url;
                        $localStorage.previous.url = false;
                        console.log('previous url ' + prev_url);
                        $location.path(prev_url);
                    } else {
                        $location.path('/app/account');
                    }
                }

            }
        ]);