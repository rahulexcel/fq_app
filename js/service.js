var serviceMod = angular.module('ServiceMod', ['ngStorage', 'ionic']);

serviceMod.filter('prettyDate', function () {
    return function (date) {
        return prettyDate(date);
    };
});
serviceMod.filter('picture', function () {
    return function (picture, width, height) {
        if (!angular.isDefined(picture)) {
            return "";
        }
        if (!angular.isDefined(width)) {
            return picture;
        }
        if (picture.indexOf('facebook') !== -1) {
            if (picture.indexOf('width=') !== -1) {
                picture = picture.substring(0, picture.lastIndexOf('?width=') + "?width=".length);
                picture = picture + width;
            } else {
                picture = picture.substring(0, picture.lastIndexOf('?'));
                picture = picture + "?width=" + width;
            }
            if (height) {
                picture = picture + "&height=" + height;
            }
        } else if (picture.indexOf('picture/view') !== -1) {
            if (picture.indexOf('width=') !== -1) {
                picture = picture.substring(0, picture.indexOf('?width='));
            }
            picture = picture + "?width=" + width;
            if (height) {
                picture = picture + "&height=" + height;
            }

        } else {

        }
        return picture;
    };
});
serviceMod.factory('socialJs', function () {
    var service = {};
    service.social_js = false;
    service.addSocialJs = function () {
        if (this.social_js) {
            return;
        }
        this.social_js = true;
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id))
                return;
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&appId=765213543516434&version=v2.0";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
        window.twttr = (function (d, s, id) {
            var t, js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = "https://platform.twitter.com/widgets.js";
            fjs.parentNode.insertBefore(js, fjs);
            return window.twttr || (t = {_e: [], ready: function (f) {
                    t._e.push(f);
                }});
        }(document, "script", "twitter-wjs"));
    };
    return service;

});
serviceMod.factory('timeStorage', ['$localStorage', function ($localStorage) {
        var timeStorage = {};
        timeStorage.remove = function (key) {
            var time_key = key + '_expire';
            $localStorage[key] = null;
            $localStorage[time_key] = null;
        };
        timeStorage.set = function (key, data, hours) {
            $localStorage[key] = data;
            var time_key = key + '_expire';
            var time = new Date().getTime();
            time = time + (hours * 1 * 60 * 60 * 1000);
            $localStorage[time_key] = time;
        };
        timeStorage.get = function (key) {
            var time_key = key + "_expire";
            if (!$localStorage[time_key]) {
                return false;
            }
            var expire = $localStorage[time_key] * 1;
            if (new Date().getTime() > expire) {
                $localStorage[key] = null;
                $localStorage[time_key] = null;
                return false;
            }
            return $localStorage[key];
        };
        return timeStorage;
    }]);
