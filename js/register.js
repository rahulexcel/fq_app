var registerMod = angular.module('RegisterMod', ['GoogleLoginService', 'AccountService', 'ServiceMod', 'ngStorage', 'UrlService']);

//cordova -d plugin add C:\xampp\htdocs\facebook-plugin -variable APP_ID="765213543516434" --variable APP_NAME="FashionIQ"

registerMod.controller('RegisterCtrl',
        ['$scope', '$localStorage', 'toast', 'googleLogin', 'accountHelper', '$q', 'dataShare', '$rootScope', '$window', 'urlHelper',
            function ($scope, $localStorage, toast, googleLogin, accountHelper, $q, dataShare, $rootScope, $window, urlHelper) {
                if (!$localStorage.user) {
                    $localStorage.user = {};
                    $localStorage.user.email = '';
                } else {

                    if ($localStorage.user.id) {
                        urlHelper.openHomePage();
                        return;
                    }

                }

                var self = this;
                self.init = function () {
                    $scope.google_status = 0;
                    $scope.facebook_status = 0;
                    $scope.login_status = 0;
                    $scope.register_status = 0;
                    $scope.forgot_status = 0;
                };
                $scope.register_obj = {
                    name: '',
                    email: $localStorage.user.email,
                    password: ''
                };
                $scope.login_obj = {
                    email: $localStorage.user.email,
                    password: ''
                };
                $scope.forgot_obj = {
                    email: $localStorage.user.email
                };
                self.init();

                $rootScope.$on("$ionicView.enter", function () {
                    self.init();
                });

                $scope.$watch('register_obj.email', function (value) {
                    if (value) {
                        $scope.login_obj.email = value;
                        $scope.forgot_obj.email = value;
                    }
                });
                $scope.$watch('login_obj.email', function (value) {
                    if (value) {
                        $scope.register_obj.email = value;
                        $scope.forgot_obj.email = value;
                    }
                });
                $scope.$watch('forgot_obj.email', function (value) {
                    if (value) {
                        $scope.login_obj.email = value;
                        $scope.register_obj.email = value;
                    }
                });

                $scope.showForgot = function () {
                    urlHelper.openForgotPage();
                };
                $scope.showRegister = function () {
                    urlHelper.openSignUp();
                };
                $scope.showLogin = function () {
                    urlHelper.openLoginPage();
                };
                $scope.forgot = function () {
                    var email = $scope.forgot_obj.email;
                    if (email.length > 0) {
                        $scope.forgot_status = 1;
                        var ajax = accountHelper.forgot(email);
                        ajax.then(function () {
                            $scope.forgot_status = 2;
                        }, function () {
                            $scope.forgot_status = 3;
                        });
                    } else {
                        toast.showShortBottom('Enter Your Email Address');
                    }
                };

                $scope.login = function () {
                    var email = $scope.login_obj.email;
                    var password = $scope.login_obj.password;
                    if (email.length > 0 && password.length > 0) {
                        if ($scope.login_status === 1)
                        {
                            toast.showProgress();
                            return;
                        }
                        $scope.login_status = 1;
                        $localStorage.user = {};
                        $localStorage.user.email = email;
                        var user = {
                            email: email,
                            password: password
                        };
                        var prog = accountHelper.create(user, 'login');
                        prog.then(function () {
                            $scope.login_status = 2;
                        }, function () {
                            $scope.login_status = 3;
                        });
                    } else {
                        toast.showShortBottom('All Fields Required');
                    }
                };
                $scope.create = function () {
                    var email = $scope.register_obj.email;
                    var password = $scope.register_obj.password;
                    var name = $scope.register_obj.name;
                    if (email.length > 0 && password.length > 0 && name.length > 0) {
                        if ($scope.register_status === 1) {
                            toast.showProgress();
                            return;
                        }
                        $scope.register_status = 1;
                        $localStorage.user = {};
                        $localStorage.user.email = email;
                        var user = {
                            name: name,
                            email: email,
                            password: password
                        };
                        var prog = accountHelper.create(user, 'create');
                        prog.then(function () {
                            $scope.register_status = 2;
                        }, function () {
                            $scope.register_status = 3;
                        });
                    } else {
                        toast.showShortBottom('All Fields Required');
                    }
                };
                $scope.facebook = function () {
                    console.log('facebook called');
                    if (window.cordova.platformId === "browser") {
                        if (!accountHelper.isFbInit()) {
                            facebookConnectPlugin.browserInit('765213543516434');
                            accountHelper.fbInit();
                        }
                    }
                    facebookConnectPlugin.login(['email', 'user_friends'], function (data) {
                        console.log(data);
                        facebookConnectPlugin.api('/me', null, function (data) {
                            if ($scope.facebook_status === 1) {
                                toast.showProgress();
                                return;
                            }
                            $scope.facebook_status = 1;
                            var fb_id = data.id;
                            var email = data.email;
                            var firstname = data.first_name;
                            var lastname = data.last_name;
                            var gender = data.gender;
                            if (gender === 'male') {
                                gender = 'M';
                            } else if (gender === 'female') {
                                gender = 'F';
                            } else {
                                gender = false;
                            }
                            var def = $q.defer();
                            var promise = def.promise;
                            facebookConnectPlugin.api('/me/friends', null, function (data) {
                                console.log(data);
                                //toast.showShortBottom('Finding Your Facebook Friends...');
                                dataShare.broadcastData(data, 'facebook_friends');
                                //code written in create function below
                                def.resolve();
                            }, function (data) {
                                def.resolve();
                            });
                            promise.then(function () {
                                if (!email) {
                                    toast.showShortBottom("Email Not Found From Facebook, Unable To Login!");
                                } else {
                                    var user = {
                                        name: firstname + " " + lastname,
                                        gender: gender,
                                        email: email,
                                        fb_id: fb_id,
                                        picture: 'http://graph.facebook.com/' + fb_id + '/picture?type=large'
                                    };
                                    var prog = accountHelper.create(user, 'facebook');
                                    prog.then(function () {
                                        $scope.facebook_status = 2;
                                    }, function () {
                                        $scope.facebook_status = 3;
                                    });
                                }
                            });
                        }, function (data) {
                            console.log(data);
                            $scope.facebook_status = 3;
                            toast.showShortBottom('Facebook Login Error! Try Again.');
                        });

                    }, function (data) {
                        console.log('error');
                        console.log(data);
                        $scope.facebook_status = 3;
                        toast.showShortBottom('Facebook Login Error! Try Again.');
                    });
                };

                $scope.googleplay = function (model) {
                    if (typeof chrome !== 'undefined' && chrome.identity) {
                        if (model.is_play_done || model.email.length > 0) {
                        } else {
                            chrome.identity.getAuthToken({interactive: true}, function (token) {
                                console.log(token);
                                chrome.identity.getProfileUserInfo(function (email) {
                                    model.is_play_done = true;
                                    if (email) {
                                        console.log(email);
                                        model.email = email;
                                    }
                                    $scope.$apply();
                                });
                            });
                        }
                    }
                };

                $scope.google = function () {
                    if ($scope.google_status === 1) {
                        toast.showProgress();
                        return;
                    }
                    $scope.google_status = 1;
                    var api = googleLogin.startLogin();
                    api.then(function (data) {
                        var user = data;
                        if (user.gender === 'male') {
                            user.gender = 'M';
                        } else if (user.gender === 'female') {
                            user.gender = 'F';
                        } else {
                            user.gender = false;
                        }
                        var prog = accountHelper.create(user, 'google');
                        prog.then(function () {
                            $scope.google_status = 2;
                        }, function () {
                            $scope.google_status = 3;
                        });
                    }, function (err) {
                        $scope.google_status = 3;
                        toast.showShortBottom('Unknow Error!' + err);
                    });

                };

                var innerHeight = $window.innerHeight;
                $scope.padding = innerHeight * .3;
                $scope.skipIntro = function () {
                    urlHelper.openHomePage();
                };
            }
        ]);