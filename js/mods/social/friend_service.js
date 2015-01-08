var friendService = angular.module('FriendService', ['ServiceMod']);

friendService.factory('friendHelper', [
    'ajaxRequest', '$q', 'toast', '$localStorage', '$location', '$rootScope',
    function (ajaxRequest, $q, toast, $localStorage, $location, $rootScope) {
        var service = {};
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