var productMod = angular.module('ProductMod', ['ionic', 'ProductService', 'ServiceMod']);

productMod.controller('ProductCtrl',
        ['$scope', '$stateParams', 'productHelper', 'dataShare', 'wishlistHelper', 'toast', '$localStorage', '$timeout', '$location', '$rootScope', '$ionicModal',
            function ($scope, $stateParams, productHelper, dataShare, wishlistHelper, toast, $localStorage, $timeout, $location, $rootScope, $ionicModal) {
                $scope.product_loading = true;
                $scope.product = false;
                $scope.variants = [];
                $scope.similar = [];
                $scope.myScroll = false;
                $scope.product_id = false;
                $scope.productInfo = function () {
                    var product_id = $scope.product_id;
                    var ajax = productHelper.fetchProduct(product_id);
                    ajax.then(function (data) {
                        $scope.product = data.product;
                        $scope.product.variants = data.variants;
                        $scope.product.similar = data.similar;
                        if (data.similar.length > 0) {
                            console.log('initiazling iscroll');
                            angular.element(document.querySelector('#scroller')).attr('style', 'width:' + (data.similar.length * 200) + "px");
                            $timeout(function () {
                                $scope.myScroll = new IScroll('#similar', {scrollX: true, scrollY: false, mouseWheel: true});
                            }, 500);
                        }
                        $scope.product_loading = false;
                        $scope.$broadcast('scroll.refreshComplete');

                    }, function () {
                        $scope.$broadcast('scroll.refreshComplete');
                    });
                }
                $scope.$on('search_product_event', function () {
                    var cat_id = $scope.product.cat_id;
                    var sub_cat_id = $scope.product.sub_cat_id;
                    var name = $scope.product.cat_name;
                    var text = $rootScope.search.text;
                    $location.path('/app/category/' + cat_id + "/" + sub_cat_id + "/" + name + "/" + text);
                })
                $scope.$on('product_open', function () {
                    var data = dataShare.getData();
                    console.log('product open event');
                    console.log(data);
                    $scope.product = data;
                    $scope.product_loading = false;
                })
                $scope.buy = function (product) {
                    if (window.plugins) {
                        window.open(product.href, '_system');
                    } else {
                        window.open(product.href);
                    }
                }


                $scope.$on('$destroy', function () {
                    $scope.modal.remove();
                });
                $scope.closeModel = function () {
                    $scope.modal.hide();
                }
                $ionicModal.fromTemplateUrl('template/partial/wishlist-select.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.modal = modal;
                });

                $scope.newList = function (product) {
                    dataShare.broadcastData(product, 'wishlist_add');
                    $location.path('/app/wishlist_add');
                }
                $scope.wishlist_product = false;
                $scope.newList = function (product) {
                    dataShare.broadcastData(product, 'wishstlist_new');
                    $scope.closeModel();
                    $location.path('/app/wishlist_add');
                }
                $scope.selectList = function (list) {
                    $scope.closeModel();
                    $scope.wishlist_product.wishlist_status = 1;
                    var ajax2 = wishlistHelper.add($scope.wishlist_product._id, list._id);
                    ajax2.then(function () {
                        $scope.wishlist_product.wishlist_status = 2;
                    }, function (message) {
                        toast.showShortBottom(message);
                        $scope.wishlist_product.wishlist_status = 3;
                    });
                }
                $scope.wishlist = function (product, $event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    if ($localStorage.user.id) {
                        $scope.wishlist_product = product;
                        var ajax = wishlistHelper.list();
                        ajax.then(function (data) {
                            $scope.lists = data;
                        });
                        $scope.modal.show();
                    } else {
                        if (!$localStorage.previous) {
                            $localStorage.previous = {};
                        }
                        $localStorage.previous.state = {
                            function: 'wishlist',
                            param: angular.copy($scope.product)
                        };
                    }
                }
                $scope.openProduct = function (product) {
                    var id = product._id;
                    console.log('open product ' + id);
                    $location.path('/app/product/' + id);
                    dataShare.broadcastData(angular.copy(product), 'product_open');
                }
                if ($stateParams.product_id) {
                    $scope.product_loading = true;
                    $scope.product = false;
                    $scope.variants = [];
                    $scope.similar = [];
                    $scope.myScroll = false;
                    var product_id = $stateParams.product_id;
                    $scope.product_id = product_id;
                    $scope.productInfo();
                }
            }
        ]);