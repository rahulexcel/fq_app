var productMod = angular.module('ProductMod', ['ionic', 'ProductService', 'ServiceMod']);

productMod.controller('ProductCtrl',
        ['$scope', '$stateParams', 'productHelper', 'dataShare', 'toast', '$localStorage', '$timeout', '$location', '$rootScope', 'socialJs', 'timeStorage', '$ionicSlideBoxDelegate',
            function ($scope, $stateParams, productHelper, dataShare, toast, $localStorage, $timeout, $location, $rootScope, socialJs, timeStorage, $ionicSlideBoxDelegate) {
                $scope.product_loading = true;
                $scope.product = false;
                $scope.variants = [];
                $scope.similar = [];
                $scope.myScroll = false;
                $scope.product_id = false;
                var cache_key = false;

                if (window.plugins && window.plugins.socialsharing) {
                    $scope.isMobile = true;

                    $scope.shareAll = function (product) {
                        window.plugins.socialsharing.share(product.name, null, product.img, product.href, function () {
                        }, function () {
                            toast.showShortBottom('Unable to Share');
                        });
                    };
                    $scope.twitter = function (product) {
                        window.plugins.socialsharing.shareViaTwitter(
                                product.name, product.img, product.href, function () {
                                }, function () {
                            toast.showShortBottom('Unable to Share');
                        });
                    };
                    $scope.whatsapp = function (product) {
                        window.plugins.socialsharing.shareViaWhatsApp(
                                product.name, product.img, product.href, function () {
                                }, function () {
                            toast.showShortBottom('Unable to Share');
                        });
                    };

                    $scope.facebook = function (product) {
                        if (window.cordova.platformId === "browser") {
                            if (!accountHelper.isFbInit()) {
                                facebookConnectPlugin.browserInit('765213543516434');
                                accountHelper.fbInit();
                            }
                        }
                        facebookConnectPlugin.showDialog({
                            method: 'share',
                            href: product.href,
                            message: product.name,
                            picture: product.img
                        }, function (data) {
                            console.log(data);
                        }, function (data) {
                            console.log(data);
                            toast.showShortBottom('Unable to Share');
                        });
                    };
                } else {
                    $scope.isMobile = false;
                    socialJs.addSocialJs();
                }

                $scope.productInfo = function (force) {
                    var product_id = $scope.product_id;
                    var cache_key = 'product_' + product_id;
                    if (timeStorage.get(cache_key) && !force) {
                        var data = timeStorage.get(cache_key);
                        $scope.processProductData(data);
                        $ionicSlideBoxDelegate.update();
                        $scope.fetchLatest(data.product.org_href);
                    } else {

                        var ajax = productHelper.fetchProduct(product_id);
                        ajax.then(function (data) {
                            timeStorage.set(cache_key, data, 1);
                            $scope.processProductData(data);
                            $ionicSlideBoxDelegate.update();
                            $scope.fetchLatest(data.product.org_href);
                        }, function () {
                            $scope.$broadcast('scroll.refreshComplete');
                        });
                    }
                };
                $scope.fetchLatest = function (href) {
                    if(!href){
                        return;
                    }
                    var ajax2 = productHelper.fetchLatest(href);
                    ajax2.then(function (data) {
                        console.log(data);

                        var price = data.price;
//                                var image = data.image;
                        var more_images = data.more_images;

                        price = Math.round(price);

                        $scope.product.price = price;
                        if (more_images && more_images.length > 0) {
                            $scope.product.more_images = more_images;
                        } else {
                        }
                        $ionicSlideBoxDelegate.update();
                    });
                }
                $scope.processProductData = function (data) {
                    console.log(data);
                    $scope.product = data.product;
                    if (data.variants)
                        $scope.product.variants = data.variants;
                    if (data.similar)
                        $scope.product.similar = data.similar;
                    if (data.similar && data.similar.length > 0) {
                        console.log('initiazling iscroll');
                        angular.element(document.querySelector('#scroller')).attr('style', 'width:' + (data.similar.length * 120) + "px");
                        if (data.similar.length > 0)
                            $timeout(function () {
                                $scope.myScroll = new IScroll('#similar', {scrollX: true, scrollY: false, eventPassthrough: true, preventDefault: false, tap: true});
                            }, 500);
                    }
                    $scope.product_loading = false;
                    $scope.$broadcast('scroll.refreshComplete');
                };
                $scope.$on('search_product_event', function () {
                    var cat_id = $scope.product.cat_id;
                    var sub_cat_id = $scope.product.sub_cat_id;
                    var name = $scope.product.cat_name;
                    var text = $rootScope.search.text;
                    $location.path('/app/category/' + cat_id + "/" + sub_cat_id + "/" + name + "/" + text);
                });
                $scope.$on('product_open', function () {
                    var data = dataShare.getData();
                    console.log('product open event');
                    console.log(data);
                    $scope.product = data;
                    $scope.product_loading = false;
                });
                $scope.buy = function (product) {
                    if (window.plugins) {
                        window.open(product.href, '_system');
                    } else {
                        window.open(product.href);
                    }
                };

                $scope.viewCategory = function (product) {
                    if (product.cat_id && product.sub_cat_id) {
                        $location.path('/app/category/' + product.cat_id + "/" + product.sub_cat_id + "/" + product.cat_name);
                    }
                };

                $scope.wishlist = function (product, $event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    if ($localStorage.user.id) {
                        $scope.wishlist_product.item = false;
                        $scope.wishlist_product.new_item = false;
                        $scope.wishlist_product.product = product;
                        $scope.$parent.showWishlist();
                    } else {
                        if (!$localStorage.previous) {
                            $localStorage.previous = {};
                        }
                        $localStorage.previous.state = {
                            function: 'wishlist',
                            param: angular.copy($scope.product)
                        };
                        toast.showShortBottom('Login To Create Wishlist');
                        $location.path('/app/register');
                    }
                };
                $scope.openProduct = function (product) {
                    var id = product._id;
                    console.log('open product ' + id);
                    $location.path('/app/product/' + id);
                    dataShare.broadcastData(angular.copy(product), 'product_open');
                };
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