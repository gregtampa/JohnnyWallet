angular.module('johnnywallet.controllers', ['johnnywallet.services', 'johnnywallet.servicefirebase'])



.controller('AppCtrl', function($scope, $ionicModal, firebaseservice, $state, $cordovaCamera) {

    // Initilaze Variables
    $scope.loggedUser = {};
    $scope.authUser = {};
    $scope.username = '';

    $scope.user = {};
    $scope.defAvatar = 'img/avatars/avatar.png';

    firebaseservice.firebaseObj().onAuth(function(authData) {
        console.log(authData);

        if (authData) {
            console.log($scope.authUser);
            if (!$scope.authUser.hasOwnProperty('uid')) {
                console.log($scope.authUser.uid, 'No AuthUser yet');

                $scope.authUser = authData;
                firebaseservice.getPersonalInfoUID(authData)
                    .then(function(returnData) {
                        $scope.loggedUser = returnData;

                        console.log($scope.loggedUser);

                        $scope.loggedUser.$loaded().then(function(returnData) {
                            if (returnData.personalData.username) {
                                $scope.username = returnData.personalData.username;
                            } else if (returnData.personalData.first_name) {
                                $scope.username = returnData.personalData.first_name;
                            } else {
                                $scope.username = returnData.$id;
                            }
                        })


                    });
            } else {
                console.log($scope.authUser.uid, 'Udah ada nih');
            };

        } else {
            if (typeof $scope.loggedUser.$destroy === "function") {
                // safe to use the function
                $scope.loggedUser.$destroy();
            }
            $scope.authUser = {};
            $scope.username = '';
            $state.go('login');
        }
    });

    // Create the settings modal which is used for Profile Settings
    $ionicModal.fromTemplateUrl('templates/settings.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    // Create the avatar Modal which is used for Avatar changes
    $ionicModal.fromTemplateUrl('templates/avatar.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.avatarmodal = modal;
    });

    // Open the login modal
    $scope.showAvatar = function() {
        $scope.avatarmodal.show();
    };

    // The Logout BUtton
    $scope.logout = function() {
        firebaseservice.firebaseObj().unauth(firebaseservice.unAuthCallback());
        $state.go('login');
    };

    // Triggered in the login modal to close it
    $scope.closeAvatar = function() {
        $scope.avatarmodal.hide();
    };

    $scope.showIntro = function() {
        $state.go('login');
    }


    // Open the login modal
    $scope.showSettings = function() {
        $scope.modal.show();
    };

    $scope.closeSettings = function() {
        $scope.modal.hide();
    };

    // Perform the save profile action when the user submits the form
    $scope.saveSettings = function() {

        $scope.loggedUser.$save().then(function() {
            console.log('Profile saved to Firebase!');
        }).catch(function(error) {
            console.log('Error Saving!');
        });

        $scope.closeSettings();

    };


    // Getting the image
    $scope.urlForImage = function(imageName) {
        var name = imageName.substr(imageName.lastIndexOf('/') + 1);
        var trueOrigin = cordova.file.dataDirectory + name;
        console.log(imageName, name, trueOrigin);
        return trueOrigin;
    }

    // Get Image for Avatar
    $scope.getImage = function(cameraType) {

        if (cameraType == 'CAMERA') {
            var options = {
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
            };
        } else {
            var options = {
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
            };
        }


        $cordovaCamera.getPicture(options).then(function(imageData) {

            //onImageSuccess(imageData);

            firebaseservice.updatePersonalAvatar($scope.loggedUser.$id, imageData).then(
                function(returnData) {
                    console.log(returnData);
                    $scope.closeSettings();
                }
            )

            /*
            function onImageSuccess(fileURI) {
                createFileEntry(fileURI);
            }

            function createFileEntry(fileURI) {
                window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
            }

            function copyFile(fileEntry) {
                var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
                var newName = makeid() + name;

                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
                        fileEntry.copyTo(
                            fileSystem2,
                            newName,
                            onCopySuccess,
                            fail
                        );
                    },
                    fail);
            }

            function onCopySuccess(entry) {
                $scope.$apply(function() {
                    $scope.loggedUser.avatar = $scope.urlForImage(entry.nativeURL);
                    $localstorage.set('avatarLocal', $scope.loggedUser.avatar);
                });
            }

            function fail(error) {
                console.log("fail: " + error.code);
            }

            function makeid() {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (var i = 0; i < 5; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            } */

        }, function(err) {
            console.log(err);
        });
    }

})

.controller('IntroCtrl', function($scope, $state, $ionicSlideBoxDelegate, utility, $localstorage, $rootScope) {

    // Called to navigate to the main app
    $scope.startApp = function() {

        if (!$rootScope.auth) {
            $state.go('login');
        } else {
            $state.go('app.home');
        }
    };
    $scope.next = function() {
        $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function() {
        $ionicSlideBoxDelegate.previous();
    };

    // Called each time the slide changes
    $scope.slideChanged = function(index) {
        $scope.slideIndex = index;
    };

    // Initiate the show Tutorial Toggle from localStorage and the Save to local storage on Toggle Function
    if (typeof $localstorage.get('showTutorial') === "undefined") {
        $localstorage.set('showTutorial', true);
    };

    $scope.showTutorial = {
        checked: $localstorage.get('showTutorial') === 'true'
    };

    $scope.saveCheck = function() {
        $localstorage.set('showTutorial', $scope.showTutorial.checked);
    };

})

.controller('LoginCtrl', function($scope, $rootScope, $firebaseAuth, firebaseservice, $location, $state) {

    $scope.user = {};

    $scope.SignOther = function(provider) {

        firebaseservice.signOther(provider)
            .then(function(authData) {
                console.log("Authenticated successfully with payload:", authData);
                $state.go('app.home');
            }, function(error) {
                console.log("Login Failed!", error);
            });

    }

    $scope.SignIn = function(e) {
        e.preventDefault();
        var username = $scope.user.email;
        var password = $scope.user.password;

        firebaseservice.signIn(username, password)
            .then(function(authData) {
                console.log("Authenticated successfully with payload:", authData);
                $state.go('app.home');
            }, function(error) {
                $scope.regError = true;
                $scope.regErrorMessage = error.message;
                console.log("Login Failed!", error);
            });
    }

})


.controller('RegisterCtrl', function($scope, $state, firebaseservice) {

    $scope.regForm = {};
    $scope.user = {};

    $scope.SignUp = function() {

        var username = $scope.user.email;
        var password = $scope.user.password;

        firebaseservice.signUp(username, password)
            .then(function(authData) {
                console.log("User " + authData.uid + " created successfully!", authData);
                $state.go('login');
            }, function(error) {
                $scope.regError = true;
                $scope.regErrorMessage = error.message;
                console.log("SignUp Failed!", error);
            });
    }

})

.controller('ForgotCtrl', function($scope, $firebaseAuth, $state, firebaseservice) {

    $scope.forgotForm = {};
    $scope.user = {};

    $scope.Forgot = function() {

        var email = $scope.user.email;

        firebaseservice.forgot(email)
            .then(function() {
                console.log("Email Sent!");
                $state.go('login');
            }, function(error) {
                $scope.regError = true;
                $scope.regErrorMessage = error.message;
                console.log("Forgot Password Failed!", error);
            });
    }

})



.controller('HomeCtrl', function($scope, $timeout, firebaseservice, $ionicModal) {



});
