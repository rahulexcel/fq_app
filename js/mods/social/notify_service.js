var notifyService = angular.module('NotifyMod', ['ServiceMod']);
notifyService.factory('notifyHelper', [
    '$q', '$localStorage', '$rootScope', '$localStorage', '$ionicPlatform', '$timeout', '$cordovaPush', 'ajaxRequest', '$cordovaAppVersion', '$cordovaDevice', '$ionicPopup', '$location',
    function ($q, $localStorage, $rootScope, $localStorage, $ionicPlatform, $timeout, $cordovaPush, ajaxRequest, $cordovaAppVersion, $cordovaDevice, $ionicPopup, $location) {
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
                    }, 60000);
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
                            console.log('deleted');
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
                            var profile_update = $rootScope.profile_update;
                            if (!res[i].get('read')) {
                                res[i].set('read', true);
                                res[i].save();
                                profile_update--;
                                if (profile_update < 0) {
                                    profile_update = 0;
                                }
                            }
                            $rootScope.profile_update = profile_update;
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
            expiry = expiry * 60 * 60;
            data.time = new Date().getTime();
            return ajaxRequest.send('v1/notify/alert', {
                user_id: channel.replace('user_', ''),
                expiry: expiry,
                data: data
            });
//            expiry = new Date().getTime() + expiry * 1000;
//            var defer = $q.defer();
//            Parse.Push.send({
//                channels: [channel],
//                data: data,
//                expiration_time: new Date(expiry)
//            }, {
//                success: function () {
//                    defer.resolve();
//                },
//                error: function (error) {
//                    console.error('send alert error ');
//                    console.error(error);
//                    defer.reject(error);
//                }
//            });
//            return defer.promise;
        };
        service.unsubscribe = function (name) {
//            this.parseInit();
//            var defer = $q.defer();
//            if (typeof ParsePushPlugin === 'undefined') {
//                defer.reject();
//            } else {
//                ParsePushPlugin.unsubscribe(name, function (msg) {
//                    defer.resolve(msg);
//                }, function (e) {
//                    defer.reject(e);
//                });
//            }
//            return defer.promise;
        };
        service.subscribe = function (name) {
//            this.parseInit();
//            var defer = $q.defer();
//            if (typeof ParsePushPlugin === 'undefined') {
//                defer.reject();
//            } else {
//                ParsePushPlugin.subscribe(name, function (msg) {
//                    defer.resolve(msg);
//                }, function (e) {
//                    defer.reject(e);
//                });
//            }
//            return defer.promise;
        };
        service.init_done = false;
        service.parseInit = function () {
            if (!this.init_done) {
                Parse.initialize('X5pqHF9dFQhbCxv8lQYHhH1KfXjzp2c4phg51ZPz', 'wjP6ghTt3b6dJ7lyrzIinTLMNe3fW6vy3LafCyVs');
                this.init_done = true;
            }
        };
        service.openItem = function (row) {
            if (row.type === 'add_friend' || row.type === 'accept_friend' || row.type === 'decline_friend') {
                $location.path('/app/profile/' + row.user.id + '/friends');
            } else if (row.type === 'item_unlike' || row.type === 'item_like') {
                if (row.data.item_id) {
                    $location.path('/app/item/' + row.data.item_id._id + "/" + row.data.list_id._id);
                } else {
                    $location.path('/app/item/' + row.data.data.item_id._id + "/" + row.data.data.list_id._id);
                }
            } else if (row.type === 'follow_user') {
                $location.path('/app/profile/' + row.user.id + '/mine');
            } else if (row.type === 'unfollow_user') {
                $location.path('/app/profile/' + row.user.id + '/mine');
            } else if (row.type === 'follow_list') {
                $location.path('/app/wishlist_item/' + row.data.list._id + "/" + row.data.list.name);
            } else if (row.type === 'unfollow_list') {
                $location.path('/app/wishlist_item/' + row.data.list._id + "/" + row.data.list.name);
            } else if (row.type === 'item_comment') {
                if (row.data.data.item_id) {
                    $location.path('/app/item/' + row.data.data.item_id._id + "/" + row.data.data.list_id._id);
                } else {
                    $location.path('/app/item/' + row.data.data.data.item_id._id + "/" + row.data.data.data.list_id._id);
                }
            } else if (row.type === 'item_add_user' || row.type === 'item_add') {
                $location.path('/app/item/' + row.data.data.wishlist_model._id + "/" + row.data.data.list_id._id);
            } else if (row.type === 'item_like' || row.type === 'item_unlike') {
                $location.path('/app/item/' + row.data.data.data.item_id._id + "/" + row.data.data.data.list_id._id);
            } else if (row.type === 'list_created' || row.type === 'list_left') {
                $location.path('/app/wishlist_item/' + row.list._id + "/" + row.list.name);
            }
        };
        service.init = function () {
            this.doUpdates();
            this.parseInit();
//            this.sendAlert('54ac08520167b1f12f7453f8', {
//                title: 'Test Title',
//                message: 'Test Message',
//                meta: {
//                    user: $localStorage.user,
//                    type: 'add_friend'
//                },
//                bigPicture: 'http://graph.facebook.com/manisharies.iitg/picture?type=large'
//            });

//if (typeof ParsePushPlugin === 'undefined') {
//                return;
//            }
//            ParsePushPlugin.register({
//                appId: "X5pqHF9dFQhbCxv8lQYHhH1KfXjzp2c4phg51ZPz", clientKey: "8h7pfcLqc7fefx8781bl35nQdVxRKznhGNvWOonu", eventKey: "myEventKey"}, //will trigger receivePN[pnObj.myEventKey]
//            function () {
//                console.log('successfully registered device!');
//                if ($localStorage.user.id) {
//                    ParsePushPlugin.subscribe('LoginChannel', function (msg) {
//                        ParsePushPlugin.subscribe('user_' + $localStorage.user.id, function (msg) {
//
//                        }, function (e) {
//
//                        });
//                    }, function (e) {
//
//                    });
//                }
//            }, function (e) {
//                console.log('error registering device: ' + e);
//            });
//
//            ParsePushPlugin.on('receivePN', function (pn) {
//                console.log('yo2 i got this push notification:' + JSON.stringify(pn));
//                var data = pn;
//            });

//            return;


            if (window.cordova && window.cordova.plugins) {
                $cordovaPush.register({
                    "senderID": "124787039157"
                }).then(function (result) {

                }, function (err) {

                });
                $rootScope.$on('$cordovaPush:notificationReceived', function (event, notification) {
                    switch (notification.event) {
                        case 'registered':
                            if (notification.regid.length > 0) {
                                if ($localStorage.user.id) {
                                    var device = {
                                        cordova: $cordovaDevice.getCordova(),
                                        model: $cordovaDevice.getModel(),
                                        platform: $cordovaDevice.getPlatform(),
                                        version: $cordovaDevice.getVersion()
                                    };
                                    $cordovaAppVersion.getAppVersion().then(function (version) {
                                        device.appVersion = version;
                                        ajaxRequest.send('v1/notify/register', {
                                            user_id: $localStorage.user.id,
                                            reg_id: notification.regid,
                                            device: device
                                        });
                                    });
                                }

                                console.log('registration ID = ' + notification.regid);
                            }
                            break;
                        case 'message':
                            console.log(notification);
                            var meta = notification.payload.meta;
                            $timeout(function () {
                                service.openItem(meta);
                            });
                            // this is the actual push notification. its format depends on the data model from the push server
//                            alert('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
                            break;
                        case 'error':
                            console.log('GCM error = ' + notification.msg);
                            break;
                        default:
                            console.log('An unknown GCM event has occurred');
                            break;
                    }
                });
            }
        };
        return service;
    }]);