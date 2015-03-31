var homecatMod = angular.module('HomeCatMod', ['ServiceMod']);

homecatMod.controller('HomeCatCtrl',
        ['$scope', 'friendHelper', 'CDN', '$localStorage', '$location', 'pinchServie', 'toast', 'itemHelper',
            function ($scope, friendHelper, CDN, $localStorage, $location, pinchServie, toast, itemHelper) {
                $scope.currentState = {};
                $scope.product_loading = false;
                $scope.showProducts = false;
                $scope.page = 0;
                $scope.products = [];
                var self = this;
                $scope.nextPage = function () {
                    $scope.page++;
                    self.fetchProduct();
                };
                $scope.openProduct = function (product) {
                    var id = product._id;
                    console.log('open product ');
                    $location.path('/app/product/' + id);
//                    product = angular.copy(product);
//                    product.cat_name = $scope.current_category.name;
//                    dataShare.broadcastData(product, 'product_open');
                };
                $scope.refreshCategory = function () {
                    $scope.page = 0;
                    $scope.products = [];
                    self.fetchProduct();
                };
                var self = this;
                self.women = true;
                if ($localStorage.latest_show && $localStorage.latest_show == 'men') {
                    self.women = false;
                }
                $scope.$on('show_women', function () {
                    self.women = true;
                    $scope.page = 0;
                    $scope.products = [];
                    self.fetchProduct();
                });
                $scope.$on('show_men', function () {
                    self.women = false;
                    $scope.page = 0;
                    $scope.products = [];
                    self.fetchProduct();
                });
                self.fetchProduct = function () {
                    var page = $scope.page;
                    $scope.product_loading = true;
                    var ajax = friendHelper.home_latest(page, self.women);
                    ajax.then(function (data) {
                        $scope.product_loading = false;
                        if (data.length === 0) {
                            $scope.showProducts = false;
                        } else {
                            $scope.showProducts = true;
                        }
                        var products = $scope.products;
                        for (var i = 0; i < data.length; i++) {
                            var image = data[i]._id;
                            //data[i].img = CDN.cdnize(ajaxRequest.url('v1/picture/images/' + image));
                            products.push(data[i]);
                        }
                        $scope.products = products;
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }, function () {
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        $scope.product_loading = false;
                        $scope.showProducts = false;
                    });
                };
                self.fetchProduct();
                var self = this;
                self.getPinObj = function (active_pin) {
                    for (var i = 0; i < $scope.products.length; i++) {
                        if ($scope.products[i]._id === active_pin) {
                            return $scope.products[i];
                        }
                    }
                    return false;
                };
                $scope.$on('first', function () {
                    var item = self.getPinObj(pinchServie.active_pin);
                    $scope.wishlist(item);
                });
                $scope.$on('third', function () {
                    var item = self.getPinObj(pinchServie.active_pin);
                    $scope.whatsapp(item);
                });
                $scope.$on('fourth', function () {
                    var item = self.getPinObj(pinchServie.active_pin);
                    $scope.facebook(item);
                });
                $scope.facebook = function (item) {
                    var share_url = 'http://fashioniq.in/m/p/' + item._id;
                    var picture = item.img;
                    var name = item.name;
                    if (name.length === 0) {
                        name = 'Awesome Clip!';
                    }
                    if (window.cordova.platformId === "browser") {
                        if (!accountHelper.isFbInit()) {
                            facebookConnectPlugin.browserInit('765213543516434');
                            accountHelper.fbInit();
                        }
                    }
                    facebookConnectPlugin.showDialog({
                        method: 'share',
                        href: share_url,
                        message: name,
                        picture: picture
                    }, function (data) {
                    }, function (data) {
                        toast.showShortBottom('Unable to Share');
                    });
                };
                $scope.whatsapp = function (item) {
                    var share_url = 'http://fashioniq.in/m/p/' + item._id;
                    var picture = item.img;
                    var name = item.name;
                    if (name.length === 0) {
                        name = 'Awesome Clip!';
                    }
                    console.log(name + "XXXcathm" + picture + "XXX" + share_url);
                    window.plugins.socialsharing.shareViaWhatsApp(
                            name, picture, share_url, function () {
                            }, function (e) {
                        console.log(e);
                        toast.showShortBottom('Unable to Share! App Not Found');
                    });
                };
                $scope.like = function (item) {
                    if (window.analytics) {
                        window.analytics.trackEvent('Like', 'Pins Page', $location.path());
                    }

                    var item_id = item._id;
                    var list_id = item.original.list_id;
                    if (!$localStorage.user.id) {
                        toast.showShortBottom('SignUp To Like Item');
                        $location.path('/app/signup');
                    } else {
                        if ($scope.request_process) {
                            toast.showProgress();
                            return;
                        }
                        $scope.request_process = true;
                        var ajax = itemHelper.like(item_id, list_id);
                        ajax.then(function (data) {
                            toast.showShortBottom('Item Liked');
                            $scope.request_process = false;
                        }, function () {
                            $scope.request_process = false;
                        });
                    }
                };
                $scope.wishlist = function (product, $event) {
                    if (window.analytics) {
                        window.analytics.trackEvent('Pin', 'Latest Page', $location.path());
                    }
                    if ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                    }
                    if ($localStorage.user.id) {
                        $scope.wishlist_product.item = false;
                        $scope.wishlist_product.new_item = false;
                        $scope.wishlist_product.product = product;
                        $scope.$parent.showWishlist();
                    } else {
                        toast.showShortBottom('SignUp To Add Item To Wishlist');
                        if (!$localStorage.previous) {
                            $localStorage.previous = {};
                        }
                        $localStorage.previous.state = {function: 'wishlist',
                            param: angular.copy(product),
                            category: angular.copy($scope.currentState)
                        };
                        $location.path('/app/signup');
                    }
                };
            }
        ]);