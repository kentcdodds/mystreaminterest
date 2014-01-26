angular.module('msi').factory('LoginService', function(Firebase, $firebaseSimpleLogin, $rootScope, $http, $q, _) {
  var firebaseRef = new Firebase('https://mystreaminterest.firebaseio.com');
  var loginObj = $firebaseSimpleLogin(firebaseRef);

  var providers = {
    facebook: {
      config: {
        scope: 'read_stream'
      },
      getStream: function() {
        var url = 'https://graph.facebook.com/fql?q=SELECT post_id, actor_id, type, attachment, permalink, created_time, description, message FROM stream where filter_key = \'nf\' and not (type in (257)) LIMIT 100&';
        var deferred = $q.defer();
        var token = loginObj.user.accessToken;
        $http.get(url + 'access_token=' + token).success(function(posts) {
          posts = posts.data;
          var actorIds = [];
          var promises = [];
          _.each(posts, function(postData) {
            actorIds.push(postData['actor_id']);
          });
          var ids = {};
          var userUrl = 'https://graph.facebook.com/fql?q=SELECT uid, name FROM user where uid in ("' + actorIds.join('","') + '")&';
          var pageUrl = 'https://graph.facebook.com/fql?q=SELECT page_id, name FROM page where page_id in ("' + actorIds.join('","') + '")&';
          var groupUrl = 'https://graph.facebook.com/fql?q=SELECT gid, name FROM group where gid in ("' + actorIds.join('","') + '")&';
          var eventUrl = 'https://graph.facebook.com/fql?q=SELECT eid, name FROM event where eid in ("' + actorIds.join('","') + '")&';
          function addIds(data) {
            if (!(data.data && data.data.length)) {
              allDone();
              return;
            }
            var idField = null;
            var sample = data.data[0];
            if (sample.hasOwnProperty('uid')) {
              idField = 'uid';
            } else if (sample.hasOwnProperty('page_id')) {
              idField = 'page_id';
            } else if (sample.hasOwnProperty('gid')) {
              idField = 'gid';
            } else if (sample.hasOwnProperty('eid')) {
              idField = 'eid';
            } else {
              return;
            }

            _.each(data.data, function(result) {
              ids[result[idField]] = result.name;
            });
            console.log('add ids');
            allDone();
          }
          promises.push($http.get(userUrl + 'access_token=' + token).success(addIds));
          promises.push($http.get(pageUrl + 'access_token=' + token).success(addIds));
          promises.push($http.get(groupUrl + 'access_token=' + token).success(addIds));
          promises.push($http.get(eventUrl + 'access_token=' + token).success(addIds));

          var allDone = _.after(promises.length, function success() {
            console.log('all done');
            var stream = [];
            _.each(posts, function(postData) {
              postData.username = ids[postData['actor_id']];
              stream.push(createPost(postData));
            });
            deferred.resolve(stream);
          });
        }).error(deferred.reject);

        function createPost(postData) {
          var attachment = postData.attachment || {};
          var media = {};
          if (attachment.media) {
            media = attachment.media[0] || {};
          }
          if (media.src) {
            media.src = media.src.replace('_s.', '_n.');
          }
          return {
            author: {
              profilePicture: {
                url: 'http://graph.facebook.com/' + postData['actor_id'] + '/picture'
              },
              url: 'http://facebook.com/' + postData['actor_id'],
              name: postData.username
            },
            url: postData.permalink,
            modified: new Date(postData['created_time']),
            content: {
              text: postData.message || postData.description,
              url: postData.link || attachment.href || media.href,
              name: attachment.name,
              img: {
                url: media.src,
                caption: attachment.caption
              },
              description: attachment.description
            },
            src: postData
          };
        }

        return deferred.promise;
      }
    },
    twitter: {
      config: {},
      getStream: function() {
        var url = 'https://api.twitter.com/1.1/statuses/home_timeline.json?';
        var deferred = $q.defer();
        var token = loginObj.user.accessToken;
        $http.get(url + 'access_token=' + token).success(function(posts) {
          console.log(posts);
        });
        return deferred.promise;
      }
    }
  };

  // This handles the case where the user is logged in when the app is opened initially.
  var firstWatchExecuted = false;
  var tempWatch = $rootScope.$watch(function() {
    return loginObj.user;
  }, function(user) {
    if (firstWatchExecuted) {
      broadcastStateChange(user);
      tempWatch();
    } else {
      firstWatchExecuted = true;
    }
  });

  function broadcastStateChange(user) {
    $rootScope.$broadcast('userStateChange', user);
  }

  return {
    logout: function() {
      loginObj.$logout();
      broadcastStateChange();
    },
    login: function(provider, rememberMe) {
      var conf = providers[provider].config;
      conf.rememberMe = rememberMe;
      loginObj.$login(provider, conf).then(function(user) {
        broadcastStateChange(user);
      }, function(error) {
        console.log('Error logging in: ', error);
        // TODO: Handle this...
      });
    },
    getUser: function() {
      return loginObj.$getCurrentUser();
    },
    getStream: function(provider) {
      return providers[provider].getStream();
    }
  }
});