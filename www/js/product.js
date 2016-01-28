var productMod = angular.module('ProductMod', ['ionic', 'ProductService', 'ServiceMod', 'UrlService']);

productMod.controller('ProductCtrl',
        ['$scope', '$stateParams', 'productHelper', 'dataShare', 'toast', '$localStorage', '$timeout', '$rootScope', 'socialJs', 'timeStorage', '$ionicSlideBoxDelegate', '$ionicHistory', 'urlHelper', 'accountHelper', '$ionicModal', '$window', '$ionicScrollDelegate',
            function ($scope, $stateParams, productHelper, dataShare, toast, $localStorage, $timeout, $rootScope, socialJs, timeStorage, $ionicSlideBoxDelegate, $ionicHistory, urlHelper, accountHelper, $ionicModal, $window, $ionicScrollDelegate) {
                $scope.product_loading = true;
                $scope.product = false;
                $scope.variants = [];
                $scope.similar = [];
                $scope.myScroll = false;
                $scope.product_id = false;
                var cache_key = false;

                $scope.$on('$ionicView.enter', function () {
                    $ionicScrollDelegate.resize();
                    $ionicScrollDelegate.scrollTop();
                });
                $scope.$on('modal.shown', function () {
                    $rootScope.$emit('hide_android_add');
                });
                $scope.$on('modal.hidden', function () {
                    $rootScope.$emit('show_android_add');
                });

                if (window.plugins && window.plugins.socialsharing) {
                    $scope.isMobile = true;

                    $scope.shareAll = function (product) {

                        var share_url = 'http://fashioniq.in/m/p/' + product._id;
                        window.plugins.socialsharing.share(product.name, null, product.img, share_url, function () {
                        }, function () {
                            toast.showShortBottom('Unable to Share');
                        });
                    };
                    $scope.twitter = function (product) {
                        var share_url = 'http://fashioniq.in/m/p/' + product._id;
                        window.plugins.socialsharing.shareViaTwitter(
                                product.name, product.img, share_url, function () {
                                }, function () {
                            toast.showShortBottom('Unable to Share');
                        });
                    };
                    $scope.whatsapp = function (product) {
                        var share_url = 'http://fashioniq.in/m/p/' + product._id;
                        window.plugins.socialsharing.shareViaWhatsApp(
                                product.name, product.img, share_url, function () {
                                }, function () {
                            toast.showShortBottom('Unable to Share');
                        });
                    };

                    $scope.facebook = function (product) {
                        var share_url = 'http://fashioniq.in/m/p/' + product._id;
                        if (window.cordova.platformId === "browser") {
                            if (!accountHelper.isFbInit()) {
                                facebookConnectPlugin.browserInit('765213543516434');
                                accountHelper.fbInit();
                            }
                        }
                        facebookConnectPlugin.showDialog({
                            method: 'share',
                            href: share_url,
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
                $scope.viewWebsite = function (product) {
                    if (product.website_filter_key) {
                        var website = product.website;
                        var cat_id = product.cat_id;
                        var sub_cat_id = product.sub_cat_id;
                        var cat_name = product.cat_name;
                        var website_key = product.website_filter_key;

                        var category_data = {
                            cat_id: cat_id,
                            sub_cat_id: sub_cat_id,
                            name: cat_name,
                            page: 1,
                            search: "",
                            sortby: "popular",
                            title: cat_name,
                            filters: [{
                                    name: website,
                                    param: website_key
                                }]
                        };
                        $ionicHistory.clearCache();
                        timeStorage.set('category_' + cat_id + "_" + sub_cat_id, category_data, 0.1);
                        urlHelper.openCategoryPage(cat_id, sub_cat_id, cat_name);
                    }
                };
                $scope.viewBrand = function (product) {
                    var brand = product.brand;
                    var cat_id = product.cat_id;
                    var sub_cat_id = product.sub_cat_id;
                    var cat_name = product.cat_name;
                    var brand_key = product.brand_filter_key;

                    var category_data = {
                        cat_id: cat_id,
                        sub_cat_id: sub_cat_id,
                        name: cat_name,
                        page: 1,
                        search: "",
                        sortby: "popular",
                        title: cat_name,
                        filters: [{
                                name: brand,
                                param: brand_key
                            }]
                    };
                    console.log(category_data);
                    $ionicHistory.clearCache();
                    timeStorage.set('category_' + cat_id + "_" + sub_cat_id, category_data, 0.1);
                    urlHelper.openCategoryPage(cat_id, sub_cat_id, cat_name);
                };
                var self = this;
                self.fetch_latest_done = false;
                self.product_info_done = false;
                $scope.product_detail_loading = false;
                $scope.productInfo = function (force) {
                    if (self.product_info_done && !force) {
                        return;
                    }
                    self.product_info_done = true;
                    var product_id = $scope.product_id;
                    var cache_key = 'product_' + product_id;
                    if (timeStorage.get(cache_key) && !force) {
                        var data = timeStorage.get(cache_key);
                        $scope.processProductData(data);
                        $ionicSlideBoxDelegate.update();
                        $scope.fetchLatest(data.product.org_href, product_id);
                    } else {
                        $scope.product_detail_loading = true;
                        var ajax = productHelper.fetchProduct(product_id);
                        ajax.then(function (data) {
                            console.log('latest product data');
                            console.log(data);
                            $scope.product_detail_loading = false;
                            $scope.processProductData(data);
                            $ionicSlideBoxDelegate.update();
                            if (!self.fetch_latest_done)
                                $scope.fetchLatest(data.product.org_href, product_id);
                        }, function () {
                            $scope.$broadcast('scroll.refreshComplete');
                        });
                    }
                };
                $scope.show_main_image_in_more = true;
                $scope.$on('image_loaded_more_images0', function () {
                    $scope.show_main_image_in_more = false;
                    $timeout(function () {
                        $ionicSlideBoxDelegate.update();
                    });
                });
                $scope.fetchLatest = function (href, product_id) {
                    if (!href) {
                        return;
                    }
                    self.fetch_latest_done = true;
                    var ajax2 = productHelper.fetchLatest(href, product_id);
                    ajax2.then(function (data) {
                        var price = data.price;
                        var more_images = data.more_images;

                        var data1 = timeStorage.get(cache_key);
                        if (data1) {
                            data1.price = price;
                            data1.more_images = more_images;
                            timeStorage.set(cache_key, data1, 1);
                        }

                        price = Math.round(price);
                        if (price > 0)
                            $scope.product.price = price;
                        if (more_images && more_images.length > 0) {
                            $scope.product.more_images = more_images;
                            $scope.zoom_images = more_images;
                        }
                        if (data.offers) {
                            $scope.product.offers = data.offers;
                        }
                        if (data.delivery_charge) {
                            $scope.product.delivery_charge = data.delivery_charge;
                        }
                        $ionicSlideBoxDelegate.update();
                    });
                };
                $scope.$on('$destory', function () {
                    $scope.myScroll.destroy();
                    $scope.myScroll = null;
                });
                $scope.processProductData = function (data) {
//                    var img = data.product.img;
                    //var prod_id = data.product._id;
//                    data.product.img = CDN.cdnize(ajaxRequest.url('v1/picture/images/' + prod_id));

                    var more_images = false;
                    var more_images_price = false;
                    if ($scope.product.more_images) {
                        more_images = $scope.product.more_images;
                        more_images_price = $scope.product.price;
                    }
                    if (more_images) {
                        data.product.more_images = more_images;
                        data.product.price = more_images_price;
                    }
                    $scope.product = data.product;
                    $scope.product_loading = false;
                    $scope.$broadcast('scroll.refreshComplete');
                    timeStorage.set(cache_key, data, 1);
                    var pid = data.product._id;
                    if (data.similar && data.similar.length > 0) {
                        self.processSimliarData(data, data.product._id);
                    } else {
                        var ajax2 = productHelper.fetchSimilar(data.product._id);
                        ajax2.then(function (data) {
                            self.processSimliarData(data, pid);
                        });
                    }
                    if (data.variants) {
                        self.processVariantData(data);
                    } else {
                        var ajax3 = productHelper.fetchVariant(data.product._id);
                        ajax3.then(function (data) {
                            self.processVariantData(data);
                        });
                    }
                };
                self.processSimliarData = function (data, product_id) {
                    if (data.similar)
                        $scope.product.similar = data.similar;
                    if (data.similar && data.similar.length > 0) {
                        console.log('initiazling iscroll');
                        if (data.similar.length > 0)
                            $timeout(function () {
                                var width = data.similar.length * 153;
                                if (width < $window.innerWidth) {
                                    width = $window.innerWidth;
                                }
                                angular.element(document.querySelector('.scroller_' + product_id)).attr('style', 'width:' + (width) + "px");
                            }, 100);
                        var data2 = timeStorage.get(cache_key);
                        data2.similar = data.similar;
                        timeStorage.set(cache_key, data2, 1);
                        $ionicScrollDelegate.resize();
                    }
                };
                self.processVariantData = function (data) {
                    if (data.variants) {
                        $scope.product.variants = data.variants;
                        var data2 = timeStorage.get(cache_key);
                        data2.variants = data.variants;
                        timeStorage.set(cache_key, data2, 1);
                        $ionicScrollDelegate.resize();
                    }
                };
                $scope.$on('search_product_event', function () {
                    var cat_id = $scope.product.cat_id;
                    var sub_cat_id = $scope.product.sub_cat_id;
                    var name = $scope.product.cat_name;
                    var text = $rootScope.search.text;
                    urlHelper.openCategoryPage(cat_id, sub_cat_id, name, text);
                });
                $scope.$on('product_open', function () {
                    var data = dataShare.getData();
                    console.log('product open event');
                    console.log(data);
                    $scope.product = data;
                    $scope.product_loading = false;
                    $scope.productInfo();
                    if (!self.fetch_latest_done)
                        $scope.fetchLatest(data.org_href, data._id);
                });
                $scope.buy = function (product) {
                    if (!product.href)
                        product.href = product.url;
                    if (window.plugins) {
                        window.open(product.href, '_system');
                    } else {
                        window.open(product.href);
                    }
                };

                $scope.viewCategory = function (product) {
                    if (product.cat_id && product.sub_cat_id) {
                        urlHelper.openCategoryPage(product.cat_id, product.sub_cat_id, product.cat_name);
                    }
                };

                $scope.wishlist = function (product, $event) {
                    if (window.analytics) {
                        window.analytics.trackEvent('Pin', 'Product Page', urlHelper.getPath());
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
                        urlHelper.openSignUp();
                    }
                };
                $scope.openProduct = function (product) {
                    var id = product._id;
                    console.log('open product ' + id);
                    if (!product.img) {
                        product.img = product.image;
                    }
                    dataShare.broadcastData(angular.copy(product), 'product_open');
                    urlHelper.openProductPage(id);
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
                $scope.showZoom = function (index) {
                    var more_images = $scope.product.more_images;
                    var img = $scope.product.img;
                    var final_images = [];
                    final_images.push(img);
                    if (more_images) {
                        final_images = [];
                        for (var i = 0; i < more_images.length; i++) {
                            final_images.push(more_images[i]);
                        }
                    }
                    if (index * 1 === -1) {
                        $scope.zoom_main_image = img;
                    } else {
                        $scope.zoom_main_image = more_images[index * 1];
                    }
                    $scope.zoom_images = final_images;
                    $scope.zoom_height = ($window.innerHeight - 50) + "px";
                    $scope.zoom_modal.show();
                    $timeout(function () {
                        angular.element(document.querySelector('.zoom_similar')).attr('style', 'width:' + (final_images.length * 52) + "px");
                    });
                };
                $scope.closeZoom = function () {
                    $scope.zoom_modal.hide();
                }
                $scope.openZoomTap = function (index) {
                    var more_images = $scope.zoom_images;
                    $scope.zoom_main_image = more_images[index];
                    $ionicScrollDelegate.$getByHandle('zoom-scroll').zoomBy(1, true);
                };
                $ionicModal.fromTemplateUrl('template/partial/zoom.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function (modal) {
                    $scope.zoom_modal = modal;
                });
                $scope.$on('$destroy', function () {
                    $scope.zoom_modal.remove();
                });
            }
        ]);