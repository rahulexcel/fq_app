var registerMod = angular.module('RegisterMod', ['GoogleLoginService', 'AccountService', 'ServiceMod', 'ngStorage']);

//cordova -d plugin add C:\xampp\htdocs\facebook-plugin -variable APP_ID="765213543516434" --variable APP_NAME="FashionIQ"


registerMod.controller('RegisterCtrl',
        ['$scope', '$localStorage', '$location', 'toast', 'googleLogin', 'accountHelper',
            function ($scope, $localStorage, $location, toast, googleLogin, accountHelper) {
                if (!$localStorage.user) {
                    $localStorage.user = {};
                    $localStorage.user.email = '';
                } else {

                    if ($localStorage.user.id) {
                        $location.path('/app/home');
                        return;
                    }

                }
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
                }
                $scope.google_status = 0;
                $scope.facebook_status = 0;
                $scope.login_status = 0;
                $scope.register_status = 0;
                $scope.forgot_status = 0;

                $scope.$watch('register_obj.email', function (value) {
                    if (value) {
                        $scope.login_obj.email = value;
                        $scope.forgot_obj.email = value;
                    }
                })
                $scope.$watch('login_obj.email', function (value) {
                    if (value) {
                        $scope.register_obj.email = value;
                        $scope.forgot_obj.email = value;
                    }
                })
                $scope.$watch('forgot_obj.email', function (value) {
                    if (value) {
                        $scope.login_obj.email = value;
                        $scope.register_obj.email = value;
                    }
                })

                $scope.show_register = true;
                $scope.show_login = false;
                $scope.show_forgot = false;

                $scope.showForgot = function () {
                    $scope.show_register = false;
                    $scope.show_login = false;
                    $scope.show_forgot = true;
                }
                $scope.showRegister = function () {
                    $scope.show_register = true;
                    $scope.show_login = false;
                    $scope.show_forgot = false;
                }
                $scope.showLogin = function () {
                    $scope.show_register = false;
                    $scope.show_login = true;
                    $scope.show_forgot = false;
                }
                $scope.forgot = function () {
                    var email = $scope.forgot_obj.email;
                    if (email.length > 0) {

                    } else {
                        toast.showShortBottom('All Fields Required');
                    }
                }

                $scope.login = function () {
                    var email = $scope.login_obj.email;
                    var password = $scope.login_obj.password;
                    if (email.length > 0 && password.length > 0) {
                        if ($scope.login_status == 1)
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
                        var prog = accountHelper.create(user);
                        prog.then(function () {
                            $scope.login_status = 2;
                        }, function () {
                            $scope.login_status = 3;
                        });
                    } else {
                        toast.showShortBottom('All Fields Required');
                    }
                }
                $scope.create = function () {
                    var email = $scope.register_obj.email;
                    var password = $scope.register_obj.password;
                    var name = $scope.register_obj.name;
                    if (email.length > 0 && password.length > 0 && name.length > 0) {
                        if ($scope.register_status == 1) {
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
                        var prog = accountHelper.create(user);
                        prog.then(function () {
                            $scope.register_status = 2;
                        }, function () {
                            $scope.register_status = 3;
                        });
                    } else {
                        toast.showShortBottom('All Fields Required');
                    }
                }
                $scope.facebook = function () {
                    if (window.cordova.platformId == "browser") {
                        facebookConnectPlugin.browserInit('765213543516434');
                    }
                    facebookConnectPlugin.login(['email'], function (data) {
                        console.log(data);
                        facebookConnectPlugin.api('/me', ['email'], function (data) {
                            if ($scope.facebook_status == 1) {
                                toast.showProgress();
                                return;
                            }
                            $scope.facebook_status = 1;
                            var fb_id = data.id;
                            var email = data.email;
                            var firstname = data.first_name;
                            var lastname = data.last_name;
                            var gender = data.gender;
                            if (gender == 'male') {
                                gender = 'M';
                            } else if (gender == 'female') {
                                gender = 'F';
                            } else {
                                gender = false;
                            }
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
                                var prog = accountHelper.create(user);
                                prog.then(function () {
                                    $scope.facebook_status = 2;
                                }, function () {
                                    $scope.facebook_status = 3;
                                });
                            }
                        }, function (data) {
                            console.log('error2');
                            console.log(data);
                            toast.showShortBottom('Facebook Login Error! Try Again.');
                        })

                    }, function (data) {
                        console.log('error');
                        console.log(data);
                        toast.showShortBottom('Facebook Login Error! Try Again.');
                    })
                }

                $scope.google = function () {
                    if (typeof chrome != 'undefined' && chrome.identity) {
                        if ($scope.google_status == 1) {
                            toast.showProgress();
                            return;
                        }
                        $scope.google_status = 1;
                        chrome.identity.getAuthToken({interactive: true}, function (token) {
                            console.log(token);
                            chrome.identity.getProfileUserInfo(function (email) {
                                if (email) {
                                    console.log(email);
                                    var user = {
                                        name: 'XXX',
                                        gender: false,
                                        email: email,
                                        google_play: true,
                                        picture: ''
                                    };
                                    var prog = accountHelper.create(user);
                                    prog.then(function () {
                                        $scope.google_status = 2;
                                    }, function () {
                                        $scope.google_status = 3;
                                    });
                                } else {
                                    var api = googleLogin.startLogin();
                                    api.then(function (data) {
                                        var user = data;
                                        var prog = accountHelper.create(user);
                                        prog.then(function () {
                                            $scope.google_status = 2;
                                        }, function () {
                                            $scope.google_status = 3;
                                        });
                                    }, function (err) {
                                        toast.showShortBottom('Unknow Error!' + err);
                                    });
                                }
                            });
                        });
                    } else {
                        if ($scope.google_status == 1) {
                            toast.showProgress();
                            return;
                        }
                        $scope.google_status = 1;
                        var api = googleLogin.startLogin();
                        api.then(function (data) {
                            var user = data;
                            if (user.gender == 'male') {
                                user.gender = 'M';
                            } else if (user.gender == 'female') {
                                user.gender = 'F';
                            } else {
                                user.gender = false;
                            }
                            var prog = accountHelper.create(user);
                            prog.then(function () {
                                $scope.google_status = 2;
                            }, function () {
                                $scope.google_status = 3;
                            });
                        }, function (err) {
                            toast.showShortBottom('Unknow Error!' + err);
                        });
                    }
                }
                
            }
        ]);