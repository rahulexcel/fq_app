var friendService = angular.module('FriendService', ['ServiceMod']);

friendService.factory('friendHelper', [
    'ajaxRequest', '$q', 'toast', '$localStorage', '$location', '$rootScope',
    function (ajaxRequest, $q, toast, $localStorage, $location, $rootScope) {
        var service = {};
        service.item_pins_list = function (item_id) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/item/pins', {
                item_id: item_id
            })
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        }
        service.item_likes_list = function (list_id, item_id) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/item/likes', {
                list_id: list_id,
                item_id: item_id
            })
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        }
        service.list_followers_list = function (list_id) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/list/followers', {
                list_id: list_id
            })
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        }
        service.user_followers_list = function (user_id) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/user/followers', {
                user_id: user_id
            })
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        }
        service.user_unfollow = function (follow_user_id) {
            return this.user_follow(follow_user_id, 'remove');
        }
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
            })
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        }
        service.list_unfollow = function (list_id) {
            return this.list_follow(list, 'remove');
        }
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
            })
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        }
        service.list = function (user_id) {
            if (!user_id) {
                user_id = $localStorage.user.id;
            }
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/friends/list', {
                user_id: user_id
            })
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        }
        return service;
    }
]);