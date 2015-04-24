/**
 * Created by PAVEI on 30/09/2014.
 * Updated by Ross Martin on 12/05/2014
 */

angular.module('ionicLazyLoad', []);

angular.module('ionicLazyLoad')

        .directive('lazyScroll', ['$rootScope', '$timeout',
            function ($rootScope, $timeout) {
                return {
                    restrict: 'A',
                    link: function ($scope, $element) {

                        var scrollTimeoutId = 0;

                        $scope.invoke = function () {
                            $rootScope.$broadcast('lazyScrollEvent');
                        };

                        $element.bind('scroll', function () {

                            $timeout.cancel(scrollTimeoutId);

                            // wait and then invoke listeners (simulates stop event)
                            scrollTimeoutId = $timeout($scope.invoke, 0);

                        });
                        $element.bind('resize', function () {

                            $timeout.cancel(scrollTimeoutId);

                            // wait and then invoke listeners (simulates stop event)
                            scrollTimeoutId = $timeout($scope.invoke, 0);

                        });


                    }
                };
            }])

        .directive('imageLazySrc', ['$document', '$timeout', '$window',
            function ($document, $timeout, $window) {
                return {
                    restrict: 'A',
                    compile: function (tElement, tAttrs, transclude) {
                        if (tAttrs.imageHeight && tAttrs.pinColor) {
                            //var html = '<div style="position:absolute;top:0px;left:0px;opacity:.8;width:100%;height:' + tAttrs.imageHeight + ';background-color:' + tAttrs.pinColor + ';"></div>';
                            //tElement.append(html);
                        }
                        return {
                            post: function ($scope, $element, $attributes) {
                                var img = false;
                                var image_loaded = false;
                                var deregistration = $scope.$on('lazyScrollEvent', function () {
                                    //console.log('scroll');
                                    if (isInView()) {
                                        img = new Image();
                                        img.onload = function () {
                                            $element.parent().removeAttr('style');
                                            $element[0].src = $attributes.imageLazySrc;
                                            img = null;
                                        };
                                        img.src = $attributes.imageLazySrc;
                                        $timeout(function () {
                                            //show element if it takes more time to load
                                            $element.parent().removeAttr('style');
                                            $element[0].src = $attributes.imageLazySrc;
                                        }, 5000);
                                        deregistration();
                                    }
                                }
                                );

                                function isInView() {
//                                    console.log($window.pageYOffset);
//                                    var scrollTop = $document[0].documentElement.scrollHeight;
                                    var clientHeight = $document[0].documentElement.clientHeight;
                                    var clientWidth = $document[0].documentElement.clientWidth;
                                    var imageRect = $element[0].getBoundingClientRect();
//                                    console.log(scrollTop + "scroll");
//                                    console.log(clientHeight + "client Height");
//                                    console.log(clientWidth + "client width");
//                                    console.log(imageRect);
                                    if (!imageRect.y) {
                                        //imageRect.y = imageRect.top + imageRect.height;
                                        imageRect.y = imageRect.top;
                                    }
                                    return  (imageRect.top >= 0 && imageRect.y <= clientHeight) && (imageRect.left >= 0 && imageRect.right <= clientWidth);
                                }

                                // bind listener
                                // listenerRemover = scrollAndResizeListener.bindListener(isInView);

                                // unbind event listeners if element was destroyed
                                // it happens when you change view, etc
                                $element.on('$destroy', function () {
                                    deregistration();
                                    img = null;
                                });

                                // explicitly call scroll listener (because, some images are in viewport already and we haven't scrolled yet)
                                $timeout(function () {
                                    if (isInView()) {
//                                        console.log('here');
                                        img = new Image();
                                        img.onload = function () {
                                            $element.parent().removeAttr('style');
                                            $element[0].src = $attributes.imageLazySrc; // set src attribute on element (it will load image)
                                            img = null;
                                            image_loaded = true;
                                        };
                                        img.src = $attributes.imageLazySrc;
                                        $timeout(function () {
                                            if (!image_loaded) {
                                                //show element if it takes more time to load
                                                $element.parent().removeAttr('style');
                                                $element[0].src = $attributes.imageLazySrc;
                                            }
                                        }, 5000);
                                        deregistration();
                                    }
                                }, 0);
                            }
                        }
                    }
                };
            }]);