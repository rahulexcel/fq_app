var notifyService = angular.module('NotifyMod', ['ServiceMod']);

notifyService.factory('notifyHelper', [
    'ajaxRequest', '$q', '$localStorage', '$cordovaPush', '$rootScope', '$timeout',
    function (ajaxRequest, $q, $localStorage, $cordovaPush, $rootScope, $timeout) {
        //parse push notification
        var service = {};
        service.init = function () {
            if (window.cordova && window.cordova.plugins) {
                $cordovaPush.register({
                    "senderID": "124787039157",
                    "ecb": "onNotification"
                }).then(function (result) {

                }, function (err) {

                });

                $rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {
                    switch (notification.event) {
                        case 'registered':
                            if (notification.regid.length > 0) {

                                if ($localStorage.user.id && $localStorage.user.api_key) {
                                    ajaxRequest.send('v1/social/gcm', {
                                        user_id: $localStorage.user.id,
                                        api_key: $localStorage.user.api_key,
                                        reg_id: notification.regid
                                    });
                                }

                                console.log('registration ID = ' + notification.regid);
                            }
                            break;

                        case 'message':
                            // this is the actual push notification. its format depends on the data model from the push server
                            alert('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
                            break;

                        case 'error':
                            alert('GCM error = ' + notification.msg);
                            break;

                        default:
                            alert('An unknown GCM event has occurred');
                            break;
                    }
                });
            }
        }
        return service;
    }]);