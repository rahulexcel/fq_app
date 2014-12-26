var serviceMod = angular.module('ServiceMod', []);

serviceMod.factory('dataShare', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
        var shareService = {};
        shareService.data = false;
        shareService.broadcastData = function (data, event) {
            this.data = data;
            $timeout(function () {
                $rootScope.$broadcast(event);
            }, 500);
        }
        shareService.getData = function () {
            var data = shareService.data;
            return data;
        }

        return shareService;
    }
]);
serviceMod.factory('toast', [function () {
        return {
            showShortBottom: function (message) {
                if (window.plugins && window.plugins.toast) {
                    window.plugins.toast.showShortBottom(message, function (a) {
                    }, function (b) {
                    })
                } else {
                    alert(message);
                }
            },
            showProgress: function () {
                this.showShortBottom('Please Wait...');
            }
        }
    }
]);
serviceMod.factory('ajaxRequest',
        ['$http', '$q', '$log', 'toast',
            function ($http, $q, $log, toast) {
                return {
                    send: function (api, data, method) {
                        if (!method) {
                            method = 'POST';
                        }
                        console.log('data to send');
                        console.log(data);
                        var def = $q.defer();
//                        delete $http.defaults.headers.common['X-Requested-With'];
                        var http = $http({
//                            url: 'http://127.0.0.1:5000/' + api + "?" + new Date().getTime(),
                            url: 'http://144.76.83.246:5000/' + api + "?" + new Date().getTime(),
                            method: method,
                            headers: {'Content-Type': 'application/json;charset=utf-8'},
                            cache: false,
                            data: JSON.stringify(data)
                        });
                        http.success(function (data) {
//                            def.resolve(data);
//                            return;
                            if (data.error == 0) {
                                if (data.data) {
                                    def.resolve(data.data);
                                } else {
                                    def.resolve();
                                }
                            } else {
                                if (data.error == 2) {
                                    $log.log('Ajax Mongo Error ' + data.message);
                                    data.message = 'Unknown! Try Again Later';
                                }
                                toast.showShortBottom('Error: ' + data.message);
                                $log.warn(data.message);
                                def.reject(data.message);
                            }
                        });
                        http.error(function () {
                            $log.warn('500 Error');
                            if (window.plugins && window.plugins.toast) {
                                window.plugins.toast.showShortBottom('Unable to Complete Request! Check Your Network Connection Or Try Again', function (a) {
                                }, function (b) {
                                })
                            } else {
                                alert('Unable to Complete Request! Check Your Network Connection Or Try Again');
                            }
                            def.reject('500');
                        });
                        return def.promise;
                    }
                }
            }
        ]);