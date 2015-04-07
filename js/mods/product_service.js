var productService = angular.module('ProductService', ['ServiceMod']);

productService.factory('productHelper', [
    'ajaxRequest', '$q', '$http', 'timeStorage',
    function (ajaxRequest, $q, $http, timeStorage) {
        var service = {};
        service.fetchLatest = function (url) {
            var defer = $q.defer();
            var key = 'product_latest_' + url;
            if (timeStorage.get(key)) {
                return $q.when(timeStorage.get(key));
            } else {
                var ajax = $http.get(ajaxRequest.url('v1/parseurl') + "?url=" + encodeURIComponent(url));
                ajax.then(function (data) {
                    if (data.data && data.data.data) {
                        timeStorage.set(key, data.data.data, 24);
                        defer.resolve(data.data.data);
                    }
                });
                return defer.promise;
            }
        };
        service.fetchProduct = function (id) {
            var defer = $q.defer();
            var ajax = ajaxRequest.send('v1/product/view', {
                product_id: id
            });
            ajax.then(function (data) {
                var ret = {};
                ret.product = data.product;
                var variants = [];
                for (var i = 0; i < data.variant.length; i++) {
                    variants.push({
                        _id: data.variant[i]._id,
                        brand: data.variant[i].brand,
                        name: data.variant[i].name,
                        img: data.variant[i].img,
                        price: data.variant[i].price,
                        website: data.variant[i].website,
                        url: data.variant[i].href
                    });
                }

                var similar = [];

                for (i = 0; i < data.similar.length; i++) {
                    similar.push({
                        _id: data.similar[i]._id,
                        brand: data.similar[i].brand,
                        name: data.similar[i].name,
                        image: data.similar[i].img,
                        price: data.similar[i].price,
                        website: data.similar[i].website,
                        url: data.similar[i].href
                    });
                }
                ret.similar = similar;
                ret.variants = variants;
                defer.resolve(ret);
            });
            return defer.promise;
        };
        return service;
    }
]);