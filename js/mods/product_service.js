var productService = angular.module('ProductService', ['ServiceMod']);

productService.factory('productHelper', [
    'ajaxRequest', '$q', '$http', 'timeStorage',
    function (ajaxRequest, $q, $http, timeStorage) {
        var service = {};
        service.fetchLatestCache = function (pid) {
            var key = 'product_latest_price_' + pid;
            if (timeStorage.get(key)) {
                return timeStorage.get(key);
            } else {
                return {};
            }
        };
        service.fetchLatest = function (url, pid) {
            var defer = $q.defer();
            var key = 'product_latest_' + url;
            if (timeStorage.get(key)) {
                return $q.when(timeStorage.get(key));
            } else {
                var params = "?url=" + encodeURIComponent(url);
                if (pid) {
                    params += '&pid=' + encodeURIComponent(pid);
                }
                var ajax = $http.get(ajaxRequest.url('v1/parseurl') + params);
                ajax.then(function (data) {
                    if (data.data && data.data.data) {
                        timeStorage.set(key, data.data.data, 24);
                        timeStorage.set('product_latest_price_' + pid, data.data.data, .1);
                        defer.resolve(data.data.data);
                    }
                });
                return defer.promise;
            }
        };
        service.fetchVariant = function (id) {
            var defer = $q.defer();
            var ajax = ajaxRequest.send('v1/product/variant', {
                product_id: id
            }, true);
            ajax.then(function (data) {
                var ret = {};
                var variants = [];
                for (var i = 0; i < data.length; i++) {
                    variants.push({
                        _id: data[i]._id,
                        brand: data[i].brand,
                        name: data[i].name,
                        img: data[i].img,
                        price: data[i].price,
                        website: data[i].website,
                        url: data[i].href
                    });
                }

                ret.variants = variants;
                defer.resolve(ret);
            });
            return defer.promise;
        };
        service.fetchSimilar = function (id, unique, website) {
            var defer = $q.defer();
            var cache_key = '';
            //there is caching at nodejs
            // when we do force refresh at produce page this causes problem
//            if (id) {
//                cache_key = 'similar_' + id;
//            } else {
//                cache_key = 'similar_' + unique;
//            }
//            if (timeStorage.get(cache_key)) {
//                return $q.when(timeStorage.get(cache_key));
//            }
            var ajax = ajaxRequest.send('v1/product/similar', {
                product_id: id,
                unique: unique,
                website: website
            }, true);
            ajax.then(function (data) {
                var ret = {};
                var similar = [];

                for (var i = 0; i < data.length; i++) {
                    similar.push({
                        _id: data[i]._id,
                        brand: data[i].brand,
                        name: data[i].name,
                        image: data[i].img,
                        price: data[i].price,
                        website: data[i].website,
                        url: data[i].href
                    });
                }
                ret.similar = similar;
                timeStorage.set(cache_key, ret, 1);
                defer.resolve(ret);
            });
            return defer.promise;
        };
        service.fetchProduct = function (id) {
            var defer = $q.defer();
            var ajax = ajaxRequest.send('v1/product/view', {
                product_id: id
            });
            ajax.then(function (data) {
                var ret = {};
                ret.product = data.product;
                defer.resolve(ret);
            });
            return defer.promise;
        };
        return service;
    }
]);