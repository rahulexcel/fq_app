var itemService = angular.module('ItemService', ['ServiceMod']);

itemService.factory('itemHelper', [
    'ajaxRequest', '$q', 'toast', '$localStorage', 'notifyHelper',
    function (ajaxRequest, $q, toast, $localStorage, notifyHelper) {
        var service = {};
        service.listComment = function (list_id, item_id) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/item/view/comment/' + list_id + "/" + item_id, {}, 'POST');
            ajax.then(function (data) {
                def.resolve(data);
            }, function (data) {
                def.reject(data);
            });
            return def.promise;
        };
        service.editComment = function (item_id, list_id, comment, picture, comment_id) {
            return this.comment(item_id, list_id, comment, picture, 'edit', comment_id);
        };
        service.removeComment = function (item_id, list_id, comment_id) {
            return this.comment(item_id, list_id, '', '', 'remove', comment_id);
        };
        service.comment = function (item_id, list_id, comment, picture, type, comment_id, item_picture) {
            if (!type) {
                type = 'add';
            }
            var user_id = $localStorage.user.id;
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/item/comment', {
                user_id: user_id,
                list_id: list_id,
                item_id: item_id,
                comment: comment,
                picture: picture,
                type: type,
                comment_id: comment_id
            });
            ajax.then(function (data) {
                def.resolve(data);
                if (type === 'add') {
                    var comments = data.data.comments;
                    var notify_ids = [];
                    notify_ids.push(data.data.list_id.user_id);
                    for (var i = 0; i < comments.length; i++) {
                        if (comments[i].user_id)
                            notify_ids.push(comments[i].user_id);
                    }
                    var sent_id = [];
                    for (var i = 0; i < notify_ids.length; i++) {
                        var u_id = notify_ids[i];
                        if (u_id !== $localStorage.user.id && sent_id.indexOf(u_id) === -1) {
                            notifyHelper.sendAlert('user_' + u_id, {
                                title: 'New Comment',
                                message: $localStorage.user.name + " comment on your clip",
                                alert: comment,
                                bigPicture: ajaxRequest.url('v1/picture/view/' + item_picture) + "?width=480",
                                meta: {
                                    user: $localStorage.user,
                                    data: data,
                                    type: 'item_comment'
                                }
                            });
                            notifyHelper.addUpdate(u_id, 'item_comment', {
                                user: $localStorage.user,
                                data: data,
                                comment: comment
                            });
                            sent_id.push(u_id);
                        }
                    }
                }
            }, function (data) {
                def.reject(data);
            });
            return def.promise;
        };
        service.pin = function (item_id, list_id) {
            var user_id = $localStorage.user.id;
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/social/item/pin', {
                user_id: user_id,
                list_id: list_id,
                item_id: item_id
            });
            ajax.then(function (data) {
                def.resolve(data);
            }, function (data) {
                def.reject(data);
            });
            return def.promise;
        };
        service.unlike = function (item_id, list_id) {
            this.like(item_id, list_id, 'remove');
        };
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
            });
            ajax.then(function (data) {
                def.resolve(data);
                if (type === 'add') {
                    notifyHelper.sendAlert('user_' + data.list_id.user_id, {
                        title: 'Likes Your Clip',
                        message: $localStorage.user.name + " likes your clip",
                        bigPicture: data.item_id.org_img,
                        meta: {
                            user: $localStorage.user,
                            type: 'item_like',
                            data: data
                        }
                    });
                    notifyHelper.addUpdate(data.list_id.user_id, 'item_like', {
                        user: $localStorage.user,
                        data: data
                    });
                } else {
                    notifyHelper.addUpdate(data.list_id.user_id, 'item_unlike', {
                        user: $localStorage.user,
                        data: data
                    });
                }

            }, function (data) {
                def.reject(data);
            });
            return def.promise;
        };
        return service;
    }
]);