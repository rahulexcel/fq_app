var accountMod = angular.module('AccountMod',
        ['ngCordova', 'AccountService', 'ServiceMod', 'ngStorage', 'angularFileUpload', 'ionic', 'UrlService']);

accountMod.controller('AccountCtrl',
        ['$scope', '$localStorage', 'toast', 'accountHelper', '$upload', 'ajaxRequest', '$ionicActionSheet', '$cordovaCamera', 'uploader', '$window', '$ionicBackdrop', 'urlHelper',
            function ($scope, $localStorage, toast, accountHelper, $upload, ajaxRequest, $ionicActionSheet, $cordovaCamera, uploader, $window, $ionicBackdrop, urlHelper) {

                $scope.$on('doRefresh', function () {
                    $scope.$emit('getUserData');
                });
                $scope.$on('logout_event', function () {
                    urlHelper.openSignUp();
                });
                if (!$localStorage.user.id) {
                    toast.showShortBottom('SignIn To Access This Page');
                    urlHelper.openSignUp();
                    return;
                }
                $scope.login_data = $localStorage.user;
                var picture_width = $window.innerWidth;
                picture_width = Math.ceil(picture_width * 0.95);
                if (picture_width > 640) {
                    picture_width = 640;
                }
                $scope.picture_width = picture_width;

                $scope.profile = {
                    name: $localStorage.user.name,
                    password: '',
                    confirmPassword: '',
                    gender: $localStorage.user.gender
                };
                $scope.password = function () {
                    var password = $scope.profile.password;
                    var confPassword = $scope.profile.confPassword;

                    if (password.length === 0) {
                        toast.showShortBottom('Enter A Valid Password');
                    } else if (password !== confPassword) {
                        toast.showShortBottom('Passwords Don\'t Match');
                    } else {
                        if ($scope.register_status === 1) {
                            toast.showProgress();
                            return;
                        }
                        $scope.register_status = 1;
                        var ajax = accountHelper.updatePassword(password);
                        ajax.then(function () {
                            $scope.register_status = 2;
                            toast.showShortBottom('Password Updated');
                        }, function () {
                            $scope.register_status = 3;
                        });
                    }
                };
                $scope.update = function () {
                    var name = $scope.profile.name;
                    var gender = $scope.profile.gender;

                    if (name.length !== 0 && gender.length !== 0) {

                        if ($scope.register_status === 1) {
                            toast.showProgress();
                            return;
                        }

                        $scope.register_status = 1;
                        var ajax = accountHelper.updateProfile({
                            name: name,
                            gender: gender
                        });
                        ajax.then(function () {
                            $scope.register_status = 2;
                            toast.showShortBottom('Profile Updated');
                        }, function () {
                            $scope.register_status = 3;
                        });
                    } else {
                        toast.showShortBottom('Fill Up Name and Gender');
                    }
                };

                $scope.is_mobile = false;
                if (window.cordova && window.cordova.plugins) {
                    $scope.is_mobile = true;
                }
                $scope.file_upload = false;
                $scope.file = {
                    myFiles: false
                };
                $scope.$on('open_camera', function () {
                    //called from acccount.js when clicking on top pic
                    $scope.browseCamera();
                });
                $scope.browseCamera = function () {
                    var actionSheet = $ionicActionSheet.show({
                        buttons: [
                            {text: 'Browse Picture'},
                            {text: 'Take Picture'}
                        ],
                        destructiveText: 'Remove Picture',
                        titleText: 'Update Your Profile Picture',
                        cancelText: 'Cancel',
                        destructiveButtonClicked: function () {
                            actionSheet();
                            var picture = accountHelper.removePicture();
                            picture.then(function () {
                                $scope.login_data.picture = $localStorage.user.picture;
                                $scope.$parent.user.picture = $localStorage.user.picture;
                            });
                        },
                        buttonClicked: function (index) {
                            actionSheet();
                            var options = {
                                quality: 100,
                                destinationType: Camera.DestinationType.FILE_URI,
                                sourceType: Camera.PictureSourceType.CAMERA,
//                                encodingType: Camera.EncodingType.JPEG,
                                popoverOptions: CameraPopoverOptions,
                                saveToPhotoAlbum: false,
                                allowEdit: false,
                                cameraDirection: Camera.Direction.FRONT
                            };

                            if (index === 0) {
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
                                        $ionicBackdrop.retain();
                                        $scope.file_upload = true;
                                        var ajax = uploader.upload(imageURI, {
                                            user_id: $localStorage.user.id
                                        });
                                        ajax.then(function (data) {
                                            var per = '99%';
                                            $scope.progoress_style = {width: per};
                                            $scope.progress = per;
                                            console.log(data);
                                            if (data && data.data) {
                                                var ajax = accountHelper.updatePicture(data.data);
                                                ajax.then(function () {
                                                    var per = '100%';
                                                    $scope.progoress_style = {width: per};
                                                    $scope.progress = per;
                                                    $ionicBackdrop.release();
                                                    var pic = ajaxRequest.url('v1/picture/view/' + data.data);
                                                    $scope.login_data.picture = pic;
                                                    $localStorage.user.picture = pic;
                                                    $scope.$parent.user.picture = pic;
                                                    $scope.file_upload = false;
                                                    $scope.$evalAsync();
                                                }, function () {
                                                    var per = '100%';
                                                    $scope.progoress_style = {width: per};
                                                    $scope.progress = per;
                                                    $ionicBackdrop.release();
                                                    $scope.file_upload = false;
                                                });
                                            }
                                        }, function (data) {
                                            $ionicBackdrop.release();
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
                };

                $scope.$watch('file.myFiles', function (val) {
                    if (!val) {
                        return;
                    }
                    console.log($scope.file.myFiles);
//                    for (var i = 0; i < $scope.file.myFiles.length; i++) {
                    var i = 0;
                    var file = $scope.file.myFiles[i];
                    var size = file.size;

                    var mb_size = Math.ceil((size / (1024 * 1024)));
                    console.log(mb_size);
                    if (mb_size > 5) {
                        $scope.file = {
                            myFiles: false
                        };
                        toast.showShortBottom('Upload File Of Size Less Than 2MB');
                        return;
                    }

                    $scope.file_upload = true;
                    $ionicBackdrop.retain();
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
                        var per = '99%';
                        $scope.progoress_style = {width: per};
                        $scope.progress = per;

                        if (data.data) {
                            var ajax = accountHelper.updatePicture(data.data);
                            ajax.then(function () {
                                var per = '100%';
                                $scope.progoress_style = {width: per};
                                $scope.progress = per;
                                $ionicBackdrop.release();
                                var pic = ajaxRequest.url('v1/picture/view/' + data.data);
                                $scope.login_data.picture = pic;
                                $localStorage.user.picture = pic;
                                $scope.$parent.user.picture = pic;
                                $scope.file_upload = false;
                                $scope.$evalAsync();
                            }, function () {
                                $scope.file_upload = false;
                            });
                        }
                    });

                });
                $scope.updateFacebookImage = function () {
                    var ajax = accountHelper.updateFacebookPics();
                    ajax.then(function (data) {
                        $localStorage.user.picture = data;
                        $scope.login_data.picture = data;
                        $scope.$parent.user.picture = data;
                        $scope.$evalAsync();
                    });
                };
            }
        ]);