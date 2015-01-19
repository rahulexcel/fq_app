var accountService = angular.module('AccountService', ['ServiceMod']);

accountService.factory('accountHelper', [
    'ajaxRequest', '$q', 'toast', '$localStorage', '$location', '$rootScope', '$cordovaDevice',
    function (ajaxRequest, $q, toast, $localStorage, $location, $rootScope, $cordovaDevice) {
        var service = {};
        service.init_done = false;
        service.fbInit = function () {
            this.init_done = true;
        };
        service.isFbInit = function () {
            return this.init_done;
        };

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
        };
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
        };
        service.removePicture = function () {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/account/remove_picture', {
                user_id: $localStorage.user.id
            });
            ajax.then(function (data) {
                $localStorage.user.picture = 'img/empty.png';
                def.resolve();
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.updatePicture = function (filename) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/account/remove_picture', {
                user_id: $localStorage.user.id,
                picture: filename
            });
            ajax.then(function (data) {
                def.resolve(data);
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.logout = function () {
            var def = $q.defer();
            var ajax = false;
            ajax = ajaxRequest.send('v1/account/logout', {api_key: $localStorage.user.api_key});
            ajax.then(function (data) {
                def.resolve();
            }, function () {
                def.reject();
            });
            return def.promise;
        }
        service.create = function (user, type) {
            var def = $q.defer();
            var ajax = false;
            var device = {
                type: 'Desktop'
            };
            if ($cordovaDevice && window.cordova && window.cordova.plugins) {
                var device = {
                    device: $cordovaDevice.getDevice(),
                    cordova: $cordovaDevice.getCordova(),
                    model: $cordovaDevice.getModel(),
                    platform: $cordovaDevice.getPlatform(),
                    uuid: $cordovaDevice.getUUID(),
                    version: $cordovaDevice.getVersion()
                };
            }
            user.device = device;
            if (type === 'login') {
                ajax = ajaxRequest.send('v1/account/login', {user: user});
            } else if (type === 'facebook') {
                ajax = ajaxRequest.send('v1/account/create/facebook', {user: user});
            } else if (type === 'google') {
                ajax = ajaxRequest.send('v1/account/create/google', {user: user});
            } else {
                ajax = ajaxRequest.send('v1/account/create', {user: user});
            }
            ajax.then(function (data) {
                if (data.name && data.name !== 'XXX') {
                    toast.showShortBottom('Welcome ' + data.name);
                } else {
                    toast.showShortBottom('Welcome');
                }
                if (data._id) {
                    data.id = data._id;
                }
                data.type = type;
                $localStorage.user = data;
                var picture = data.picture;
                if (picture.length === 0) {
                    data.picture = '';
                } else if (picture.indexOf('http') === -1) {
                    data.picture = ajaxRequest.url('v1/picture/view/' + data.picture);
                }
                def.resolve(data);
                $location.path('/app/invite');
                $rootScope.$broadcast('login_event');
            }, function (message) {
                def.reject(message);
            });
            return def.promise;
        };
        return service;
    }
]);