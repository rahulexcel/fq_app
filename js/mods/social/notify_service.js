var notifyService = angular.module('NotifyMod', ['ServiceMod']);

notifyService.factory('notifyHelper', [
    'ajaxRequest', '$q', '$localStorage', '$cordovaPush', '$rootScope', '$localStorage',
    function (ajaxRequest, $q, $localStorage, $cordovaPush, $rootScope, $localStorage) {
        //parse push notification
        var service = {};
        service.delete = function (object_id) {
            var defer = $q.defer();
            var Update = Parse.Object.extend("Update");
            var query = new Parse.Query(Update);
            query.get(object_id, {
                success: function (obj) {
                    obj.destroy({
                        success: function (res) {
                            defer.resolve(res);
                        },
                        error: function () {
                            defer.reject();
                        }
                    });
                },
                error: function (object, error) {
                    defer.reject();
                }
            });
            return defer.promise;
        }
        service.getUpdate = function (user_id, count, skip) {
            if (!skip) {
                skip = 0;
            }
            var limit = 10;
            var defer = $q.defer();
            var Update = Parse.Object.extend("Update");
            var query = new Parse.Query(Update);
            query.equalTo('user_id', user_id);
            query.equalTo('read', false);
            if (count)
            {
                query.count({
                    success: function (res) {
                        defer.resolve(res);
                    },
                    error: function () {
                        defer.reject();
                    }
                });
            } else {
                query.ascending("score");
                query.limit(10);
                query.skip(skip);
                query.find({
                    success: function (res) {
                        defer.resolve(res);

                        for (var i = 0; i < res.length; i++) {
                            res.set('read', true);
                            res.save();
                        }

                    },
                    error: function () {
                        defer.reject();
                    }
                });
            }

            return defer.promise;
        };
        service.addUpdate = function (user_ids, type, data) {
            if (!angular.isArray(user_ids)) {
                user_ids = [user_ids];
            }
            var defer = $q.defer();
            if (user_ids.length == 0) {
                defer.when();
            } else {
                var Update = Parse.Object.extend("Update");
                var k = 0;
                for (var i = 0; i < user_ids.length; i++) {
                    (function (user_id) {
                        var update = new Update({
                            user_id: user_id,
                            data: data,
                            read: false,
                            time: new Date(),
                            type: type
                        });
                        update.save(null, {
                            success: function () {
                                defer.notify(user_id);
                                if (k === (user_ids.length)) {
                                    defer.resolve();
                                }
                                k++;
                            },
                            error: function () {
                                if (k === (user_ids.length)) {
                                    defer.reject();
                                }
                                k++;
                            }
                        });
                    })(user_ids[i]);
                }
            }
            return defer.promise;
        }
        service.sendAlert = function (channel, data, expiry) {

            if (!expiry) {
                expiry = 24;
            }
            expiry = new Date().getTime() + expiry * 60 * 60 * 1000;
            var defer = $q.defer();
            Parse.Push.send({
                channels: [channel],
                data: data,
                expiration_time: new Date(expiry)
            }, {
                success: function () {
                    defer.resolve();
                },
                error: function (error) {
                    console.error('send alert error ');
                    console.error(error);
                    defer.reject(error);
                }
            });
            return defer.promise;
        }
        service.unsubscribe = function (name) {
            var defer = $q.defer();
            ParsePushPlugin.unsubscribe(name, function (msg) {
                defer.resolve(msg);
            }, function (e) {
                defer.reject(e);
            });
            return defer.promise;
        }
        service.subscribe = function (name) {
            var defer = $q.defer();
            ParsePushPlugin.subscribe(name, function (msg) {
                defer.resolve(msg);
            }, function (e) {
                defer.reject(e);
            });
            return defer.promise;
        }
        service.init = function () {
            ParsePushPlugin.register({
                appId: "X5pqHF9dFQhbCxv8lQYHhH1KfXjzp2c4phg51ZPz", clientKey: "8h7pfcLqc7fefx8781bl35nQdVxRKznhGNvWOonu", eventKey: "myEventKey"}, //will trigger receivePN[pnObj.myEventKey]
            function () {
                console.log('successfully registered device!');
                if ($localStorage.user.id) {
                    ParsePushPlugin.subscribe('LoginChannel', function (msg) {
                        ParsePushPlugin.subscribe('user_' + $localStorage.user.id, function (msg) {

                        }, function (e) {

                        });
                    }, function (e) {

                    });
                }
            }, function (e) {
                console.log('error registering device: ' + e);
            });

            ParsePushPlugin.on('receivePN', function (pn) {
                console.log('yo2 i got this push notification:' + JSON.stringify(pn));
                var data = pn;
            });

//            return;
//            if (window.cordova && window.cordova.plugins) {
//                $cordovaPush.register({
//                    "senderID": "124787039157",
//                    "ecb": "onNotification"
//                }).then(function (result) {
//
//                }, function (err) {
//
//                });
//
//                $rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {
//                    switch (notification.event) {
//                        case 'registered':
//                            if (notification.regid.length > 0) {
//
//                                if ($localStorage.user.id && $localStorage.user.api_key) {
//                                    ajaxRequest.send('v1/social/gcm', {
//                                        user_id: $localStorage.user.id,
//                                        api_key: $localStorage.user.api_key,
//                                        reg_id: notification.regid
//                                    });
//                                }
//
//                                console.log('registration ID = ' + notification.regid);
//                            }
//                            break;
//
//                        case 'message':
//                            // this is the actual push notification. its format depends on the data model from the push server
//                            alert('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
//                            break;
//
//                        case 'error':
//                            alert('GCM error = ' + notification.msg);
//                            break;
//
//                        default:
//                            alert('An unknown GCM event has occurred');
//                            break;
//                    }
//                });
//            }
        }
        return service;
    }]);