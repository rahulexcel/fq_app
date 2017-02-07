// View's logic placed in directive 
wishlistItemAddMod.directive('preloadable', function () {
    return {
        link: function (scope, element) {
            element.bind("load", function (e) {

                // success, "onload" catched
                // now we can do specific stuff:

                var naturalWidth = this.naturalWidth * 1;
                var naturalHeight = this.naturalHeight * 1;
                console.log(this.src);
                if (naturalWidth !== 0 && naturalHeight !== 0) {
                    if (naturalWidth * 1 < 200 || naturalHeight * 1 < 200) {
                        console.log('remove ' + this.src);
                        scope.removeImage(this.src);
                    } else {
                        console.log('aspect ' + naturalWidth / naturalHeight);
                        var aspect = naturalWidth / naturalHeight;
                        if (aspect < 0.1 || aspect > 5) {
                            console.log('remove ' + this.src);
                            scope.removeImage(this.src);
                        }
                    }
                }

            });
        }
    };
});

wishlistItemAddMod.controller('WishlistItemAddCtrlStep2',
        ['$scope', 'ajaxRequest', '$upload', '$localStorage', 'toast', 'wishlistHelper', '$stateParams', 'mapHelper', '$ionicModal', '$window', '$cordovaCamera', '$ionicPopup', '$timeout', 'uploader', '$ionicBackdrop', '$rootScope', 'urlHelper',
            function ($scope, ajaxRequest, $upload, $localStorage, toast, wishlistHelper, $stateParams, mapHelper, $ionicModal, $window, $cordovaCamera, $ionicPopup, $timeout, uploader, $ionicBackdrop, $rootScope, urlHelper) {
                var self = this;
                $scope.$on('modal.shown', function () {
                    $rootScope.$emit('hide_android_add');
                });
                $scope.$on('modal.hidden', function () {
                    $rootScope.$emit('show_android_add');
                });
                $scope.item = {
                    picture: '',
                    url: '',
                    name: '',
                    price: '',
                    location: {
                    },
                    picture_size: {
                    },
                    description: '',
                    file_name: ""
                };
                $rootScope.$on('$ionicView.enter', function () {
                    $scope.item = {
                        picture: '',
                        url: '',
                        name: '',
                        price: '',
                        location: {
                        },
                        picture_size: {
                        },
                        description: '',
                        file_name: ""
                    };
                });

                $scope.url_images = [];
                $scope.is_mobile = false;
                if (ionic.Platform.isWebView()) {
                    $scope.is_mobile = true;
                }
                $scope.file_upload = false;
                $scope.file = {
                    myFiles: false
                };
                $scope.$on('logout_event', function () {
                    urlHelper.openSignUp();
                });

                $scope.sendItem = function () {
                    if ($scope.item.picture.length > 0) {

                        if ($scope.type === 'near') {
                            if (!$scope.item.location.lat) {
                                toast.showShortBottom('Select A Location');
                                return;
                            }
                        }

                        $scope.$parent.wishlist_product.product = false;
                        $scope.$parent.wishlist_product.item = false;
                        $scope.$parent.wishlist_product.new_item = true;

                        var async = $scope.$parent.showWishlistAsync($scope.type, $scope.list_id);
                        async.then(function (list_id) {
                            console.log(list_id + "list id");
                            var ajax = wishlistHelper.addItem(angular.copy($scope.item), list_id);
                            ajax.then(function (data) {
                                console.log(data);
                                if (data.id) {
                                    urlHelper.openItemPage(data.id, list_id);
                                } else {
                                    toast.showShortBottom('Unknown Error!');
                                }
                            });
                        }, function () {
                            toast.showShortBottom('Select a Wishlist To Clip Item!');
                        });
                    } else {
                        toast.showShortBottom('Upload A Picture');
                    }
                };

                $scope.removeLocation = function () {
                    $scope.item.location = {};
                };

                $scope.$on('$destroy', function () {
                    $scope.modal.remove();
                    mapHelper.destroy();
                });
                $scope.closeModel = function () {
                    var pos = mapHelper.getPosition();
                    if (!pos.lat) {
                        var confirmPopup = $ionicPopup.confirm({
                            title: 'Warning',
                            template: 'No Location Set? Move Pin To Set Location.'
                        });
                        confirmPopup.then(function (res) {
                            if (res) {
                                $scope.modal.hide();
                            } else {
                            }
                        });
                    } else {
                        console.log(pos);
                        $scope.item.location = pos;
                        $scope.modal.hide();
                    }
                };
                $ionicModal.fromTemplateUrl('template/partial/map.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.modal = modal;
                });
                console.log('started');

                var timeout_promise = false;
                var self = this;
                self.to_remove_images = [];
                self.remove_image_timer = false;
                $scope.removeImage = function (url) {
                    self.to_remove_images.push(url);
                    if (self.remove_image_timer) {
                        $timeout.cancel(self.remove_image_timer);
                    }
                    self.remove_image_timer = $timeout(function () {
                        console.log('removing images...');
                        var remove_images = self.to_remove_images;
                        self.to_remove_images = [];

                        var url_images = $scope.url_images;
                        var new_url_images = [];
                        for (var i = 0; i < url_images.length; i++) {
//                        console.log(url + "!==" + url_images[i]);
                            if (remove_images.indexOf(url_images[i]) !== -1) {
                                new_url_images.push(url_images[i]);
                            }
                        }
                        $scope.$evalAsync(function () {
                            $scope.url_images = new_url_images;
                        });
                    }, 100);
                };

                $scope.$watch('item.url', function (val) {
                    if (val) {
                        if (timeout_promise) {
                            console.log($timeout.cancel(timeout_promise));
                        }
                        timeout_promise = $timeout(function () {
                            $scope.url_images = [];

                            if ($scope.step_type === 'image_url') {
                                var ajax = wishlistHelper.saveImageUrl(val);
                                $scope.url_loading = true;
                                ajax.then(function (data) {
                                    $scope.url_loading = false;
                                    if (data) {
                                        var pic = ajaxRequest.url('v1/picture/view/' + data.data);
                                        $scope.item.picture = pic;
                                        $scope.item.picture_size = data.size;
                                        $scope.item.file_name = data.data;
                                    }
                                }, function () {
                                    $scope.url_loading = false;
                                });
                            } else {
                                var ajax = wishlistHelper.getUrlImage(val);
                                $scope.url_loading = true;
                                ajax.then(function (data) {
                                    $scope.url_loading = false;
                                    var url_images = [];
                                    var max = 8;
                                    var j = 0;
                                    for (var i = 0; i < data.length; i++) {
                                        if (j < max) {
                                            (function (image_url) {
                                                var img = new Image();
                                                img.onload = function () {
                                                    var naturalWidth = img.naturalWidth * 1;
                                                    var naturalHeight = img.naturalHeight * 1;
                                                    if (naturalWidth !== 0 && naturalHeight !== 0) {
                                                        console.log(naturalHeight + "XXX" + naturalWidth);

                                                        if (naturalWidth * 1 < 200 || naturalHeight * 1 < 200) {
                                                            console.log('remove ' + img.src);
//                                                        scope.removeImage(img.src);
                                                        } else {
                                                            console.log('aspect ' + naturalWidth / naturalHeight);
                                                            var aspect = naturalWidth / naturalHeight;
                                                            if (aspect < 0.1 || aspect > 5) {
                                                                console.log('remove ' + img.src);
//                                                            scope.removeImage(img.src);
                                                            } else {
                                                                url_images.push(image_url);
                                                                $scope.url_images = url_images;
                                                                $scope.$evalAsync();
                                                            }
                                                        }
                                                    }
                                                };

                                                img.src = image_url;
                                            })(data[i]);

                                        }
                                    }
                                }, function () {
                                    $scope.url_loading = false;
                                });
                            }

                        }, 500);
                    }
                });
                $scope.showMap = function () {
                    var height = $window.innerHeight * 1 - 44;
                    $scope.height = height + 'px';


                    $scope.setHeight = {};

                    $scope.modal.show();
                    mapHelper.initMap($scope, 'map-canvas');
                };

                if ($localStorage.user.id) {
//                    $scope.list_id = false;
//                    if ($stateParams.list_id) {
//                        $scope.list_id = $stateParams.list_id;
//                        var name = wishlistHelper.getListName($scope.list_id);
//                        $scope.wishlist_name = name;
//                        if (urlHelper.getPath().indexOf('step2') !== -1) {
//                            if (!$scope.step_type) {
//                                $location.path('/app/wishlist_item_add/' + $scope.list_id + '/step1');
//                            }
//                        }
//                    } else {
//                        toast.showShortBottom('Invalid Page, Need List ID');
//                       urlHelper.openHomePage();
//                    }

                } else {
                    toast.showShortBottom('You Need To Be Logged In To Access This Page');
                    urlHelper.openSignUp();
                }

                var picture_width = $window.innerWidth;
                picture_width = Math.ceil(picture_width * 0.95);
                if (picture_width > 480) {
                    picture_width = 480;
                }
                $scope.picture_width = picture_width;
                $scope.browseCamera = function (type) {

                    var options = {
                        quality: 100,
                        destinationType: Camera.DestinationType.FILE_URI,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        encodingType: Camera.EncodingType.JPEG,
                        popoverOptions: CameraPopoverOptions,
                        saveToPhotoAlbum: false,
                        allowEdit: false
                    };

                    if (type === 'gallary') {
                        options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;

                    } else {
                    }
                    $cordovaCamera.getPicture(options).then(function (imageURI) {
                        $scope.progoress_style = {width: '0%'};
                        $scope.progress = 0;
                        $scope.file_upload = false;
                        var promise = uploader.fileSize(imageURI);
                        promise.then(function (size) {
                            console.log('size is ' + size);
                            $scope.image_size = size * 1;
                            if (size * 1 > 5) {
                                toast.showShortBottom('Upload File Of Size Less Than 5MB');
                            } else {
                                $scope.file_upload = true;
                                var ajax = uploader.upload(imageURI, {
                                    user_id: $localStorage.user.id,
                                    size: 1,
                                    temp: true
                                });
                                $ionicBackdrop.retain();
                                ajax.then(function (data) {
                                    var per = '100%';
                                    $scope.progoress_style = {width: per};
                                    $scope.progress = per;
                                    console.log(data);
                                    $ionicBackdrop.release();
                                    if (data && data.data) {
                                        if (data.size.width < 150 || data.size.height < 150) {
                                            toast.showShortBottom('Image Size Should Be More Than 150x150px');
                                        } else {
                                            var pic = ajaxRequest.url('v1/picture/view/' + data.data);
                                            $scope.item.picture = pic;
                                            $scope.item.picture_size = data.size;
                                            $scope.item.file_name = data.data;
                                        }
                                    }
                                    $scope.step1Class = 'red-back';
                                    $scope.file_upload = false;
                                }, function (data) {
                                    $ionicBackdrop.release();
                                }, function (data) {
//                                    console.log(data);
                                    var per = data.progress + '%';
                                    $scope.progoress_style = {width: per};
                                    $scope.progress = per;
                                });
                            }
                        });

                    }, function (err) {
                        // error
                    });
                };

                $scope.$watch('file.myFiles', function (val) {
                    if (!val) {
                        return;
                    }
                    if ($scope.step_type !== 'near')
                        $scope.step_type = 'gallary';
                    console.log($scope.file.myFiles);
                    var i = 0;
                    var file = $scope.file.myFiles[i];
                    var size = file.size;

                    var mb_size = Math.ceil((size / (1024 * 1024)));
                    console.log(mb_size);
                    if (mb_size > 5) {
                        $scope.file = {
                            myFiles: false
                        };
                        toast.showShortBottom('Upload File Of Size Less Than 5MB');
                        return;
                    }

                    $scope.file_upload = true;
                    $ionicBackdrop.retain();
                    $scope.upload = $upload.upload({
                        url: ajaxRequest.url('v1/picture/upload'),
                        data: {user_id: $localStorage.user.id, size: 1, temp: true},
                        file: file
                    }).progress(function (evt) {
                        var per = parseInt(100.0 * evt.loaded / evt.total) + '%';
                        $scope.progoress_style = {width: per};
                        $scope.progress = per;
//                            console.log('progress: ' +  + '% file :' + evt.config.file.name);
                    }).success(function (data, status, headers, config) {
                        $ionicBackdrop.release();
                        var per = '100%';
                        $scope.progoress_style = {width: per};
                        $scope.progress = per;

                        console.log(data);

                        if (data.error === 1) {
                            toast.showShortBottom(data.message);
                        } else {
                            if (data.size.width < 150 || data.size.height < 150) {
                                toast.showShortBottom('Image Size Should Be More Than 150x150px');
                            } else {
                                if (data.data) {
                                    var pic = ajaxRequest.url('v1/picture/view/' + data.data);
                                    $scope.item.picture = pic;
                                    $scope.item.picture_size = data.size;
                                    $scope.item.file_name = data.data;
                                }
                            }
                            $scope.file_upload = false;
                            $scope.step1Class = 'red-back';
                        }

//                            console.log('file ' + config.file.name + 'is uploaded successfully. Response: ' + data);
                    });
//                    }

                });

                if ($stateParams.type && $stateParams.list_id) {
                    var type = $stateParams.type;
                    console.log(type);
                    $scope.list_id = $stateParams.list_id;
                    $scope.step_type = type;
                    if (type === 'camera') {
                        $scope.browseCamera('camera');
                    } else if (type === 'gallary') {
                        $scope.browseCamera('gallary');
                    } else if (type === 'image_url') {
                    } else if (type === 'image') {
                    } else if (type === 'url') {
                    } else if (type === 'near') {
                        $scope.showMap();
                    } else {
                        toast.showShortBottom('Invalid Type');
                        urlHelper.openWishlistAddStep1();
                    }
                } else {
                    toast.showShortBottom('Invalid Type')
                    urlHelper.openWishlistAddStep1();
                }
            }
        ]);