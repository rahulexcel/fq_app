var notifyService = angular.module('NotifyMod', ['ServiceMod']);

notifyService.factory('notifyHelper', [
    '$q', '$localStorage', '$rootScope', '$localStorage', '$ionicPlatform', '$timeout',
    function ($q, $localStorage, $rootScope, $localStorage, $ionicPlatform, $timeout) {
        //parse push notification
        var service = {};
        service.continueUpdate = true;
        service.doUpdates = function () {
            var self = this;
            if ($localStorage.user.id && this.continueUpdate) {
                var ajax = this.getUpdate($localStorage.user.id, true);
                ajax.then(function (count) {
                    $rootScope.profile_update = count;
                    $timeout(function () {
                        self.doUpdates();
                    }, 10000);
                });
            }
        };
        service.checkForUpdates = function () {
            var self = this;
            self.doUpdates();
            $ionicPlatform.on('pause', function () {
                self.continueUpdate = false;
            });
            $ionicPlatform.on('resume', function () {
                self.continueUpdate = true;
                self.doUpdates();
            });
            $ionicPlatform.on('online', function () {
                self.continueUpdate = true;
                self.doUpdates();
            });
            $ionicPlatform.on('offline', function () {
                self.continueUpdate = false;
                self.doUpdates();
            });
        };
        service.delete = function (object_id) {
            this.parseInit();
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
        };
        service.getUpdate = function (user_id, count, skip) {
            this.parseInit();
            if (!skip) {
                skip = 0;
            }
            var limit = 10;
            var defer = $q.defer();
            var Update = Parse.Object.extend("Update");
            var query = new Parse.Query(Update);
            query.equalTo('user_id', user_id);
            if (count)
            {
                query.equalTo('read', false);
                query.count({
                    success: function (res) {
                        defer.resolve(res);
                    },
                    error: function () {
                        defer.reject();
                    }
                });
            } else {
                query.descending("time");
                query.limit(limit);
                query.skip(skip);
                query.find({
                    success: function (res) {
                        var ret = [];
                        for (var i = 0; i < res.length; i++) {
                            ret.push({
                                id: res[i].id,
                                user_id: res[i].get('user_id'),
                                data: res[i].get('data'),
                                read: res[i].get('read'),
                                time: res[i].get('time'),
                                type: res[i].get('type')
                            });
                            if (!res[i].get('read')) {
                                res[i].set('read', true);
                                res[i].save();
                            }
                        }
                        defer.resolve(ret);
                    },
                    error: function () {
                        defer.reject();
                    }
                });
            }

            return defer.promise;
        };
        service.addUpdate = function (user_ids, type, data) {
            this.parseInit();
            if (!angular.isArray(user_ids)) {
                user_ids = [user_ids];
            }
            var defer = $q.defer();
            if (user_ids.length === 0) {
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
        };
        service.sendAlert = function (channel, data, expiry) {
            this.parseInit();
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
        };
        service.unsubscribe = function (name) {
            this.parseInit();
            var defer = $q.defer();
            if (typeof ParsePushPlugin === 'undefined') {
                defer.reject();
            } else {
                ParsePushPlugin.unsubscribe(name, function (msg) {
                    defer.resolve(msg);
                }, function (e) {
                    defer.reject(e);
                });
            }
            return defer.promise;
        };
        service.subscribe = function (name) {
            this.parseInit();
            var defer = $q.defer();
            if (typeof ParsePushPlugin === 'undefined') {
                defer.reject();
            } else {
                ParsePushPlugin.subscribe(name, function (msg) {
                    defer.resolve(msg);
                }, function (e) {
                    defer.reject(e);
                });
            }
            return defer.promise;
        };
        service.init_done = false;
        service.parseInit = function () {
            if (!this.init_done) {
                Parse.initialize('X5pqHF9dFQhbCxv8lQYHhH1KfXjzp2c4phg51ZPz', 'wjP6ghTt3b6dJ7lyrzIinTLMNe3fW6vy3LafCyVs');
                this.init_done = true;
            }
        };
        service.init = function () {
            this.doUpdates();
            this.parseInit();
            if (typeof ParsePushPlugin === 'undefined') {
                return;
            }
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
        };
        return service;
    }]);