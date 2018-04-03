/*global angular*/
angular.module('redditApp', []).controller('RedditController', function($scope, $http) {
  var reddit = this;
  reddit.subRedditName = '';
  reddit.hasSearched = false;
  reddit.count = 0;
  reddit.currentlyPagingForward = true;
  reddit.posts = [];
  reddit.after = '';
  reddit.before = '';
  reddit.error = false;
  reddit.noPosts = false;
  reddit.loading = false;

  //function to reset all the state relevant to a single search only
  reddit.reset = function() {
    reddit.count = 0;
    reddit.currentlyPagingForward = true;
    reddit.posts = [];
    reddit.after = '';
    reddit.before = '';
    reddit.error = false;
    reddit.noPosts = false;
    reddit.loading = false;
  }

  reddit.submitNewSubReddit = function() {
    if(reddit.subRedditName) {
      reddit.reset();
      reddit.loadSubReddit();
    } else {
      reddit.error = true;
    }
  }

  reddit.loadSubReddit = function(query) {
    reddit.posts = [];
    reddit.hasSearched = true;
    reddit.loading = true;
    $http.get('/reddit/' + reddit.subRedditName + (query || '')).then(function(response) {
      reddit.after = response.data.after;
      reddit.before = response.data.before;
      reddit.posts =  response.data.posts;
      if(!reddit.posts.length) {
        reddit.noPosts = true;
      }
      reddit.loading = false;
    }).catch(function() {
      reddit.error = true;
      reddit.loading = false;
    });
  };

  reddit.loadNextPage = function() {
    if(reddit.after) {
      const count = reddit.calculateCount(true);
      reddit.count = count;
      reddit.forward = true;
      reddit.loadSubReddit('?after=' + reddit.after + '&count=' + count);
    }
  };

  reddit.loadPreviousPage = function() {
    if(reddit.before) {
      const count = reddit.calculateCount(false);
      reddit.count = count;
      reddit.forward = false;
      reddit.loadSubReddit('?before=' + reddit.before + '&count=' + count);
    }
  };

  reddit.calculateCount = function(isForward) {
    //reddit's paging logic is very strange, this matches their site
    if(isForward && reddit.currentlyPagingForward) {
      return reddit.count + 25;
    } else if(isForward && !reddit.currentlyPagingForward) {
      return reddit.count - 1;
    } else if(!isForward && reddit.currentlyPagingForward) {
      return reddit.count + 1;
    } else if(!isForward && !reddit.currentlyPagingForward) {
      return reddit.count - 25;
    }
  }
});
