var categoryService = angular.module('CategoryService', ['ServiceMod', 'ionic']);

categoryService.factory('categoryHelper', [
    'ajaxRequest', '$q', '$ionicBackdrop',
    function (ajaxRequest, $q, $ionicBackdrop) {
        var service = {};
        service.fetchProduct = function (data) {
            var defer = $q.defer();
            var ajax = ajaxRequest.send('v1/catalog/products', angular.copy(data));
            $ionicBackdrop.retain();
            ajax.then(function (data) {
                var ret = {};
                if (data.products) {
                    ret.products = data.products;
                    ret.page = data.current_page;
                } else {
                    ret.products = [];
                    ret.page = -1;
                }

                var sortBy = [];
                if (data.sort) {
                    for (var i = 0; i < data.sort.length; i++) {
                        var name = data.sort[i].text;
                        var param = data.sort[i].param;
                        sortBy.push({
                            name: name,
                            url: param
                        });
                    }
                }
                ret.sortBy = sortBy;
                var filters = [];
                if (data.filters) {
                    for (var filter in data.filters) {
                        var filter_values = data.filters[filter];
                        if (data.filters[filter].data && data.filters[filter].data.length > 0) {
                            var filter_text = data.filters[filter].text;
                            var sub_filters = [];
                            for (var i = 0; i < filter_values.data.length; i++) {
                                var name = filter_values.data[i].text;
                                if (filter_values.data[i].param) {

                                    var param = filter_values.data[i].param;
                                    sub_filters.push({
                                        name: name,
                                        param: param
                                    });

                                } else {
                                    var cat_id = filter_values.data[i].cat_id;
                                    var sub_cat_id = filter_values.data[i].sub_cat_id;
                                    var cat_name = filter_values.data[i].cat_name;
                                    sub_filters.push({
                                        name: name,
                                        param: param
                                    });
                                }
                            }
                            filters.push({
                                type: filter_text,
                                data: sub_filters
                            });
                        }
                    }
                }
                ret.filters = filters;
                $ionicBackdrop.release();
                defer.resolve(ret);
            }, function () {
                defer.reject();
                $ionicBackdrop.release();
            });
            return defer.promise;
        }
        return service;
    }
]);