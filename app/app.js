(function() {
  var app = angular.module('msi', ['firebase', 'ui.bootstrap', 'pasvaz.bindonce']);

  app.constant('Firebase', Firebase);
  app.constant('_', _);

  app.constant('StreamGenerator', {
    facebook: function(data) {
      console.log(data);
      var posts = [];
      _.each(data.data, function(post) {
        posts.push({
          author: {
            profilePicture: {
              url: 'http://graph.facebook.com/' + post.from.id + '/picture'
            },
            url: 'http://facebook.com/' + post.from.id,
            name: post.from.name
          },
          url: post.link,
          modified: new Date(post.created_time),
          content: {
            text: post.message || post.story,
            url: post.link,
            img: {
              url: post.picture,
              caption: post.name
            },
            description: post.description
          },
          src: post
        });
      });
      return posts;
    },
    twitter: function(data) {
      console.log(data);
    }
  });
})();