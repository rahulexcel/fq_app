var notifyService = angular.module('NotifyMod', ['ServiceMod']);

notifyService.factory('notifyHelper', [
    'ajaxRequest', '$q', '$localStorage', '$cordovaPush', '$rootScope', '$localStorage',
    function (ajaxRequest, $q, $localStorage, $cordovaPush, $rootScope, $localStorage) {
        //parse push notification
        var service = {};
        service.init = function () {
            if ($localStorage.user.id) {
                ParsePushPlugin.register({
                    appId: "X5pqHF9dFQhbCxv8lQYHhH1KfXjzp2c4phg51ZPz", clientKey: "8h7pfcLqc7fefx8781bl35nQdVxRKznhGNvWOonu", eventKey: "myEventKey"}, //will trigger receivePN[pnObj.myEventKey]
                function () {
                    console.log('successfully registered device!');
                    ParsePushPlugin.subscribe('LoginChannel', function (msg) {
                        ParsePushPlugin.subscribe('user_' + $localStorage.user.id, function (msg) {

                        }, function (e) {

                        });
                    }, function (e) {

                    });
                }, function (e) {
                    console.log('error registering device: ' + e);
                });
            }

            ParsePushPlugin.on('receivePN', function (pn) {
                alert('yo i got this push notification:' + JSON.stringify(pn));
            });


            return;
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