angular.module('johnnywallet', ['ionic', 'ngCordova', 'firebase', 'monospaced.elastic', 'angularMoment', 'johnnywallet.controllers', 'johnnywallet.services', 'johnnywallet.firebaseController', 'johnnywallet.servicefirebase'])

.run(function($ionicPlatform, firebaseservice, $state, $rootScope, $localstorage) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

    });

})


.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

        .state('login', {
        url: '/login',
        templateUrl: 'templates/auth/login.html',
        controller: 'LoginCtrl'
    })

    .state('register', {
        url: '/register',
        templateUrl: 'templates/auth/register.html',
        controller: 'RegisterCtrl'
    })

    .state('forgot', {
        url: '/forgot',
        templateUrl: 'templates/auth/forgot.html',
        controller: 'ForgotCtrl'
    })

    .state('intro', {
        url: '/intro',
        templateUrl: 'templates/intro.html',
        controller: 'IntroCtrl'
    })

    .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu.html",
        controller: 'AppCtrl'
    })


    .state('app.profile', {
        url: '/profile',
        abstract: true,
        views: {
            'menuContent': {
                templateUrl: 'templates/Profile/profile-main.html',
                controller: 'TabsPageController'
            }
        }
    })

    .state('app.profile.personal', {
        url: '/personal',
        views: {
            'tab-personal': {
                templateUrl: 'templates/Profile/profile-personal.html',
                controller: 'profilePersonalCtrl'
            }
        }
    })

    .state('app.profile.social', {
        url: '/social',
        views: {
            'tab-social': {
                templateUrl: 'templates/Profile/profile-social.html',
                controller: 'profileSocialCtrl'
            }
        }
    })

    .state('app.home', {
        url: "/home",
        views: {
            'menuContent': {
                templateUrl: "templates/home.html",
                controller: 'HomeCtrl'
            }
        }
    })
	
    .state('app.wallet', {
        url: "/wallet",
        views: {
            'menuContent': {
                templateUrl: "templates/wallet.html",
                controller: 'walletCtrl'
            }
        }
    })

    .state('app.vault', {
        url: "/vault",
        views: {
            'menuContent': {
                templateUrl: "templates/vault.html",
                controller: 'vaultCtrl'
            }
        }
    })

    .state('app.send', {
        url: "/send",
        views: {
            'menuContent': {
                templateUrl: "templates/send.html",
                controller: 'sendCtrl'
            }
        }
    })
	
    .state('app.request', {
        url: "/request",
        views: {
            'menuContent': {
                templateUrl: "templates/request.html",
                controller: 'requestCtrl'
            }
        }
    })
	
    .state('app.buy', {
        url: "/buy",
        views: {
            'menuContent': {
                templateUrl: "templates/buy.html",
                controller: 'buyCtrl'
            }
        }
    })
	
    .state('app.sell', {
        url: "/sell",
        views: {
            'menuContent': {
                templateUrl: "templates/sell.html",
                controller: 'sellCtrl'
            }
        }
    })
	
    .state('app.invite', {
        url: "/invite",
        views: {
            'menuContent': {
                templateUrl: "templates/invite.html",
                controller: 'inviteCtrl'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    if (window.localStorage['showTutorial'] === "false") {
        if (window.localStorage['uid'] !== undefined) {
            $urlRouterProvider.otherwise('/app/home');
        } else {
            $urlRouterProvider.otherwise('/login');
        }
    } else {
        $urlRouterProvider.otherwise('/intro');
    }
});
