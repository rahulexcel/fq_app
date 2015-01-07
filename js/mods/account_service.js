var accountService = angular.module('AccountService', ['ServiceMod']);

accountService.factory('accountHelper', [
    'ajaxRequest', '$q', 'toast', '$localStorage', '$location', '$rootScope',
    function (ajaxRequest, $q, toast, $localStorage, $location, $rootScope) {
        var service = {};
        service.init_done = false;
        service.fbInit = function () {
            this.init_done = true;
        }
        service.isFbInit = function () {
            return this.init_done;
        }

        service.updatePassword = function (password) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/account/update', {
                user_id: $localStorage.user.id,
                password: password
            });
            ajax.then(function () {
                def.resolve();
            }, function () {
                def.reject();
            });
            return def.promise;
        }
        service.updateProfile = function (profile) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/account/update', {
                user_id: $localStorage.user.id,
                profile: profile
            });
            ajax.then(function () {
                $localStorage.user.name = profile.name;
                $localStorage.user.gender = profile.gender;
                def.resolve();
            }, function () {
                def.reject();
            });
            return def.promise;
        }
        service.removePicture = function () {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/account/remove_picture', {
                user_id: $localStorage.user.id
            });
            ajax.then(function (data) {
                $localStorage.user.picture = 'img/silhouette_default.jpg';
                def.resolve();
            }, function () {
                def.reject();
            });
            return def.promise;
        }
        service.create = function (user, type) {
            var def = $q.defer();
            if (type == 'login') {
                var ajax = ajaxRequest.send('v1/account/login', {user: user});
            } else if (type == 'facebook') {
                var ajax = ajaxRequest.send('v1/account/create/facebook', {user: user});
            } else if (type == 'google') {
                var ajax = ajaxRequest.send('v1/account/create/google', {user: user});
            } else {
                var ajax = ajaxRequest.send('v1/account/create', {user: user});
            }
            ajax.then(function (data) {
                if (data.name && data.name != 'XXX') {
                    toast.showShortBottom('Welcome ' + data.name);
                } else {
                    toast.showShortBottom('Welcome');
                }
                data.type = type;
                $localStorage.user = data;
                var picture = data.picture;
                if (picture.length == 0) {
                    data.picture = 'img/silhouette_default.jpg';
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