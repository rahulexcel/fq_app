
angular.module('ngCordova', [
    'ngCordova.plugins'
]);

angular.module('ngCordova.plugins', [
    'ngCordova.plugins.camera',
    'ngCordova.plugins.device',
    'ngCordova.plugins.ga',
    'ngCordova.plugins.network',
    'ngCordova.plugins.socialSharing',
    'ngCordova.plugins.splashscreen',
    'ngCordova.plugins.appVersion',
    'ngCordova.plugins.push',
    'ngCordova.plugins.dialogs'
]);

// install   :     cordova plugin add org.apache.cordova.dialogs
// link      :     https://github.com/apache/cordova-plugin-dialogs/blob/master/doc/index.md

angular.module('ngCordova.plugins.dialogs', [])

        .factory('$cordovaDialogs', ['$q', '$window', function ($q, $window) {

                return {
                    alert: function (message, title, buttonName) {
                        var q = $q.defer();

                        if (!$window.navigator.notification) {
                            $window.alert(message);
                            q.resolve();
                        }
                        else {
                            navigator.notification.alert(message, function () {
                                q.resolve();
                            }, title, buttonName);
                        }

                        return q.promise;
                    },
                    confirm: function (message, title, buttonLabels) {
                        var q = $q.defer();

                        if (!$window.navigator.notification) {
                            if ($window.confirm(message)) {
                                q.resolve(1);
                            }
                            else {
                                q.resolve(2);
                            }
                        }
                        else {
                            navigator.notification.confirm(message, function (buttonIndex) {
                                q.resolve(buttonIndex);
                            }, title, buttonLabels);
                        }

                        return q.promise;
                    },
                    prompt: function (message, title, buttonLabels, defaultText) {
                        var q = $q.defer();

                        if (!$window.navigator.notification) {
                            var res = $window.prompt(message, defaultText);
                            if (res !== null) {
                                q.resolve({input1: res, buttonIndex: 1});
                            }
                            else {
                                q.resolve({input1: res, buttonIndex: 2});
                            }
                        }
                        else {
                            navigator.notification.prompt(message, function (result) {
                                q.resolve(result);
                            }, title, buttonLabels, defaultText);
                        }
                        return q.promise;
                    },
                    beep: function (times) {
                        return navigator.notification.beep(times);
                    }
                };
            }]);



// install   :      cordova plugin add https://github.com/phonegap-build/PushPlugin.git
// link      :      https://github.com/phonegap-build/PushPlugin

angular.module('ngCordova.plugins.push', [])
        .factory('$cordovaPush', ['$q', '$window', '$rootScope', '$timeout', function ($q, $window, $rootScope, $timeout) {
                return {
                    onNotification: function (notification) {
                        $timeout(function () {
                            $rootScope.$broadcast('$cordovaPush:notificationReceived', notification);
                        });
                    },
                    register: function (config) {
                        var q = $q.defer();
                        var injector;
                        if (config !== undefined && config.ecb === undefined) {
                            if (angular.element(document.querySelector('[ng-app]')) === undefined) {
                                injector = "document.body";
                            }
                            else {
                                injector = "document.querySelector('[ng-app]')";
                            }
                            config.ecb = "angular.element(" + injector + ").injector().get('$cordovaPush').onNotification";
                        }

                        $window.plugins.pushNotification.register(function (token) {
                            q.resolve(token);
                        }, function (error) {
                            q.reject(error);
                        }, config);

                        return q.promise;
                    },
                    unregister: function (options) {
                        var q = $q.defer();
                        $window.plugins.pushNotification.unregister(function (result) {
                            q.resolve(result);
                        }, function (error) {
                            q.reject(error);
                        }, options);

                        return q.promise;
                    },
                    // iOS only
                    setBadgeNumber: function (number) {
                        var q = $q.defer();
                        $window.plugins.pushNotification.setApplicationIconBadgeNumber(function (result) {
                            q.resolve(result);
                        }, function (error) {
                            q.reject(error);
                        }, number);
                        return q.promise;
                    }
                };
            }]);


//#### Begin Individual Plugin Code ####

// install   :   cordova plugin add org.apache.cordova.camera
// link      :   https://github.com/apache/cordova-plugin-camera/blob/master/doc/index.md#orgapachecordovacamera

angular.module('ngCordova.plugins.camera', [])

        .factory('$cordovaCamera', ['$q', function ($q) {

                return {
                    getPicture: function (options) {
                        var q = $q.defer();

                        if (!navigator.camera) {
                            q.resolve(null);
                            return q.promise;
                        }

                        navigator.camera.getPicture(function (imageData) {
                            q.resolve(imageData);
                        }, function (err) {
                            q.reject(err);
                        }, options);

                        return q.promise;
                    },
                    cleanup: function () {
                        var q = $q.defer();

                        navigator.camera.cleanup(function () {
                            q.resolve();
                        }, function (err) {
                            q.reject(err);
                        });

                        return q.promise;
                    }
                };
            }]);
