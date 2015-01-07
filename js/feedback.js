var feedbackMod = angular.module('FeedbackMod',
        ['ServiceMod', 'ngStorage', 'ngCordova']);

feedbackMod.controller('FeedbackCtrl',
        ['$scope', '$localStorage', 'toast', 'ajaxRequest', '$cordovaDevice', '$cordovaAppVersion',
            function ($scope, $localStorage, toast, ajaxRequest, $cordovaDevice, $cordovaAppVersion, $cordovaAppRate) {
                $scope.feedback = {
                    text: '',
                    email: ''
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

                $scope.rateUs = function () {
                    $cordovaAppRate.promptForRating(true).then(function (result) {

                    });
                }


                $scope.sendFeedback = function () {
                    if ($scope.feedback.text.length > 0 && $scope.feedback.email.length > 0) {
                        $scope.feedback_status = 1;
                        var ajax = ajaxRequest.send('v1/feedback/add', {
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
                    }
                }

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