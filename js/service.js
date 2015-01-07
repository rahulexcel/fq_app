var serviceMod = angular.module('ServiceMod', ['ngStorage']);

serviceMod.factory('timeStorage', ['$localStorage', function ($localStorage) {
        var timeStorage = {};
        timeStorage.set = function (key, data, hours) {
            $localStorage.key = data;
            var time_key = key + '_expire';
            var time = new Date().getTime();
            time = time + (hours * 1 * 60 * 60 * 1000)
            $localStorage[time_key] = time;
        }
        timeStorage.get = function (key) {
            var time_key = key + "_expire";
            if (!$localStorage[time_key]) {
                return false;
            }
            var expire = $localStorage[time_key] * 1;
            if (new Date().getTime() > expire) {
                $localStorage.key = false;
                return false;
            }
            return $localStorage.key;
        }
        return timeStorage;
    }]);
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
                    url: function (api) {
                        return 'http://144.76.83.246:5000/' + api
                    },
                    send: function (api, data, method) {
                        if (!method) {
                            method = 'POST';
                        }
                        console.log('data to send');
                        console.log(data);
                        var def = $q.defer();
//                        delete $http.defaults.headers.common['X-Requested-With'];
                        var http = $http({
                            url: this.url(api),
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

serviceMod.factory('uploader', ['$q', 'ajaxRequest',
    function ($q, ajaxRequest) {
        return {
            ft: false,
            currentFile: false,
            upload_defer: false,
            had_error: false,
            fileSize: function (fileURI) {
                var def = $q.defer();
                var promise = def.promise;
                window.resolveLocalFileSystemURL(fileURI, function (fileEntry) {
                    fileEntry.file(function (filee) {
                        var size = filee.size * 1;
                        size = Math.ceil(size / (1024 * 1024));
                        def.resolve(size);
                    }, function () {
                        def.resolve(0);
                    });

                }, function (err) {
                    def.resolve(0);
                });
                return promise;
            },
            cancelUpload: function (index) {
                if (this.ft && this.currentFile == index) {
                    this.ft.abort();
                    this.ft = false;
                    if (this.upload_defer) {
                        this.upload_defer.reject();
                    }
                    console.log('upload abored');
                } else {
                    console.log('no reason to abort upload');
                }
            },
            upload: function (files, params) {
                if (!angular.isArray(files)) {
                    files = [files];
                }
                this.had_error = false;
                var defer = $q.defer();
                var x = this.doFile(files, params, 0);
                x.then(function (data) {
                    defer.resolve(data);
                }, function (data) {
                    defer.reject(data);
                }, function (data) {
                    defer.notify(data);
                });
                return defer.promise;
            },
            doFile: function (files, params, i, defer) {
                if (i == 0) {
                    defer = $q.defer();
                }
                var promise = this.uploadFile(files[i], params);
                var context = this;
                context.currentFile = i;
                promise.then(function (data) {
                    console.log(i + '==' + (files.length - 1));
                    if (i == files.length - 1) {
                        if (context.had_error) {
                            defer.reject(data);
                        } else {
                            defer.resolve(data);
                        }
                    } else {
                        context.doFile(files, params, i + 1, defer);
                    }
                }, function (data) {
                    context.had_error = true;
                    console.log(i + '==' + (files.length - 1) + "error");
                    if (i == files.length - 1) {
                        if (context.had_error) {
                            defer.reject(data);
                        } else {
                            defer.resolve(data);
                        }
                    } else {
                        context.doFile(files, params, i + 1, defer);
                    }
                }, function (data) {
//                    console.log('at notify');
//                    console.log(data);

                    if (data.status == 'error') {
                        context.had_error = true;
                    }
                    if (data.progress) {
                        data.file = i;
                        data.status = 'progress';
                        defer.notify(data);
                    } else {
                        data.file = i;
                        defer.notify(data);
                    }
                });
                if (i == 0) {
                    return defer.promise;
                }
            },
            uploadFile: function (fileURL, params) {
                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                options.mimeType = "image/jpeg";
                options.params = params;
                var context = this;
                context.upload_defer = $q.defer();
                if (context.ft) {
                    console.log('another file already in progress');
                    context.notify({status: 'error', code: 'Another File Already In Progress'});
                    context.reject();
                } else {
                    console.log('starting file ' + fileURL);
                    var win = function (r) {

                        console.log("Code = " + r.responseCode);
                        console.log("Response = " + r.response);
                        var obj = JSON.parse(r.response);
                        console.log(obj);
                        console.log("Response Error = " + obj.error);
                        console.log("Sent = " + r.bytesSent);
                        if (obj.error * 1 == 0) {
                        } else {
                            if (obj.error == 2) {
                                context.upload_defer.notify({status: 'error', code: 'Unknow Error! Try Again Later'});
                            } else {
                                context.upload_defer.notify({status: 'error', code: obj.message});
                            }
                        }
                        context.upload_defer.resolve(obj);
                        context.ft = false;
                    }

                    var fail = function (error) {                     // error.code == FileTransferError.ABORT_ERR
                        context.upload_defer.reject("An error has occurred: Code = " + error.code);
                        context.ft = false;
                    }
                    context.ft = new FileTransfer();
                    context.ft.upload(fileURL, encodeURI(ajaxRequest.url('v1/account/picture')), win, fail, options);
                    context.ft.onprogress = function (progressEvent) {
                        if (progressEvent.lengthComputable) {                         //loadingStatus.setPercentage();
                            var x = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
                            context.upload_defer.notify({progress: x});
                        } else {
                        }
                    };
                }
                return this.upload_defer.promise;
            }
        }
    }
]);