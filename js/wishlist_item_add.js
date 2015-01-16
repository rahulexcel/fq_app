var wishlistItemAddMod = angular.module('WishlistItemAddMod', ['ServiceMod', 'angularFileUpload', 'ngStorage', 'ionic', 'WishlistService', 'MapService']);

wishlistItemAddMod.controller('WishlistItemAddCtrl',
        ['$scope', 'ajaxRequest', '$upload', '$localStorage', 'toast', 'wishlistHelper', '$location', '$stateParams', 'mapHelper', '$ionicModal', '$window', '$ionicActionSheet', '$ionicTabsDelegate', '$ionicPopup',
            function ($scope, ajaxRequest, $upload, $localStorage, toast, wishlistHelper, $location, $stateParams, mapHelper, $ionicModal, $window, $ionicActionSheet, $ionicTabsDelegate, $ionicPopup) {
                $scope.item = {
                    picture: '',
                    url: '',
                    name: '',
                    price: '',
                    location: {
                    }
                };
                $scope.sendItem = function () {
                    var ajax = wishlistHelper.addItem(angular.copy($scope.item), $scope.list_id);
                    ajax.then(function (data) {
                        if (data.id) {
                            $location.path('/app/item/' + data.id + "/" + $scope.list_id);
                        }
                    });
                }
                $scope.next = function () {
                    if ($scope.item.picture.length > 0) {
                        $ionicTabsDelegate.select(1);
                    } else {
                        toast.showShortBottom('Add Item Picture');
                    }
                };
                $scope.removeLocation = function () {
                    $scope.item.location = {};
                }
                $scope.tab1 = function () {
                    $ionicTabsDelegate.select(0);
                }
                $scope.tab2 = function () {
                    if ($scope.item.picture.length > 0) {
                        $ionicTabsDelegate.select(1);
                    } else {
                        toast.showShortBottom('Add Item Picture');
                    }
                }

                $scope.$on('$destroy', function () {
                    $scope.modal.remove();
                    mapHelper.destroy();
                });
                $scope.closeModel = function () {
                    var pos = mapHelper.getPosition();
                    if (!pos.lat) {
                        var confirmPopup = $ionicPopup.confirm({
                            title: 'Warning',
                            template: 'No Location Set?'
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
                }
                $ionicModal.fromTemplateUrl('template/partial/map.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.modal = modal;
                });
                console.log('started');

                $scope.$watch('item.url', function (val) {
                    if (val) {
                        var ajax = wishlistHelper.getUrlImage(val);
                        $scope.url_loading = true;
                        ajax.then(function (data) {
                            $scope.url_loading = false;
                            if (data.image && data.image.image) {
                                var image = data.image.image;
                                $scope.item.picture = image;
                            }
                        }, function () {
                            $scope.url_loading = false;
                        })
                    }
                })
                $scope.showMap = function () {
                    var height = $window.innerHeight * 1 - 44;
                    $scope.height = height + 'px';


                    $scope.setHeight = {};

                    $scope.modal.show();
                    mapHelper.initMap($scope);
                }

                if ($localStorage.user.id) {
                    $scope.list_id = false;
                    if ($stateParams.list_id) {
                        $scope.list_id = $stateParams.list_id;
                        var name = wishlistHelper.getListName($scope.list_id);
                        $scope.wishlist_name = name;
                    } else {
                        toast.showShortBottom('Invalid Page, Need List ID');
                        $location.path('/app/home');
                    }
                } else {
                    toast.showShortBottom('You Need To Be Logged In To Access This Page');
                    $location.path('/app/register');
                }



                $scope.is_mobile = false;
                if (window.cordova && window.cordova.plugins) {
                    $scope.is_mobile = true;
                }
                $scope.file_upload = false;
                $scope.file = {
                    myFiles: false
                };
                var picture_width = $window.innerWidth;
                picture_width = Math.ceil(picture_width * .95);
                $scope.picture_width = picture_width;
                $scope.browseCamera = function () {
                    $ionicActionSheet.show({
                        buttons: [
                            {text: 'Brower Pictures'},
                            {text: 'Take Picture'}
                        ],
                        destructiveText: 'Remove Picture',
                        titleText: 'Add Picture To Share',
                        cancelText: 'Cancel',
                        destructiveButtonClicked: function () {
                            var picture = accountHelper.removePicture();
                            picture.then(function () {
                                $scope.login_data.picture = $localStorage.user.picture;
                            });
                        },
                        buttonClicked: function (index) {

                            var options = {
                                quality: 100,
                                destinationType: Camera.DestinationType.FILE_URI,
                                sourceType: Camera.PictureSourceType.CAMERA,
                                encodingType: Camera.EncodingType.JPEG,
                                popoverOptions: CameraPopoverOptions,
                                saveToPhotoAlbum: false,
                                allowEdit: false
                            };

                            if (index == 0) {
                                options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
                            }

                            $cordovaCamera.getPicture(options).then(function (imageURI) {
                                console.log(imageURI);
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
                                            user_id: $localStorage.user.id
                                        });
                                        ajax.then(function (data) {
                                            var per = '100%';
                                            $scope.progoress_style = {width: per};
                                            $scope.progress = per;
                                            console.log(data);
                                            if (data && data.data) {
                                                var pic = ajaxRequest.url('v1/picture/view/' + data.data);
                                                $scope.login_data.picture = pic;
                                            }
                                            $scope.step1Class = 'red-back';
                                            $scope.file_upload = false;
                                        }, function (data) {

                                        }, function (data) {
                                            var per = data.progress + '%';
                                            $scope.progoress_style = {width: per};
                                            $scope.progress = per;
                                        });
                                    }
                                });

                            }, function (err) {
                                // error
                            });
                            return true;
                        }
                    });
                }

                $scope.$watch('file.myFiles', function (val) {
                    if (!val) {
                        return;
                    }
                    console.log($scope.file.myFiles);
                    for (var i = 0; i < $scope.file.myFiles.length; i++) {
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
                        $scope.upload = $upload.upload({
                            url: ajaxRequest.url('v1/picture/upload'),
                            data: {user_id: $localStorage.user.id},
                            file: file
                        }).progress(function (evt) {
                            var per = parseInt(100.0 * evt.loaded / evt.total) + '%';
                            $scope.progoress_style = {width: per};
                            $scope.progress = per;
//                            console.log('progress: ' +  + '% file :' + evt.config.file.name);
                        }).success(function (data, status, headers, config) {
                            var per = '100%';
                            $scope.progoress_style = {width: per};
                            $scope.progress = per;

                            console.log(data);
                            if (data.data) {
                                var pic = ajaxRequest.url('v1/picture/view/' + data.data);
                                $scope.item.picture = pic;
                            }
                            $scope.file_upload = false;
                            $scope.step1Class = 'red-back';

//                            console.log('file ' + config.file.name + 'is uploaded successfully. Response: ' + data);
                        });
                    }

                });
            }
        ]);