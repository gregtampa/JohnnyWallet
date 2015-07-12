angular.module('ionizer-chat.servicefirebase', ['ionizer-chat.services'])
    .value('FIREBASE_REF', 'https://int-chat.firebaseIO.com')

.factory('firebaseservice', function($firebase, $firebaseAuth, FIREBASE_REF, $q, $firebaseArray, $firebaseObject) {


    var firebaseObj = new Firebase(FIREBASE_REF);
    var refUsers = new Firebase(FIREBASE_REF + "/users");
    var refUserMappings = new Firebase(FIREBASE_REF + "/userMappings");

    var refRooms = new Firebase(FIREBASE_REF + "/rooms");

    var loginObj = $firebaseAuth(firebaseObj);
    var auth = {};
    var defAvatar = 'img/avatars/avatar.png';

    var createUser = function(authData, provider) {

        var deferred = $q.defer();

        switch (provider) {

            case 'password':

                var objPersonal = {
                    email: authData.password.email
                };
                var objUserMappings = {
                    password: authData.uid
                };

                break;

            case 'twitter':

                var objPersonal = {
                    first_name: authData.twitter.displayName,
                    avatar: authData.twitter.cachedUserProfile.profile_image_url_https
                };
                var objUserMappings = {
                    twitter: authData.uid
                };

                break;

            case 'facebook':

                var objPersonal = {
                    first_name: authData.facebook.cachedUserProfile.first_name,
                    last_name: authData.facebook.cachedUserProfile.last_name,
                    email: authData.facebook.email,
                    avatar: authData.facebook.cachedUserProfile.picture.data.url
                };
                var objUserMappings = {
                    facebook: authData.uid
                };

                break;

            case 'google':

                var objPersonal = {
                    first_name: authData.google.cachedUserProfile.given_name,
                    last_name: authData.google.cachedUserProfile.family_name,
                    email: authData.google.email,
                    avatar: authData.google.cachedUserProfile.picture
                };
                var objUserMappings = {
                    google: authData.uid
                };

                break;

        }

        var newPostRef = refUsers.push({
            personalData: objPersonal,
            userMappings: objUserMappings
        });

        console.log(objPersonal, objUserMappings);

        refUserMappings.child(authData.uid).set({
            user: newPostRef.key()
        }, function(error) {
            if (error) {
                console.log('Create User failed');
            } else {
                console.log('Create User succeeded');
            }
        });

        var auth = {
            avatar: objPersonal.avatar,
            first_name: objPersonal.first_name,
            user_id: newPostRef.key()
        };

        deferred.resolve(auth);

        return deferred.promise;
    }

    var getPersonalInfo = function(user_id) {

        var deferred = $q.defer();

        refUsers.child(user_id).child('personalData').once("value", function(snap) {
            deferred.resolve(snap.val());
        }, function(errorObject) {
            deferred.reject("The read failed: " + errorObject.code);
        });

        return deferred.promise;
    }

    return {
        firebaseObj: function() {
            return firebaseObj;
        },
        loginObj: function() {
            return loginObj;
        },
        signOther: function(provider) {

            var deferred = $q.defer();

            firebaseObj.authWithOAuthPopup(provider, function(error, authData) {
                if (error) {
                    deferred.reject(error);
                } else {
                    deferred.resolve(authData);
                }
            }, {
                scope: "email"
            });

            return deferred.promise;
        },
        linkOther: function(provider, user_id) {

            var deferred = $q.defer();
            var userMapping = {};

            firebaseObj.authWithOAuthPopup(provider, function(error, authData) {
                if (error) {
                    deferred.reject(error);
                } else {

                    // Should check in future if Account was already used before
                    refUserMappings.child(authData.uid).once('value', function(snap) {
                        if (snap.val()) {
                            deferred.reject('Already Linked to Another Account!');
                        } else {
                            refUserMappings.child(authData.uid).set({
                                user: user_id
                            });

                            userMapping[provider] = authData.uid;
                            console.log(userMapping);

                            refUsers.child(user_id).child("userMappings").update(userMapping);

                            deferred.resolve(authData);
                        }
                    });
                }
            }, {
                scope: "email"
            });

            return deferred.promise;
        },
        unlinkOther: function(provider, validateSocial, user_id) {

            var deferred = $q.defer();
            var userMapping = {};

            refUserMappings.child(validateSocial).remove(function(error) {
                if (error) {
                    deferred.reject(error);
                } else {

                    refUsers.child(user_id).child("userMappings").child(provider).remove(function(error) {
                        if (error) {
                            deferred.reject(error);
                        } else {
                            deferred.resolve("Unlink Success");
                        }
                    })
                }
            });

            return deferred.promise;
        },
        signIn: function(user, password) {

            var deferred = $q.defer();
            var provider = '';

            firebaseObj.authWithPassword({
                email: user,
                password: password
            }, function(error, authData) {
                if (error) {
                    deferred.reject(error);
                } else {
                    deferred.resolve(authData);
                }
            });

            return deferred.promise;
        },
        signUp: function(user, password) {

            var deferred = $q.defer();
            var provider = "password";

            loginObj.$createUser({
                email: user,
                password: password
            }).then(function(authData) {
                console.log('createUser done', authData);

                authData.password = {
                    email: user
                };

                createUser(authData, provider)
                    .then(function(returnData) {
                        console.log('User Created with:', returnData);
                    });

                deferred.resolve(authData);
            }).catch(function(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        },
        forgot: function(user) {

            var deferred = $q.defer();

            loginObj.$resetPassword({
                email: user
            }).then(function() {
                deferred.resolve();
            }).catch(function(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        },
        unAuthCallback: function() {

        },
        authDataCallback: function(authData) {
            if (authData) {
                console.log("Checking from Callback: User " + authData.uid + " is logged in with " + authData.provider);

                refUserMappings.child(authData.uid).once("value", function(snap) {
                    console.log(snap.val());

                    getPersonalInfo(snap.val().user).then(
                        function(returnData) {
                            auth.user = returnData.first_name;
                            auth.avatar = returnData.avatar;
                        }
                    );

                });

            } else {
                auth.user = null;
                auth.avatar = defAvatar;
                console.log("User is logged out");
            }

        },
        getPersonalInfo: function(user_id) {

            var deferred = $q.defer();

            getPersonalInfo(user_id).then(
                function(returnData) {
                    deferred.resolve(returnData);
                },
                function(error) {
                    deferred.reject(error);
                }
            );

            return deferred.promise;
        },
        getPersonalInfoUID: function(authData) {

            var deferred = $q.defer();

            refUserMappings.child(authData.uid).once('value', function(snap) {
                if (snap.val()) {

                    deferred.resolve($firebaseObject(refUsers.child(snap.val().user)));

                } else {
                    // No User Data yet, create the User
                    console.log('No User Data yet, Create User');
                    createUser(authData, authData.provider)
                        .then(function(returnData) {
                            console.log('User Created with:', returnData);
                            deferred.resolve($firebaseObject(refUserMappings.child(returnData.user_id)));
                        });
                }
            });

            return deferred.promise;
        },
        getSocial: function(user_id) {

            var deferred = $q.defer();

            refUsers.child(user_id).child('userMappings').once("value", function(snap) {
                console.log(snap.val());
                deferred.resolve(snap.val());
            }, function(errorObject) {
                deferred.reject("The read failed: " + errorObject.code);
            });

            return deferred.promise;
        },
        updatePersonalInfo: function(user_id, personalData) {

            var deferred = $q.defer();

            refUsers.child(user_id).child('personalData').update({
                first_name: personalData.first_name,
                last_name: personalData.last_name,
                email: personalData.email,
                username: personalData.username
            }, function(error) {
                if (error) {
                    deferred.reject("Data could not be saved." + error);
                } else {
                    deferred.resolve("Data saved successfully.");
                }
            });

            return deferred.promise;
        },
        updatePersonalAvatar: function(user_id, imageData) {

            var deferred = $q.defer();

            refUsers.child(user_id).child('personalData').update({
                avatar_personal: imageData
            }, function(error) {
                if (error) {
                    deferred.reject("Data could not be saved." + error);
                } else {
                    deferred.resolve("Data saved successfully.");
                }
            });

            return deferred.promise;
        },
        storeInformation: function(provider) {
            switch (provider) {
                case 'password':
                    return authData.password.email.replace(/@.*/, '');
                case 'twitter':
                    return authData.twitter.cachedUserProfile.profile_image_url_https;
                case 'facebook':

                    return authData.facebook.cachedUserProfile.picture.data.url;
                case 'google':
                    return authData.google.cachedUserProfile.picture;
            }

        },
        chatRoom: function(roomId) {

            var deferred = $q.defer();

            var refChats = new Firebase(FIREBASE_REF + "/rooms/" + roomId + "/chat");

            deferred.resolve(refChats);

            return deferred.promise;
        },
        chatRoomArray: function(roomId) {

            var refChats = new Firebase(FIREBASE_REF + "/rooms/" + roomId + "/chat");

            return $firebaseArray(refChats);
        },
        roomList: function() {
            return $firebaseArray(refRooms);
        },
        createRoom: function(room) {

            var deferred = $q.defer();

            refRooms.push({
                name: room.name,
                description: room.desc
            }, function(errorObject) {
                if (errorObject) {
                    deferred.reject("Room could not be saved." + errorObject);
                } else {
                    deferred.resolve("Room saved successfully.");
                }
            });

            return deferred.promise;
        }
    }
});