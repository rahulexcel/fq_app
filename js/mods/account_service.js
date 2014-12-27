var accountService = angular.module('AccountService', ['ServiceMod']);

accountService.factory('accountHelper', [
    'ajaxRequest', '$q', 'toast', '$localStorage', '$location', '$rootScope',
    function (ajaxRequest, $q, toast, $localStorage, $location, $rootScope) {
        var service = {};

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
                def.resolve(data);
                if ($localStorage.prevous.url) {
                    var prev_url = $localStorage.prevous.url;
                    $localStorage.prevous.url = false;
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