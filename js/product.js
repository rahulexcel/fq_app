var productMod = angular.module('ProductMod', ['ionic', 'ProductService', 'ServiceMod']);

productMod.controller('ProductCtrl',
        ['$scope', '$stateParams', 'productHelper', 'dataShare', 'toast', '$localStorage', '$timeout', '$location', '$rootScope', 'socialJs', 'timeStorage', '$ionicSlideBoxDelegate', 'ajaxRequest', 'CDN',
            function ($scope, $stateParams, productHelper, dataShare, toast, $localStorage, $timeout, $location, $rootScope, socialJs, timeStorage, $ionicSlideBoxDelegate, ajaxRequest, CDN) {
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
                        window.plugins.socialsharing.share(product.name, null, product.img, product.desktop_href, function () {
                        }, function () {
                            toast.showShortBottom('Unable to Share');
                        });
                    };
                    $scope.twitter = function (product) {
                        window.plugins.socialsharing.shareViaTwitter(
                                product.name, product.img, product.desktop_href, function () {
                                }, function () {
                            toast.showShortBottom('Unable to Share');
                        });
                    };
                    $scope.whatsapp = function (product) {
                        window.plugins.socialsharing.shareViaWhatsApp(
                                product.name, product.img, product.desktop_href, function () {
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
                            href: product.desktop_href,
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
                $scope.viewBrand = function (product) {

                };
                $scope.product_detail_loading = false;
                $scope.productInfo = function (force) {
                    var product_id = $scope.product_id;
                    var cache_key = 'product_' + product_id;
                    if (timeStorage.get(cache_key) && !force) {
                        var data = timeStorage.get(cache_key);
                        $scope.processProductData(data);
                        $ionicSlideBoxDelegate.update();
                        $scope.fetchLatest(data.product.org_href);
                    } else {
                        $scope.product_detail_loading = true;
                        var ajax = productHelper.fetchProduct(product_id);
                        ajax.then(function (data) {
                            $scope.product_detail_loading = false;
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
                    if (!href) {
                        return;
                    }
                    var ajax2 = productHelper.fetchLatest(href);
                    ajax2.then(function (data) {
                        var price = data.price;
                        var more_images = data.more_images;

                        price = Math.round(price);
                        if (price > 0)
                            $scope.product.price = price;
                        if (more_images && more_images.length > 0) {
                            $scope.product.more_images = more_images;
                        } else {
                        }
                        $ionicSlideBoxDelegate.update();
                    });
                };
                $scope.processProductData = function (data) {
//                    var img = data.product.img;
                    var prod_id = data.product._id;
                    data.product.img = CDN.cdnize(ajaxRequest.url('v1/picture/images/' + prod_id));
                    $scope.product = data.product;
                    if (data.variants)
                        $scope.product.variants = data.variants;
                    if (data.similar)
                        $scope.product.similar = data.similar;
                    if (data.similar && data.similar.length > 0) {
                        console.log('initiazling iscroll');
                        angular.element(document.querySelector('#scroller')).attr('style', 'width:' + (data.similar.length * 160) + "px");
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
                    if (window.analytics) {
                        window.analytics.trackEvent('Pin', 'Product Page', $location.path());
                    }
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
                        $location.path('/app/signup');
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