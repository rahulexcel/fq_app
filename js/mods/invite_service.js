var inviteService = angular.module('InviteService', ['ServiceMod']);

inviteService.factory('inviteHelper', [
    'ajaxRequest', '$q', '$localStorage', 'dataShare',
    function (ajaxRequest, $q, $localStorage, dataShare) {
        var service = {};
        service.lookUpGoogleFriends = function (data) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/friends/google/lookup', {
                user_id: $localStorage.user.id,
                google_data: data
            });
            ajax.then(function (data) {
                def.resolve(data);
            }, function (message) {
                def.reject(message);
            });
            return def.promise;
        };
        service.lookUpFacebookFriends = function (data) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/friends/facebook/lookup', {
                user_id: $localStorage.user.id,
                fb_data: data
            });
            ajax.then(function (data) {
                dataShare.broadcastData(data, 'facebook_friends_found', true);
                def.resolve(data);
            }, function (message) {
                def.reject(message);
            });
            return def.promise;
        };
        return service;
    }
]);