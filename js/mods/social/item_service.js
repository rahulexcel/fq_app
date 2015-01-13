var itemService = angular.module('ItemService', ['ServiceMod']);

itemService.factory('itemHelper', [
    'ajaxRequest', '$q', 'toast', '$localStorage',
    function (ajaxRequest, $q, toast, $localStorage) {
        var service = {};
        service.editComment = function (item_id, list_id, comment, picture, comment_id) {
            return this.comment(item_id, list_id, comment, picture, 'edit', comment_id);
        }
        service.removeComment = function (item_id, list_id, comment_id) {
            return this.comment(item_id, list_id, '', '', 'remove', comment_id);
        }
        service.comment = function (item_id, list_id, comment, picture, type, comment_id) {
            if (!type) {
                type = 'add';
            }
            var user_id = $localStorage.user.id;
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/item/pin', {
                user_id: user_id,
                list_id: list_id,
                item_id: item_id,
                comment: comment,
                picture: picture,
                type: type,
                comment_id: comment_id
            })
            ajax.then(function (data) {
                def.resolve(data);
            }, function (data) {
                def.reject(data);
            });
            return def.promise;
        }
        service.pin = function (item_id, list_id) {
            var user_id = $localStorage.user.id;
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/item/pin', {
                user_id: user_id,
                list_id: list_id,
                item_id: item_id
            })
            ajax.then(function (data) {
                def.resolve(data);
            }, function (data) {
                def.reject(data);
            });
            return def.promise;
        }
        service.unlike = function (item_id, list_id) {
            this.like(item_id, list_id, 'remove');
        }
        service.like = function (item_id, list_id, type) {
            if (!type) {
                type = 'add';
            }
            var user_id = $localStorage.user.id;
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/item/like', {
                user_id: user_id,
                list_id: list_id,
                item_id: item_id,
                type: type
            })
            ajax.then(function (data) {
                def.resolve(data);
            }, function (data) {
                def.reject(data);
            });
            return def.promise;
        }
        return service;
    }
]);