serviceMod.factory('dataShare', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
        var shareService = {};
        shareService.data = false;
        shareService.broadcastData = function (data, event, fast) {
            this.data = data;
            if (fast) {
                $rootScope.$broadcast(event);
            } else {
                $timeout(function () {
                    $rootScope.$broadcast(event);
                }, 500);
            }
        };
        shareService.getData = function () {
            var data = shareService.data;
            return data;
        };

        return shareService;
    }
]);
serviceMod.factory('toast', ['$ionicPopup', function ($ionicPopup) {
        return {
            showShortBottom: function (message) {
                if (window.plugins && window.plugins.toast) {
                    window.plugins.toast.showShortBottom(message, function (a) {
                    }, function (b) {
                    });
                } else {
                    $ionicPopup.alert({
                        title: 'Alert',
                        template: message
                    }, function () {

                    }, function () {

                    });
                }
            },
            showProgress: function () {
                this.showShortBottom('Please Wait...');
            }
        };
    }
]);
serviceMod.factory('ajaxRequest',
        ['$http', '$q', '$log', 'toast', '$localStorage',
            function ($http, $q, $log, toast, $localStorage) {
                return {
                    url: function (api) {
                        return 'http://144.76.83.246:5000/' + api;
                    },
                    send: function (api, data, method) {
                        if (!angular.isDefined(method)) {
                            method = 'POST';
                        }
                        if (method === 'POST') {
                            var api_key = $localStorage.user.api_key;
                            if (angular.isDefined(api_key) && api_key.length > 0) {
                                var timestamp = new Date().getTime();
                                var api_secret = $localStorage.user.api_secret;
                                data.timestamp = timestamp;
                                var hash = CryptoJS.HmacSHA1(JSON.stringify(data), api_secret);
                                hash = hash.toString(CryptoJS.enc.Hex);
                                var new_data = {
                                    digest: hash,
                                    data: data,
                                    api_key: api_key
                                }
                                data = new_data;
                            }

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
                            if (data.error === 0) {
                                if (data.data) {
                                    def.resolve(data.data);
                                } else {
                                    def.resolve();
                                }
                            } else {
                                if (data.error === 2) {
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
                            toast.showShortBottom('Unable to Complete Request! Check Your Network Connection Or Try Again');
                            def.reject('500');
                        });
                        return def.promise;
                    }
                };
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
                if (this.ft && this.currentFile === index) {
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
                if (i === 0) {
                    defer = $q.defer();
                }
                var promise = this.uploadFile(files[i], params);
                var context = this;
                context.currentFile = i;
                promise.then(function (data) {
                    console.log(i + '==' + (files.length - 1));
                    if (i === files.length - 1) {
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
                    if (i === files.length - 1) {
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

                    if (data.status === 'error') {
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
                if (i === 0) {
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
                        if (obj.error * 1 === 0) {
                        } else {
                            if (obj.error === 2) {
                                context.upload_defer.notify({status: 'error', code: 'Unknow Error! Try Again Later'});
                            } else {
                                context.upload_defer.notify({status: 'error', code: obj.message});
                            }
                        }
                        context.upload_defer.resolve(obj);
                        context.ft = false;
                    };

                    var fail = function (error) {                     // error.code == FileTransferError.ABORT_ERR
                        context.upload_defer.reject("An error has occurred: Code = " + error.code);
                        context.ft = false;
                    };
                    context.ft = new FileTransfer();
                    context.ft.upload(fileURL, encodeURI(ajaxRequest.url('v1/picture/upload')), win, fail, options);
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
        };
    }
]);

/*
 * The whenReady directive allows you to execute the content of a when-ready
 * attribute after the element is ready (i.e. when it's done loading all sub directives and DOM
 * content). See: http://stackoverflow.com/questions/14968690/sending-event-when-angular-js-finished-loading
 *
 * Execute multiple expressions in the when-ready attribute by delimiting them
 * with a semi-colon. when-ready="doThis(); doThat()"
 *
 * Optional: If the value of a wait-for-interpolation attribute on the
 * element evaluates to true, then the expressions in when-ready will be
 * evaluated after all text nodes in the element have been interpolated (i.e.
 * {{placeholders}} have been replaced with actual values).
 *
 * Optional: Use a ready-check attribute to write an expression that
 * specifies what condition is true at any given moment in time when the
 * element is ready. The expression will be evaluated repeatedly until the
 * condition is finally true. The expression is executed with
 * requestAnimationFrame so that it fires at a moment when it is least likely
 * to block rendering of the page.
 *
 * If wait-for-interpolation and ready-check are both supplied, then the
 * when-ready expressions will fire after interpolation is done *and* after
 * the ready-check condition evaluates to true.
 *
 * Caveats: if other directives exists on the same element as this directive
 * and destroy the element thus preventing other directives from loading, using
 * this directive won't work. The optimal way to use this is to put this
 * directive on an outer element.
 */
serviceMod.directive('whenReady', ['$interpolate', function ($interpolate) {
        return {
            restrict: 'A',
            priority: Number.MIN_SAFE_INTEGER, // execute last, after all other directives if any.
            link: function ($scope, $element, $attributes) {
                var expressions = $attributes.whenReady.split(';');
                var waitForInterpolation = false;
                var hasReadyCheckExpression = false;

                function evalExpressions(expressions) {
                    expressions.forEach(function (expression) {
                        $scope.$eval(expression);
                    });
                }

                if ($attributes.whenReady.trim().length === 0) {
                    return;
                }

                if ($attributes.waitForInterpolation && $scope.$eval($attributes.waitForInterpolation)) {
                    waitForInterpolation = true;
                }

                if ($attributes.readyCheck) {
                    hasReadyCheckExpression = true;
                }

                if (waitForInterpolation || hasReadyCheckExpression) {
                    requestAnimationFrame(function checkIfReady() {
                        var isInterpolated = false;
                        var isReadyCheckTrue = false;

                        if (waitForInterpolation && $element.text().indexOf($interpolate.startSymbol()) >= 0) { // if the text still has {{placeholders}}
                            isInterpolated = false;
                        }
                        else {
                            isInterpolated = true;
                        }

                        if (hasReadyCheckExpression && !$scope.$eval($attributes.readyCheck)) { // if the ready check expression returns false
                            isReadyCheckTrue = false;
                        }
                        else {
                            isReadyCheckTrue = true;
                        }

                        if (isInterpolated && isReadyCheckTrue) {
                            evalExpressions(expressions);
                        }
                        else {
                            requestAnimationFrame(checkIfReady);
                        }

                    });
                }
                else {
                    evalExpressions(expressions);
                }
            }
        };
    }]);