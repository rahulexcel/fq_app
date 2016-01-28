var categoryService = angular.module('CategoryService', ['ServiceMod', 'ionic']);

categoryService.factory('categoryHelper', [
    'ajaxRequest', '$q', 'timeStorage',
    function (ajaxRequest, $q, timeStorage) {
        var service = {};
        service.fetchFilters = function (data, is_search) {
            var defer = $q.defer();
            var ajax = false;

            var cache_key = false;
            if (data.cat_id && data.sub_cat_id) {
                cache_key = data.cat_id + "_" + data.sub_cat_id + '_v2';
                if (timeStorage.get(cache_key)) {
                    return $q.when(angular.copy(timeStorage.get(cache_key)));
                }
            }

            ajax = ajaxRequest.send('v1/catalog/filters', angular.copy(data), true);
            ajax.then(function (data) {
                var ret = {};
                var filters = [];
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
                if (data.filters) {
                    var len = 0;
                    for (var filter in data.filters) {
                        len++;
                    }
                    for (var filter in data.filters) {
                        var filter_values = data.filters[filter];
                        var open = false;
                        if (len === 1) {
                            open = true;
                        }
                        if (data.filters[filter].data && data.filters[filter].data.length > 0) {
                            var filter_text = data.filters[filter].text;
                            var filter_key = data.filters[filter].key;
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
                                    var cat_name = filter_values.data[i].text;
                                    sub_filters.push({
                                        name: name,
                                        cat_id: cat_id,
                                        sub_cat_id: sub_cat_id,
                                        cat_name: cat_name
                                    });
                                }
                            }
                            filters.push({
                                type: filter_text,
                                data: sub_filters,
                                visible: true,
                                key: filter_key,
                                open: open
                            });
                        }
                    }
                }
                ret.filters = filters;

                if (cache_key) {
                    timeStorage.set(cache_key, angular.copy(ret), 12);
                }

//                if (is_new)
//                    $ionicLoading.hide();
                defer.resolve(ret);
            }, function () {
                defer.reject();
//                $ionicLoading.hide();
            });
            return defer.promise;
        };
        service.fetchProduct = function (data, is_new) {
            var defer = $q.defer();
            if (data.search) {
                var ajax = ajaxRequest.send('v1/catalog/search', angular.copy(data));
            } else {
                var ajax = ajaxRequest.send('v1/catalog/products', angular.copy(data));
            }
//            if (is_new)
//                $ionicLoading.show({
//                    template: 'Loading...'
//                });
            ajax.then(function (data) {
                var ret = {};
                if (angular.isDefined(data.products)) {
                    ret.products = data.products;
                    ret.page = data.current_page;
                } else {
                    ret.products = [];
                    ret.page = -1;
                }

                var sortBy = [];
                if (angular.isDefined(data.sort) && angular.isArray(data.sort)) {
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
                if (angular.isDefined(data.filters)) {
                    for (var filter in data.filters) {
                        var filter_values = data.filters[filter];
                        if (data.filters[filter].data && data.filters[filter].data.length > 0) {
                            var filter_text = data.filters[filter].text;
                            var filter_key = data.filters[filter].key;
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
                                    var cat_name = filter_values.data[i].text;
                                    sub_filters.push({
                                        name: name,
                                        cat_id: cat_id,
                                        sub_cat_id: sub_cat_id,
                                        cat_name: cat_name
                                    });
                                }
                            }
                            filters.push({
                                type: filter_text,
                                data: sub_filters,
                                visible: true,
                                key: filter_key
                            });
                        }
                    }
                }
                ret.filters = filters;
//                if (is_new)
//                    $ionicLoading.hide();
                defer.resolve(ret);
            }, function () {
                defer.reject();
//                $ionicLoading.hide();
            });
            return defer.promise;
        };
        return service;
    }
]);