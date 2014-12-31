var accountMod = angular.module('AccountMod',
        ['ngCordova', 'AccountService', 'ServiceMod', 'ngStorage', 'angularFileUpload', 'ionic']);

accountMod.controller('AccountCtrl',
        ['$scope', '$localStorage', '$location', 'toast', 'accountHelper', '$upload', 'ajaxRequest', '$ionicActionSheet', '$cordovaCamera', 'uploader',
            function ($scope, $localStorage, $location, toast, accountHelper, $upload, ajaxRequest, $ionicActionSheet, $cordovaCamera, uploader) {


                $scope.$on('logout_event', function () {
                    $location.path('/app/signup');
                })
                if (!$localStorage.user.id) {
                    toast.showShortBottom('SignIn To Access This Page');
                    $location.path('/app/signup');
                    return;
                }
                console.log($localStorage.user);
                $scope.login_data = $localStorage.user;
                $scope.profile = {
                    name: $localStorage.user.name,
                    password: '',
                    confirmPassword: '',
                    gender: $localStorage.user.gender
                };
                $scope.is_mobile = false;
                if (window.cordova && window.cordova.plugins) {
                    $scope.is_mobile = true;
                }
                $scope.file_upload = false;
                $scope.file = {
                    myFiles: false
                };


                $scope.browseCamera = function () {
                    $ionicActionSheet.show({
                        buttons: [
                            {text: 'Brower Pictures'},
                            {text: 'Take Picture'}
                        ],
                        destructiveText: 'Remove Picture',
                        titleText: 'Update Your Profile Picture',
                        cancelText: 'Cancel',
                        destructiveButtonClicked: function () {
                            var picture = accountHelper.removePicture();
                            picture.then(function () {
                                $scope.login_data.picture = $localStorage.user.picture;
                            });
                        },
                        buttonClicked: function (index) {

                            var options = {
                                quality: 50,
                                destinationType: Camera.DestinationType.FILE_URI,
                                sourceType: Camera.PictureSourceType.CAMERA,
                                encodingType: Camera.EncodingType.JPEG,
                                targetWidth: 300,
                                targetHeight: 300,
                                popoverOptions: CameraPopoverOptions,
                                saveToPhotoAlbum: false,
                                allowEdit: true,
                                cameraDirection: Camera.Direction.FRONT
                            };

                            if (index == 0) {
                                options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
                            }
                            $cordovaCamera.getPicture(options).then(function (imageURI) {
                                console.log(imageURI);
                                var promise = uploader.fileSize(imageURI);
                                promise.then(function (size) {
                                    if (size > 2) {
                                        toast.showShortBottom('Upload File Of Size Less Than 2MB');
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
                                                var pic = ajaxRequest.url('v1/account/picture/view/' + data.data)
                                                $scope.login_data.picture = pic;
                                                $localStorage.user.picture = pic;
                                            }
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

                $scope.password = function () {
                    var password = $scope.profile.password;
                    var confPassword = $scope.profile.confPassword;

                    if (password.length == 0) {
                        toast.showShortBottom('Enter A Valid Password');
                    } else if (password != confPassword) {
                        toast.showShortBottom('Passwords Don\'t Match');
                    } else {
                        $scope.register_status = 1;
                        var ajax = accountHelper.updatePassword(password);
                        ajax.then(function () {
                            $scope.register_status = 2;
                            toast.showShortBottom('Password Updated');
                        }, function () {
                            $scope.register_status = 3;
                        });
                    }
                }
                $scope.update = function () {
                    var name = $scope.profile.name;
                    var gender = $scope.profile.gender;

                    if (name.length != 0 && gender.length != 0) {
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
                        if (mb_size > 2) {
                            $scope.file = {
                                myFiles: false
                            };
                            toast.showShortBottom('Upload File Of Size Less Than 2MB');
                            return;
                        }

                        $scope.file_upload = true;
                        $scope.upload = $upload.upload({
                            url: ajaxRequest.url('v1/account/picture'),
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
                                var pic = ajaxRequest.url('v1/account/picture/view/' + data.data)

                                $scope.login_data.picture = pic;
                                $localStorage.user.picture = pic;
                            }

//                            console.log('file ' + config.file.name + 'is uploaded successfully. Response: ' + data);
                        });
                    }

                });
            }
        ]);