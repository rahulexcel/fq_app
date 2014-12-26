var productService = angular.module('ProductService', ['ServiceMod']);

productService.factory('productHelper', [
    'ajaxRequest', '$q',
    function (ajaxRequest, $q) {
        var service = {};
        service.fetchProduct = function (id) {
            var defer = $q.defer();
            var ajax = ajaxRequest.send('action=product&query_id=' + id, [], 'GET');
            ajax.then(function (data) {
                var data = data.data;
                var ret = {};
                ret.name = data.query_row.query;
                ret.price = data.query_row.lowest_price;
                ret.image = 'http://img6a.flixcart.com/image/mobile/h/g/v/nokia-lumia-630ss-125x125-imadwun8kundgpfd.jpeg';
                ret.url = 'http://www.flipkart.com/hp-1000-1b10au-notebook-apu-dual-core-a4-2gb-500gb-free-dos-k5b65pa/p/itmey7hkhzhbgaqf?pid&otracker=hp_widget_banner_0_image';

                var variants = [];
                for (var i = 0; i < data.result.length; i++) {
                    variants.push({
                        name: data.result[i].name,
                        image: data.result[i].image,
                        price: data.result[i].disc_price,
                        website: data.result[i].website,
                        url: data.result[i].url
                    });
                }

                ret.variants = variants;
                defer.resolve(ret);
            });
            return defer.promise;
        }
        return service;
    }
]);