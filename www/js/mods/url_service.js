var urlService = angular.module('UrlService', []);
urlService.factory('urlHelper', ['$location',
    function ($location) {
        var service = {};
        service.getPath = function () {
            return $location.path();
        };
        service.direct = function (path) {
            $location.path(path);
        };
        service.openWishlistEditPage = function (list_id) {
            $location.path('/app/wishlist_edit/' + list_id);
        };
        service.openForgotPage = function () {
            $location.path('/app/forgot');
        };
        service.openLoginPage = function () {
            $location.path('/app/login');
        };
        service.openWishlistAddPage = function () {
            $location.path('/app/wishlist_add');
        };
        service.openSearchPage = function (father_key, search_text) {
            $location.path('/app/search/' + father_key + "/" + search_text);
        };
        service.openInvitePage = function () {
            $location.path('/app/invite');
        };
        service.openAboutUsPage = function () {
            $location.path('/app/aboutus');
        };
        service.openFeedbackPage = function () {
            $location.path('/app/feedback');
        };
        service.openWishlistAddStep2 = function (wishlist_type, list_id) {
            $location.path('/app/wishlist_item_add_step2/' + wishlist_type + "/" + list_id);
        };
        service.openWishlistAddStep1 = function () {
            $location.path('/app/wishlist_item_add_step1');
        };
        service.openWishlistPage = function (list_id, list_name) {
            $location.path('/app/wishlist_item/' + list_id + "/" + list_name + "/pins");
        };
        service.openProfilePage = function (user_id, type) {
            $location.path('/app/profile/' + user_id + '/' + type);
        };
        service.openAlertPage = function (alert_id) {
            $location.path('/app/alert/' + alert_id);
        };
        service.openItemPage = function (pin_id, list_id) {
            $location.path('/app/item/' + pin_id + '/' + list_id + '/pins');
        };
        service.openCategoryPage = function (cat_id, sub_cat_id, name, text) {
            if (text) {
                $location.path('/app/category/' + cat_id + '/' + sub_cat_id + '/' + name + "/" + text);
            } else {
                $location.path('/app/category/' + cat_id + '/' + sub_cat_id + '/' + name);
            }
        };
        service.openAccountPage = function () {
            $location.path('/app/account');
        };
        service.openProductPage = function (product_id) {
            $location.path('/app/product/' + product_id);
        };
        service.openOfflinePage = function () {
            $location.path('/offline');
        };
        service.openIntroPage = function () {
            if (window.StatusBar) {
                StatusBar.hide();
            }
            hiddenStatusBar = true;
            $location.path('/intro');
        };
        service.openHomePage = function () {
            $location.path('/app/home/trending');
        };
        service.openSignUp = function () {
            $location.path('/app/signup');
        };
        return service;
    }
]);