var wishlistnewMod = angular.module('WishlistNewMod', ['ServiceMod', 'ngStorage', 'ionic', 'WishlistService', 'FriendService']);

wishlistnewMod.controller('WishlistNewCtrl',
        ['$scope', '$localStorage', 'toast', 'wishlistHelper', 'dataShare', '$location', '$ionicModal', 'friendHelper',
            function ($scope, $localStorage, toast, wishlistHelper, dataShare, $location, $ionicModal, friendHelper) {
                if ($localStorage.user.id) {
                    $scope.product = false;
//                    var product = dataShare.getData('wishstlist_new');
//                    if (!product) {
//                        toast.showShortBottom('Invalid Request No Product');
//                        //put history in play here
//                        $location.path('/app/home');
//                    } else {
//                        $scope.product = product;
//                    }

                    $scope.types = [
                        {text: 'Private', value: 'private'},
                        {text: 'Public', value: 'public'}
                    ];
                    $scope.list = {
                        type: 'public',
                        name: '',
                        description: '',
                        shared_ids: []
                    }


                    $scope.create = function () {
                        $scope.status = 1;
                        var ajax = wishlistHelper.create(angular.copy($scope.list));
                        ajax.then(function (data) {
                            $scope.status = 2;
                        }, function () {
                            $scope.status = 3;
                        });
                    }

                    $scope.$watch('list.type', function (val) {
                        console.log(val);
                        if (val && val == 'private') {
                            if ($scope.friends && $scope.friends.length > 0)
                                $scope.modal.show();
                        }
                    })

                    $scope.friend_load = false;
                    $scope.friends = [{
                            id: -1,
                            name: 'Only Me'
                        }];
                    var ajax = friendHelper.list();
                    ajax.then(function (data) {
                        data.unshift({
                            id: -1,
                            name: 'Only Me'
                        });
                        $scope.friends = data;
                        $scope.friend_load = true;
                    }, function () {
                        $scope.friend_load = true;
                    });

                    $scope.selectFriend = function (friend) {
                        if (friend) {
                            var id = friend.id;
                            friend.checked = true;
                            if (id == -1) {
                                var friends = $scope.friends;
                                for (var i = 0; i < friends.length; i++) {
                                    if (i == 0) {
                                        continue;
                                    } else {
                                        friends[i].checked = false;
                                    }
                                }
                                $scope.friends = friends;
                                $scope.list.shared_ids = [];
                                $scope.modal.hide();
                            } else {
                                $scope.friends[0].checked = false;
                                var shared_ids = $scope.list.shared_ids;
                                if (shared_ids.indexOf(id) == -1) {
                                    shared_ids.push(id);
                                }
                                $scope.list.shared_ids = shared_ids;
                            }
                        } else {
                            $scope.list.shared_ids = [];
                            $scope.modal.hide();
                        }
                    }


                    $scope.$on('$destroy', function () {
                        $scope.modal.remove();
                    });
                    $scope.closeModel = function () {
                        $scope.modal.hide();
                    }
                    $ionicModal.fromTemplateUrl('template/partial/friend-select.html', {
                        scope: $scope,
                        animation: 'slide-in-up'
                    }).then(function (modal) {
                        $scope.modal = modal;
                    });



                } else {
                    toast.showShortBottom('You Need To Be Logged In To Access This Page');
                }


            }
        ]);