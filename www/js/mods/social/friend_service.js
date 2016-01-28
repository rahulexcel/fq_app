var friendService = angular.module('FriendService', ['ServiceMod']);

friendService.factory('friendHelper', [
    'ajaxRequest', '$q', '$localStorage', 'timeStorage', 'notifyHelper', 'wishlistHelper',
    function (ajaxRequest, $q, $localStorage, timeStorage, notifyHelper, wishlistHelper) {
        var service = {};
        service.top_users = function (page) {
            var def = $q.defer();
            var id = -1;
            if ($localStorage.user.id) {
                id = $localStorage.user.id;
            }
            var ajax = ajaxRequest.send('v1/feeds/user/top', {
                skip: page,
                user_id: id
            }, true);
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.resolve([]);
            });
            return def.promise;
        };
        service.top_lists = function (page) {
            var def = $q.defer();
            var id = -1;
            if ($localStorage.user.id) {
                id = $localStorage.user.id;
            }
            var ajax = ajaxRequest.send('v1/feeds/list/top', {
                skip: page,
                user_id: id
            }, true);
            ajax.then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    var row = data[i];
                    var list_symbol = row.name.substring(0, 1).toUpperCase();
                    var bg_color = wishlistHelper.getRandomColor();
                    data[i].list_symbol = list_symbol;
                    data[i].bg_color = bg_color;
                    data[i].is_following = false;
                }
                def.resolve(data);
            }, function () {
                def.resolve([]);
            });
            return def.promise;
        };
        service.home_latest = function (page, women) {
            var def = $q.defer();
            var url = '';
            if (women) {
                url = 'v1/feeds/latest?father=home_latest_women';
            } else {
                url = 'v1/feeds/latest?father=home_latest_men';
            }
            var ajax = ajaxRequest.send(url, {page: page});
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.home_trending = function (page) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/feeds/trending', {page: page});
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.home_latest_count = function (type) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/feeds/latest/count', {
                user_id: $localStorage.user.id,
                father: type
            }, true);
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.home_feed_count = function () {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/feeds/my/count', {
                user_id: $localStorage.user.id
            }, true);
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.home_feed = function (page) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/feeds/my', {
                page: page,
                user_id: $localStorage.user.id
            });
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.item_pins_list = function (item_id) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/item/pins', {
                item_id: item_id
            });
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.item_likes_list = function (list_id, item_id) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/item/likes', {
                list_id: list_id,
                item_id: item_id
            });
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.list_followers_list = function (list_id) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/list/followers', {
                list_id: list_id
            });
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.user_followers_list = function (user_id) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/user/followers', {
                user_id: user_id
            });
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.user_unfollow = function (follow_user_id) {
            return this.user_follow(follow_user_id, 'remove');
        };
        service.user_follow = function (follow_user_id, type) {
            if (!type) {
                type = 'add';
            }
            var user_id = $localStorage.user.id;
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/user/follow', {
                user_id: user_id,
                follow_user_id: follow_user_id,
                type: type
            });
            ajax.then(function (data) {
                def.resolve(data);
                var uniq_id = new Date().getTime();
                if (type === 'add') {
//                    notifyHelper.subscribe('user_follower_' + follow_user_id);
// will use only user based channel

                    notifyHelper.sendAlert('user_' + follow_user_id, {
                        title: 'New Follower',
                        message: $localStorage.user.name + " is Following You Now",
                        meta: {
                            user: $localStorage.user,
                            type: 'follow_user',
                            uniq_id: uniq_id
                        }
                    }, uniq_id);
                    notifyHelper.addUpdate(follow_user_id, 'follow_user', {
                        user: $localStorage.user
                    }, uniq_id);
                } else {
//                    notifyHelper.unsubscribe('user_follower_' + follow_user_id);
                    notifyHelper.addUpdate(follow_user_id, 'unfollow_user', {
                        user: $localStorage.user
                    }, uniq_id);
                }

            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.list_unfollow = function (list_id) {
            return this.list_follow(list, 'remove');
        };
        service.list_follow = function (list_id, type) {
            if (!type) {
                type = 'add';
            }
            var user_id = $localStorage.user.id;
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/list/follow', {
                user_id: user_id,
                list_id: list_id,
                type: type
            });
            ajax.then(function (data) {
                def.resolve(data);
                var uniq_id = new Date().getTime();
                if (type === 'add') {
                    //notifyHelper.subscribe('list_' + list_id);
                    notifyHelper.sendAlert('user_' + data.user_id, {
                        title: 'New List Follower',
                        message: $localStorage.user.name + " is Following You List " + data.name,
                        meta: {
                            user: $localStorage.user,
                            list: {
                                _id: data._id,
                                name: data.name
                            },
                            type: 'follow_list',
                            uniq_id: uniq_id
                        }
                    });
                    notifyHelper.addUpdate(data.user_id, 'follow_list', {
                        user: $localStorage.user,
                        list: data
                    }, uniq_id);
                } else {
                    //notifyHelper.unsubscribe('list_' + list_id);
                    notifyHelper.addUpdate(data.user_id, 'unfollow_list', {
                        user: $localStorage.user,
                        list: data
                    }, uniq_id);
                }
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.list = function (user_id, force) {
            if (!user_id) {
                user_id = $localStorage.user.id;
            }
            if (!angular.isDefined(force)) {
                force = false;
            }
            var def = $q.defer();
            var cache_key = 'user_friend_list_' + user_id;
            var friend_list = timeStorage.get(cache_key);
            if (friend_list && !force) {
                return $q.when(angular.copy(friend_list));
            } else {
                var ajax = ajaxRequest.send('v1/social/friends/list', {
                    user_id: user_id
                });
                ajax.then(function (data) {
                    def.resolve(data);
                    timeStorage.set(cache_key, data, 12);
                }, function () {
                    def.reject();
                });
                return def.promise;
            }
        };
        service.fullProfile = function (user_id, my_id) {
            var def = $q.defer();
            var me = false;
            if (!user_id) {
                user_id = $localStorage.user.id;
            }
            if ($localStorage.user && user_id === $localStorage.user.id) {
                me = true;
            }
            var ajax = ajaxRequest.send('v1/social/user/profile/full', {
                user_id: user_id,
                me: me,
                my_id: my_id
            });
            ajax.then(function (data) {
                if (!data.meta.friends) {
                    data.meta.friends = 0;
                }
                if (!data.meta.followers) {
                    data.meta.followers = 0;
                }
                if (!data.meta.products) {
                    data.meta.products = 0;
                }
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.loadMoreFriends = function (user_id, skip) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/user/friends', {
                user_id: user_id,
                skip: skip
            });
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.loadMoreFollowers = function (user_id, skip) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/user/followers', {
                user_id: user_id,
                skip: skip
            });
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.loadMoreFollowing = function (user_id, skip) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/user/following', {
                user_id: user_id,
                skip: skip
            });
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.loadMoreProfilePins = function (user_id, skip) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/user/profile/pins', {
                user_id: user_id,
                skip: skip
            });
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.unFriend = function (me_id, friend_id) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/user/unfriend', {
                me_id: me_id,
                friend_id: friend_id
            });
            ajax.then(function (data) {
                notifyHelper.addUpdate(friend_id, 'un_friend', {
                    user: $localStorage.user
                });
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.declineFriendRequest = function (from_friend_id) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/user/declinefriendrequest', {
                from_user_id: from_friend_id,
                to_user_id: $localStorage.user.id
            });
            ajax.then(function (data) {
                var uniq_id = new Date().getTime();
                notifyHelper.addUpdate(from_friend_id, 'decline_friend', {
                    user: $localStorage.user,
                    data: from_friend_id
                }, uniq_id);
                notifyHelper.sendAlert('user_' + from_friend_id, {
                    title: 'Friend Request Declined',
                    message: $localStorage.user.name + ' decliend your friend request',
                    meta: {
                        type: 'decline_friend',
                        user: $localStorage.user,
                        uniq_id: uniq_id
                    }
                });
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.acceptFriendRequest = function (from_friend_id) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/user/acceptfriendrequest', {
                from_user_id: from_friend_id,
                to_user_id: $localStorage.user.id
            });
            ajax.then(function (data) {
                var uniq_id = new Date().getTime();
                notifyHelper.addUpdate(from_friend_id, 'accept_friend', {
                    user: $localStorage.user,
                    data: from_friend_id
                }, uniq_id);
                notifyHelper.sendAlert('user_' + from_friend_id, {
                    title: 'Friend Request Accepted',
                    message: $localStorage.user.name + ' has accepted your friend request',
                    meta: {
                        type: 'accept_friend',
                        user: $localStorage.user,
                        uniq_id: uniq_id
                    }
                });
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.my_friend_requests = function (user_id) {
            if (!user_id) {
                user_id = $localStorage.user.id;
            }
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/user/friend_requests', {
                user_id: user_id
            });
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.addFriend = function (to_user_id, from_user_id) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/user/addfriend', {
                from_user_id: from_user_id,
                to_user_id: to_user_id
            });
            ajax.then(function (data) {
                if (data.status === 'sent') {
                    var uniq_id = new Date().getTime();
                    notifyHelper.addUpdate(to_user_id, 'add_friend', {
                        user: $localStorage.user,
                        data: to_user_id
                    }, uniq_id);
                    notifyHelper.sendAlert('user_' + to_user_id, {
                        title: 'Friend Request',
                        message: $localStorage.user.name + ' has sent you a friend request',
                        meta: {
                            type: 'add_friend',
                            user: $localStorage.user,
                            uniq_id: uniq_id
                        }
                    });
                }
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        return service;
    }
]);