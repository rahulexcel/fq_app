var accountMod = angular.module('AccountMod', ['GoogleLoginService', 'AccountService', 'ServiceMod', 'ngStorage']);

accountMod.controller('AccountCtrl',
        ['$scope', '$localStorage', '$location', 'toast', 'googleLogin', 'accountHelper',
            function ($scope, $localStorage, $location, toast, googleLogin, accountHelper) {

                if (!$localStorage.user.id) {
                    toast.showShortBottom('SignIn To Access This Page');
                    $location.path('/app/signup');
                    return;
                }
                $scope.profile = {
                    name : '',
                    password : ''
                };
                console.log($localStorage.user);
                $scope.login_data = $localStorage.user;

            }
        ]);