// install   :     cordova plugin add org.apache.cordova.device
// link      :     https://github.com/apache/cordova-plugin-device/blob/master/doc/index.md

angular.module('ngCordova.plugins.device', [])

        .factory('$cordovaDevice', [function () {

                return {
                    /**
                     * Returns the whole device object.
                     * @see https://github.com/apache/cordova-plugin-device/blob/master/doc/index.md
                     * @returns {Object} The device object.
                     */
                    getDevice: function () {
                        return device;
                    },
                    /**
                     * Returns the Cordova version.
                     * @see https://github.com/apache/cordova-plugin-device/blob/master/doc/index.md#devicecordova
                     * @returns {String} The Cordova version.
                     */
                    getCordova: function () {
                        return device.cordova;
                    },
                    /**
                     * Returns the name of the device's model or product.
                     * @see https://github.com/apache/cordova-plugin-device/blob/master/doc/index.md#devicemodel
                     * @returns {String} The name of the device's model or product.
                     */
                    getModel: function () {
                        return device.model;
                    },
                    /**
                     * @deprecated device.name is deprecated as of version 2.3.0. Use device.model instead.
                     * @returns {String}
                     */
                    getName: function () {
                        return device.name;
                    },
                    /**
                     * Returns the device's operating system name.
                     * @see https://github.com/apache/cordova-plugin-device/blob/master/doc/index.md#deviceplatform
                     * @returns {String} The device's operating system name.
                     */
                    getPlatform: function () {
                        return device.platform;
                    },
                    /**
                     * Returns the device's Universally Unique Identifier.
                     * @see https://github.com/apache/cordova-plugin-device/blob/master/doc/index.md#deviceuuid
                     * @returns {String} The device's Universally Unique Identifier
                     */
                    getUUID: function () {
                        return device.uuid;
                    },
                    /**
                     * Returns the operating system version.
                     * @see https://github.com/apache/cordova-plugin-device/blob/master/doc/index.md#deviceversion
                     * @returns {String}
                     */
                    getVersion: function () {
                        return device.version;
                    }
                };
            }]);
// install   :     cordova plugin add https://github.com/phonegap-build/GAPlugin.git
// link      :     https://github.com/phonegap-build/GAPlugin

angular.module('ngCordova.plugins.ga', [])

        .factory('$cordovaGA', ['$q', '$window', function ($q, $window) {

                return {
                    init: function (id, mingap) {
                        var q = $q.defer();
                        mingap = (mingap >= 0) ? mingap : 10;
                        $window.plugins.gaPlugin.init(function (result) {
                            q.resolve(result);
                        },
                                function (error) {
                                    q.reject(error);
                                },
                                id, mingap);
                        return q.promise;
                    },
                    trackEvent: function (success, fail, category, eventAction, eventLabel, eventValue) {
                        var q = $q.defer();
                        $window.plugins.gaPlugin.trackEvent(function (result) {
                            q.resolve(result);
                        },
                                function (error) {
                                    q.reject(error);
                                },
                                category, eventAction, eventLabel, eventValue);
                        return q.promise;
                    },
                    trackPage: function (success, fail, pageURL) {
                        var q = $q.defer();
                        $window.plugins.gaPlugin.trackPage(function (result) {
                            q.resolve(result);
                        },
                                function (error) {
                                    q.reject(error);
                                },
                                pageURL);
                        return q.promise;
                    },
                    setVariable: function (success, fail, index, value) {
                        var q = $q.defer();
                        $window.plugins.gaPlugin.setVariable(function (result) {
                            q.resolve(result);
                        },
                                function (error) {
                                    q.reject(error);
                                },
                                index, value);
                        return q.promise;
                    },
                    exit: function (success, fail) {
                        var q = $q.defer();
                        $window.plugins.gaPlugin.exit(function (result) {
                            q.resolve(result);
                        },
                                function (error) {
                                    q.reject(error);
                                });
                        return q.promise;
                    }
                };
            }]);
// install   :      cordova plugin add org.apache.cordova.network-information
// link      :      https://github.com/apache/cordova-plugin-network-information/blob/master/doc/index.md

angular.module('ngCordova.plugins.network', [])

        .factory('$cordovaNetwork', ['$rootScope', '$document', function ($rootScope, $document) {

                return {
                    getNetwork: function () {
                        return navigator.connection.type;
                    },
                    isOnline: function () {
                        var networkState = navigator.connection.type;
                        return networkState !== Connection.UNKNOWN && networkState !== Connection.NONE;
                    },
                    isOffline: function () {
                        var networkState = navigator.connection.type;
                        return networkState === Connection.UNKNOWN || networkState === Connection.NONE;
                    },
                    watchOffline: function () {
                        document.addEventListener("offline", function () {
                            var networkState = navigator.connection.type;
                            $rootScope.$apply(function () {
                                $rootScope.$broadcast('networkOffline', networkState);
                            });
                        }, false);
                    },
                    watchOnline: function () {
                        document.addEventListener("online", function () {
                            var networkState = navigator.connection.type;
                            $rootScope.$apply(function () {
                                $rootScope.$broadcast('networkOnline', networkState);
                            });
                        }, false);
                    },
                    clearOfflineWatch: function () {
                        document.removeEventListener("offline", function () {
                            $rootScope.$$listeners.networkOffline = []; // not clearing watch --broken clear
                        }, false);
                    },
                    clearOnlineWatch: function () {
                        document.removeEventListener("online", function () {
                            $rootScope.$$listeners.networkOnline = []; // not clearing watch --broken clear
                        }, false);
                    }
                };
            }]);

