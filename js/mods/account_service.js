var accountService = angular.module('AccountService', ['ServiceMod']);

accountService.factory('accountHelper', [
    'ajaxRequest', '$q', 'toast', '$localStorage', '$location', '$rootScope',
    function (ajaxRequest, $q, toast, $localStorage, $location, $rootScope) {
        var service = {};

        service.removePicture = function () {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/account/remove_picture', {
                user_id: $localStorage.user.id
            });
            ajax.then(function (data) {
                $localStorage.user.picture = 'img/ionic.png';
                def.resolve();
            }, function () {
                def.reject();
            });
            return def.promise;
        }
        service.create = function (user) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/account/create', {user: user});
            ajax.then(function (data) {
                if (data.name && data.name != 'XXX') {
                    toast.showShortBottom('Welcome ' + data.name);
                } else {
                    toast.showShortBottom('Welcome');
                }
                $localStorage.user = data;
                var picture = data.picture;
                if (picture.length == 0) {
                    data.picture = 'img/ionic.png';
                } else if (picture.indexOf('http') == -1) {
                    data.picture = ajaxRequest.url('v1/account/picture/view/' + data.picture);
                }
                def.resolve(data);
                if ($localStorage.previous.url) {
                    var prev_url = $localStorage.previous.url;
                    $localStorage.previous.url = false;
                    console.log('previous url ' + prev_url);
                    $location.path(prev_url);
                } else {
                    $location.path('/app/account');
                }
                $rootScope.$broadcast('login_event');
            }, function (message) {
                def.reject(message);
            });
            return def.promise;
        }
        return service;
    }
])