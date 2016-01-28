var wishlistService = angular.module('WishlistService', ['ServiceMod', 'ionic', 'ngCordova']);
wishlistService.factory('wishlistHelper', [
    'ajaxRequest', '$q', 'toast', '$localStorage', 'timeStorage', '$ionicLoading', 'notifyHelper', '$cordovaDialogs', '$ionicPopup', 'productHelper', 'urlHelper',
    function (ajaxRequest, $q, toast, $localStorage, timeStorage, $ionicLoading, notifyHelper, $cordovaDialogs, $ionicPopup, productHelper, urlHelper) {
        var service = {};
        service.getRandomColor = function () {
            var colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b'];
            var index = Math.floor(Math.random() * (colors.length + 1));
            var color = colors[index];
            if (!color) {
                color = colors[0];
            }
            return color;
        };
        service.saveImageUrl = function (url) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/picture/get_url?url=' + encodeURIComponent(url), {}, 'GET');
            ajax.then(function (data) {
                def.resolve(data);
            }, function (message) {
                def.reject();
            });
            return def.promise;
        };
        service.getUrlImage = function (url) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/picture/extract?url=' + encodeURIComponent(url), {}, 'GET');
            ajax.then(function (data) {
                def.resolve(data);
            }, function (message) {
                def.reject();
            });
            return def.promise;
        };
        service.remove = function (item_id, list_id) {
            var def = $q.defer();
            if ($localStorage.user && $localStorage.user.id) {
                var ajax = ajaxRequest.send('v1/wishlist/item/remove', {
                    user_id: $localStorage.user.id,
                    item_id: item_id,
                    list_id: list_id
                });
                ajax.then(function (data) {
                    def.resolve();
                }, function (message) {
                    def.reject({
                        login: 0,
                        message: message
                    });
                });
            } else {
                urlHelper.openSignUp();
                toast.showShortBottom('SignUp To Setup Wishlist and Price Alerts');
                def.reject({
                    login: 1
                });
            }
            return def.promise;
        };
        service.getListName = function (list_id) {
            var user_wish_list = timeStorage.get('user_wish_list');
            if (user_wish_list.public) {
                for (var i = 0; i < user_wish_list.public.length; i++) {
                    if (user_wish_list.public[i]._id === list_id) {
                        return user_wish_list.public[i].name;
                    }
                }
            }
            if (user_wish_list.private) {
                for (var i = 0; i < user_wish_list.private.length; i++) {
                    if (user_wish_list.private[i]._id === list_id) {
                        return user_wish_list.private[i].name;
                    }
                }
            }
            if (user_wish_list.shared) {
                for (var i = 0; i < user_wish_list.shared.length; i++) {
                    if (user_wish_list.shared[i]._id === list_id) {
                        return user_wish_list.shared[i].name;
                    }
                }
            }
            return "";
        };
        service.incListPriority = function (list_id) {
            var user_wish_list_pri = timeStorage.get('user_wish_list_pri');
            if (!user_wish_list_pri) {
                user_wish_list_pri = {};
            }
            if (!user_wish_list_pri[list_id]) {
                user_wish_list_pri[list_id] = 0;
            }
            user_wish_list_pri[list_id]++;
            timeStorage.set('user_wish_list_pri', user_wish_list_pri, 24);
        };
        service.sortList = function (list) {
            var public = list.public;
            var user_wish_list_pri = timeStorage.get('user_wish_list_pri');
            if (public && user_wish_list_pri) {
                for (var i = 0; i < public.length; i++) {
                    if (user_wish_list_pri[public[i]._id]) {
                        public[i].sort_order = user_wish_list_pri[public[i]._id];
                    } else {
                        public[i].sort_order = 0;
                    }
                }
                list.public = public;
            }

            var private = list.private;
            var user_wish_list_pri = timeStorage.get('user_wish_list_pri');
            if (private && user_wish_list_pri) {
                for (var i = 0; i < private.length; i++) {
                    if (user_wish_list_pri[private[i]._id]) {
                        private[i].sort_order = user_wish_list_pri[private[i]._id];
                    } else {
                        private[i].sort_order = 0;
                    }
                }
                list.private = private;
            }

            var shared = list.shared;
            var user_wish_list_pri = timeStorage.get('user_wish_list_pri');
            if (shared && user_wish_list_pri) {
                for (var i = 0; i < shared.length; i++) {
                    if (user_wish_list_pri[shared[i]._id]) {
                        shared[i].sort_order = user_wish_list_pri[shared[i]._id];
                    } else {
                        shared[i].sort_order = 0;
                    }
                }
                list.shared = shared;
            }
            return list;
        };
        service.list = function (force, showLoading) {
            var self = this;
            if (!angular.isDefined(showLoading)) {
                showLoading = true;
            }
            if (!angular.isDefined(force)) {
                force = false;
            }
            var def = $q.defer();
            var user_wish_list = timeStorage.get('user_wish_list');
            if (user_wish_list && !force) {
                return $q.when(self.sortList(angular.copy(user_wish_list)));
            } else if ($localStorage.user && $localStorage.user.id) {
                if (user_wish_list) {
                    def.notify(self.sortList(angular.copy(user_wish_list)));
                }
                if (showLoading)
                    $ionicLoading.show({
                        template: 'Loading...'
                    });
                var ajax = ajaxRequest.send('v1/wishlist/list', {
                    user_id: $localStorage.user.id
                });
                ajax.then(function (data) {
                    if (showLoading)
                        $ionicLoading.hide();

                    var new_data = {
                        shared: [],
                        public: [],
                        private: []
                    };
                    if (data.me) {
                        for (var i = 0; i < data.me.length; i++) {
                            var name = data.me[i].name;
                            var list_symbol = name.substring(0, 1).toUpperCase();
                            var bg_color = service.getRandomColor();
                            data.me[i].list_symbol = list_symbol;
                            data.me[i].bg_color = bg_color;
                            if (data.me[i].type === 'public') {
                                new_data.public.push(data.me[i]);
                            } else if (data.me[i].type === 'private') {
                                new_data.private.push(data.me[i]);
                            } else if (data.me[i].type === 'shared') {
                                data.me[i].user_id = $localStorage.user;
                                new_data.shared.push(data.me[i]);
                            }

                        }
                    }
                    if (data.shared) {
                        for (var i = 0; i < data.shared.length; i++) {
//                            var name = data.shared[i].name;
//                            var list_symbol = name.substring(0, 1).toUpperCase();
//                            var bg_color = service.getRandomColor();
//                            data.shared[i].list_symbol = list_symbol;
//                            data.shared[i].bg_color = bg_color;

                            new_data.shared.push(data.shared[i]);
                        }
                    }
                    timeStorage.set('user_wish_list', new_data, 12);
                    def.resolve(self.sortList(new_data));
                }, function (message) {
                    if (showLoading)
                        $ionicLoading.hide();
                    def.reject({
                        login: 0,
                        message: message
                    });
                });
                return def.promise;
            } else {
                urlHelper.openSignUp();
                toast.showShortBottom('SignUp To Setup Wishlist and Price Alerts');
                def.reject({
                    login: 1
                });
                return def.promise;
            }
        };
        service.listItems = function (list_id, page, item_id) {
            var def = $q.defer();
            //comment out login check code because, when user is logged out and open any item page
            // it redirects him to login page
//            if ($localStorage.user && $localStorage.user.id) {
            var ajax = ajaxRequest.send('v1/wishlist/item/list', {
                user_id: $localStorage.user.id,
                list_id: list_id,
                page: page,
                ignore_item_id: item_id
            });
            ajax.then(function (data) {
                def.resolve(data);
            }, function (message) {
                def.reject(message);
            });
//            } else {
//                urlHelper.openSignUp();
//                toast.showShortBottom('SignUp To Setup Wishlist and Price Alerts');
//                def.reject({
//                    login: 1
//                });
//            }
            return def.promise;
        };
        service.delete = function (list_id) {
            var def = $q.defer();
            if ($localStorage.user && $localStorage.user.id) {
                var ajax = ajaxRequest.send('v1/wishlist/list/delete', {
                    list_id: list_id,
                    user_id: $localStorage.user.id
                });
                ajax.then(function (data) {
                    def.resolve(data);
                }, function (message) {
                    def.reject(message);
                });
            } else {
                urlHelper.openSignUp();
                toast.showShortBottom('SignUp To Setup Wishlist and Price Alerts');
                def.reject({
                    login: 1
                });
            }
            return def.promise;
        };
        service.create = function (list) {
            var def = $q.defer();
            var is_edit_list = false;
            if ($localStorage.user && $localStorage.user.id) {
                list.user_id = $localStorage.user.id;

                if (list.list_id) {
                    is_edit_list = true;
                }
                var ajax = ajaxRequest.send('v1/wishlist/add', list);
                ajax.then(function (data) {
                    def.resolve(data);
                    if (list.type === 'shared' && !list._id && !is_edit_list) {
                        var shared_ids = list.shared_ids;
                        for (var i = 0; i < shared_ids.length; i++) {
                            var uniq_id = new Date().getTime();
                            notifyHelper.sendAlert('user_' + shared_ids[i], {
                                title: 'New Wishlist Shared',
                                message: $localStorage.user.name + " has shared a list with you",
                                meta: {
                                    user: $localStorage.user,
                                    list: {
                                        _id: data._id,
                                        name: data.name
                                    },
                                    type: 'list_created',
                                    uniq_id: uniq_id
                                }
                            });
                            notifyHelper.addUpdate(shared_ids[i], 'list_created', {
                                user: $localStorage.user,
                                list: data
                            }, uniq_id);
                        }
                    }

                }, function (message) {
                    def.reject(message);
                });
            } else {
                urlHelper.openSignUp();
                toast.showShortBottom('SignUp To Setup Wishlist and Price Alerts');
                def.reject({
                    login: 1
                });
            }
            return def.promise;
        };
        //uploading custom image
        service.addItem = function (item, list_id) {
            var def = $q.defer();
            if ($localStorage.user && $localStorage.user.id) {
                var ajax = ajaxRequest.send('v1/wishlist/item/add', {
                    user_id: $localStorage.user.id,
                    item: item,
                    list_id: list_id,
                    type: 'custom'
                });
                ajax.then(function (data) {
                    def.resolve(data);
                    if (data.list) {
                        var followers = data.list.followers;
                        var shared_ids = data.list.shared_ids;
                        console.log(followers);
                        console.log(shared_ids);
                        if (shared_ids.length > 0) {
                            shared_ids.push(data.list.user_id);
                            for (var i = 0; i < shared_ids.length; i++) {
                                if (shared_ids[i] !== $localStorage.user.id) {
                                    notifyHelper.queueAlert('user_' + shared_ids[i]);
                                }
                            }
                        } else {
                            if (data.list.type === 'public') {
                                //no need to send alert for public lists. 
                                //these items will be shown in feed
                                if (followers.length > 0) {
                                    console.log(followers);
                                    //followers only if no shared ids
                                    for (var i = 0; i < followers.length; i++) {
                                        notifyHelper.queueAlert('user_' + followers[i]);
                                    }

                                }

                                var user_followers = data.user.followers;
                                console.log(user_followers);
                                var filtered_user_followers = [];
                                for (var i = 0; i < user_followers.length; i++) {
                                    var follower = user_followers[i];
                                    if (followers.indexOf(follower) === -1) {
                                        filtered_user_followers.push(follower);
                                    }
                                }
                                console.log(filtered_user_followers);
                                for (var i = 0; i < filtered_user_followers.length; i++) {
                                    notifyHelper.queueAlert('user_' + filtered_user_followers[i]);
                                }
                            }
                        }
                        notifyHelper.sendQueue({
                            title: 'New Item Added',
                            alert: 'Item Added To List ' + data.list.name + " by " + $localStorage.user.name,
                            bigPicture: data.wishlist_model.org_img,
                            meta: {
                                type: 'item_add',
                                wishlist_model: data.wishlist_model,
                                list: data.list,
                                user: $localStorage.user,
                                item_id: data.wishlist_model._id
                            }
                        });

                        //need to post to user followers as well
                    }

                }, function (message) {
                    def.reject({
                        login: 0,
                        message: message
                    });
                });
            } else {
                urlHelper.openSignUp();
                toast.showShortBottom('SignUp To Setup Wishlist and Price Alerts');
                def.reject({
                    login: 1
                });
            }
            return def.promise;
        };
        service.viewItem = function (item_id, list_id) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/wishlist/item/view/' + item_id + "/" + list_id, {}, 'GET');
            ajax.then(function (data) {
                def.resolve(data);
            }, function (message) {
                def.reject(message);
            });
            return def.promise;
        };
        service.showPriceAlertDialog = function (product_id, name) {
            var data = productHelper.fetchLatestCache(product_id);
            var cur_price = -1;
            if (data.price) {
                cur_price = data.price;
            }
            // if (cur_price < 20) {
            //     console.log('skipping price alert because price less than 20');
            //     //if price less than 20, then dont set price alert.
            //     //mainly for websites with usd priceing for which we had price Rs. 1
            //     return;
            // }
            if ($localStorage.price_alert_always) {
                service.setPriceAlert(product_id);
            } else {
                if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                    $cordovaDialogs.confirm('Do you want to recieve alerts when price drop for ' + name, 'Price Alert', ['Ok', 'Always', 'Cancel'])
                            .then(function (index) {
                                console.log(index + "price alert");
                                if (index === 1) {
                                    service.setPriceAlert(product_id);
                                } else if (index === 2) {
                                    $localStorage.price_alert_always = true;
                                    service.setPriceAlert(product_id);
                                } else {

                                }
                            });
                } else {
                    $ionicPopup.confirm({
                        template: 'Do you want to recieve alerts when price drop for ' + name,
                        title: 'Price Alert'
                    }).then(function (data) {
                        if (data)
                            service.setPriceAlert(product_id);
                    });
                }
            }
        };
        service.setPriceAlert = function (product_id) {
            console.log('price alert for ' + product_id);
            var data = productHelper.fetchLatestCache(product_id);
            var cur_price = -1;
            if (data.price) {
                cur_price = data.price;
            }

            var ajax = ajaxRequest.send('v1/notify/item/price_alert', {
                user_id: $localStorage.user.id,
                product_id: product_id,
                price: cur_price
            }, true);
            ajax.then(function (data) {
                if (data == 1) {
                    toast.showShortBottom('Price Alert Has Been Setup');
                }
            }, function () {
                toast.showShortBottom('UnExpected Error In Price Alert');
            });
        };
        service.leaveList = function (list) {
            var def = $q.defer();
            var ajax = ajaxRequest.send('v1/wishlist/leave_list', {
                user_id: $localStorage.user.id,
                list_id: list._id
            });
            ajax.then(function () {
                def.resolve();
                if (list.user_id) {
                    var uniq_id = new Date().getTime();
                    notifyHelper.sendAlert('user_' + list.user_id._id, {
                        title: 'Left Your List',
                        message: $localStorage.user.name + " left your list " + list.name,
                        meta: {
                            user: $localStorage.user,
                            list: {
                                _id: list._id,
                                name: list.name
                            },
                            type: 'list_left',
                            uniq_id: uniq_id
                        }
                    });
                    notifyHelper.addUpdate(list.user_id._id, 'list_left', {
                        user: $localStorage.user,
                        list: list
                    }, uniq_id);
                }
            }, function () {
                def.reject();
            });
            return def.promise;
        };
        service.add = function (product_id, list_id) {
            var def = $q.defer();
            var self = this;
            if ($localStorage.user && $localStorage.user.id) {
                var ajax = ajaxRequest.send('v1/wishlist/item/add', {
                    user_id: $localStorage.user.id,
                    product_id: product_id,
                    list_id: list_id,
                    type: 'product'
                });
                ajax.then(function (data) {
                    def.resolve(data);
                    self.showPriceAlertDialog(product_id, data.wishlist_model.name);
                    if (data.list) {
                        var followers = data.list.followers;
                        var shared_ids = data.list.shared_ids;
                        console.log(followers);
                        console.log(shared_ids);
                        if (shared_ids.length > 0) {
                            shared_ids.push(data.list.user_id);
                            for (var i = 0; i < shared_ids.length; i++) {
                                if (shared_ids[i] !== $localStorage.user.id) {
                                    console.log(shared_ids[i]);
                                    notifyHelper.queueAlert('user_' + shared_ids[i]);
                                }
                            }
                        } else {
                            if (data.list.type === 'public') {
                                //no need to send alert for public lists. 
                                //these items will be shown in feed
                                if (followers.length > 0) {
                                    console.log(followers);
                                    //followers only if no shared ids
                                    for (var i = 0; i < followers.length; i++) {
                                        notifyHelper.queueAlert('user_' + followers[i]);
                                    }

                                }

                                var user_followers = data.user.followers;
                                console.log(user_followers);
                                var filtered_user_followers = [];
                                for (var i = 0; i < user_followers.length; i++) {
                                    var follower = user_followers[i];
                                    if (followers.indexOf(follower) === -1) {
                                        filtered_user_followers.push(follower);
                                    }
                                }
                                console.log(filtered_user_followers);
                                for (var i = 0; i < filtered_user_followers.length; i++) {
                                    notifyHelper.queueAlert('user_' + filtered_user_followers[i]);
                                }

                            }
                        }
                        notifyHelper.sendQueue({
                            title: 'New Item Added',
                            alert: 'Item Added To List ' + data.list.name + " by " + $localStorage.user.name,
                            bigPicture: data.wishlist_model.org_img,
                            meta: {
                                type: 'item_add',
                                wishlist_model: data.wishlist_model,
                                list: data.list,
                                user: $localStorage.user,
                                item_id: data.wishlist_model._id
                            }
                        });

                        //need to post to user followers as well
                    }

                }, function (message) {
                    def.reject({
                        login: 0,
                        message: message
                    });
                });
            } else {
                urlHelper.openSignUp();
                toast.showShortBottom('SignUp To Setup Wishlist and Price Alerts');
                def.reject({
                    login: 1
                });
            }
            return def.promise;
        };
        return service;
    }
]);