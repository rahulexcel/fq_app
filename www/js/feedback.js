var feedbackMod = angular.module('FeedbackMod',
        ['ServiceMod', 'ngStorage', 'ngCordova']);

feedbackMod.controller('FeedbackCtrl',
        ['$scope', '$localStorage', 'toast', 'ajaxRequest', '$ionicHistory', '$cordovaDevice', '$cordovaAppVersion', '$rootScope',
            function ($scope, $localStorage, toast, ajaxRequest, $ionicHistory, $cordovaDevice, $cordovaAppVersion, $rootScope) {
                var self = this;
                self.init = function () {
                    $scope.feedback = {
                        text: '',
                        email: ''
                    };
                    $rootScope.$ionicGoBack = function (backCount) {
                        window.history.back();
                    };
                    if ($localStorage.user && $localStorage.user.email) {
                        $scope.feedback.email = $localStorage.user.email;
                    }
                    $scope.device = {
                        device: 'Desktop'
                    };
                    $scope.isMobile = false;
                    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                        $scope.isMobile = true;
                    }
                    $scope.isAndroid = true;
                    if (ionic.Platform.isIOS()) {
                        $scope.isAndroid = false;
                    }
                };
                self.init();
                $rootScope.$on("$ionicView.enter", function () {
                    self.init();
                });

                $scope.hasEmail = false;

                if (window.cordova && window.cordova.plugins && window.cordova.plugins.email) {
                    cordova.plugins.email.isAvailable(function (isAvailable) {
                        $scope.hasEmail = isAvailable;
                    });
                }

                if (typeof AppRate !== "undefined") {
                    AppRate.preferences.storeAppURL.android = 'market://details?id=com.excellence.fashioniq';
                    AppRate.preferences.storeAppURL.ios = '993157104';
                }

                $scope.rateUs = function () {
                    if (typeof AppRate !== "undefined") {
                        AppRate.navigateToAppStore();
                    } else {
                        window.open('https://play.google.com/store/apps/details?id=com.excellence.fashioniq&hl=en', '_system');
                    }
                };

                $scope.sendEmailFeedback = function () {
                    cordova.plugins.email.open({
                        app: 'gmail',
                        to: 'manish@fashioniq.in', // email addresses for TO field
                        cc: 'manish@excellencetechnologies.in', // email addresses for CC field
                        subject: 'Feedback For FashionIQ App',
                        isHtml: true, // indicats if the body is HTML or plain text,
                        attachments: ['base64:device.json//' + btoa(JSON.stringify($scope.device)), 'base64:user.json//' + btoa(JSON.stringify($localStorage.user))]
                    });
                };
                $scope.sendFeedback = function (form) {
                    console.log($scope.feedback_form)
                    if (form.$valid) {
                        if ($scope.feedback.text.length > 0 && $scope.feedback.email.length > 0) {
                            $scope.feedback_status = 1;
                            var ajax = ajaxRequest.send('v2/feedback/add', {
                                feedback: angular.copy($scope.feedback),
                                device: angular.copy($scope.device)
                            });
                            ajax.then(function () {
                                $scope.feedback_status = 2;
                                toast.showShortBottom('Thanks For Your Valuable Feedback!');
                                if ($scope.isMobile) {
                                    $scope.rateUs();
                                }
                            }, function () {
                                $scope.feedback_status = 2;
                            });
                        } else {
                            toast.showShortBottom('Fill Up All Fields');
                            $scope.feedback_status = 3;
                        }
                    } else {
                        form.submitted = true;
                        toast.showShortBottom('Please enter valid emailId');
                        $scope.feedback_status = 3;
                    }
                };

                if ($scope.isMobile) {
                    $scope.device = {
                        device: $cordovaDevice.getDevice(),
                        cordova: $cordovaDevice.getCordova(),
                        model: $cordovaDevice.getModel(),
                        platform: $cordovaDevice.getPlatform(),
                        uuid: $cordovaDevice.getUUID(),
                        version: $cordovaDevice.getVersion()
                    };
                    $cordovaAppVersion.getAppVersion().then(function (version) {
                        $scope.device.appVersion = version;
                    });
                }
            }
        ]);


/*
 * 
 */