// install   :      cordova plugin add https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin.git
// link      :      https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin

// NOTE: shareViaEmail -> if user cancels sharing email, success is still called
// TODO: add support for iPad

angular.module('ngCordova.plugins.socialSharing', [])

        .factory('$cordovaSocialSharing', ['$q', '$window', function ($q, $window) {

                return {
                    share: function (message, subject, file, link) {
                        var q = $q.defer();
                        $window.plugins.socialsharing.share(message, subject, file, link,
                                function () {
                                    q.resolve(true);
                                },
                                function () {
                                    q.reject(false);
                                });
                        return q.promise;
                    },
                    shareViaTwitter: function (message, file, link) {
                        var q = $q.defer();
                        $window.plugins.socialsharing.shareViaTwitter(message, file, link,
                                function () {
                                    q.resolve(true);
                                },
                                function () {
                                    q.reject(false);
                                });
                        return q.promise;
                    },
                    shareViaWhatsApp: function (message, file, link) {
                        var q = $q.defer();
                        $window.plugins.socialsharing.shareViaWhatsApp(message, file, link,
                                function () {
                                    q.resolve(true);
                                },
                                function () {
                                    q.reject(false);
                                });
                        return q.promise;
                    },
                    shareViaFacebook: function (message, file, link) {
                        var q = $q.defer();
                        $window.plugins.socialsharing.shareViaFacebook(message, file, link,
                                function () {
                                    q.resolve(true);
                                },
                                function () {
                                    q.reject(false);
                                });
                        return q.promise;
                    },
                    shareViaSMS: function (message, commaSeparatedPhoneNumbers) {
                        var q = $q.defer();
                        $window.plugins.socialsharing.shareViaSMS(message, commaSeparatedPhoneNumbers,
                                function () {
                                    q.resolve(true);
                                },
                                function () {
                                    q.reject(false);
                                });
                        return q.promise;
                    },
                    shareViaEmail: function (message, subject, toArr, ccArr, bccArr, fileArr) {
                        var q = $q.defer();
                        $window.plugins.socialsharing.shareViaEmail(message, subject, toArr, ccArr, bccArr, fileArr,
                                function () {
                                    q.resolve(true);
                                },
                                function () {
                                    q.reject(false);
                                });
                        return q.promise;
                    },
                    canShareViaEmail: function () {
                        var q = $q.defer();
                        $window.plugins.socialsharing.canShareViaEmail(
                                function () {
                                    q.resolve(true);
                                },
                                function () {
                                    q.reject(false);
                                });
                        return q.promise;
                    },
                    canShareVia: function (via, message, subject, file, link) {
                        var q = $q.defer();
                        $window.plugins.socialsharing.canShareVia(via, message, subject, file, link,
                                function (success) {
                                    q.resolve(success);
                                },
                                function (error) {
                                    q.reject(error);
                                });
                        return q.promise;
                    },
                    shareVia: function (via, message, subject, file, link) {
                        var q = $q.defer();
                        $window.plugins.socialsharing.shareVia(via, message, subject, file, link,
                                function () {
                                    q.resolve(true);
                                },
                                function () {
                                    q.reject(false);
                                });
                        return q.promise;
                    }

                };
            }]);
// install   :      cordova plugin add org.apache.cordova.splashscreen
// link      :      https://github.com/apache/cordova-plugin-splashscreen/blob/master/doc/index.md

angular.module('ngCordova.plugins.splashscreen', [])

        .factory('$cordovaSplashscreen', [function () {

                return {
                    hide: function () {
                        return navigator.splashscreen.hide();
                    },
                    show: function () {
                        return navigator.splashscreen.show();
                    }
                };

            }]);


// install   :     cordova plugin add https://github.com/whiteoctober/cordova-plugin-app-version.git
// link      :     https://github.com/whiteoctober/cordova-plugin-app-version

angular.module('ngCordova.plugins.appVersion', [])

        .factory('$cordovaAppVersion', ['$q', function ($q) {

                return {
                    getAppVersion: function () {
                        var q = $q.defer();
                        cordova.getAppVersion(function (version) {
                            q.resolve(version);
                        });

                        return q.promise;
                    }
                };
            }]);

