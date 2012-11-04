'use scrict';
/**
 *  NgVideo
 *
 * Youtube App with AngularJS
 */
jQuery(function(){
    jQuery('#searchBtn').button();
});

var Utils = {

    urlencode: function (str) {
        var str = (str + '').toString();
        return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
    }
}

var App = angular.module('NgVideo', ['ngResource']);
var API_URL = "http://gdata.youtube.com/feeds/api/videos?v=2&alt=jsonc&max-results=:maxResults&start-index=:start&category=Music&orderby=relevance&time=all_time&q=:query";
var MAX_RESULTS = 15;

App.factory('Videos', ['$resource', function ($resource) {
    return $resource(API_URL, {
        start : '@start',
        query: '@query',
        maxResults : MAX_RESULTS
    });
}]);

var AppCtrl = function ($scope, $resource, Videos) {
    $scope.videos = [];
    $scope.playlist = {};
    $scope.isSearch = true;
    $scope.videoCount = 0;
    $scope.startIndex = 1;
    $searchBtn = jQuery('#searchBtn');

    $scope.search = function(query) {
        if (!query) return false;

        $scope.isSearch = true;
        $searchBtn.button('loading');

        var startIndex = $scope.startIndex;
        if (startIndex < 0 || startIndex == 0) {
            startIndex = 1;
            $scope.startIndex = 1;
        }

        var q = Utils.urlencode(query),
            source;

        Videos.get({start: startIndex, query: q}, onSuccessFn, onFailureFn);

        function onSuccessFn (response) {
            $scope.videoCount = response.data.totalItems;
            $scope.videos = [];
            if ($scope.videoCount > 0) {
                angular.forEach(response.data.items, function(video, i){
                    var title = (video.title).toLowerCase();
                    $scope.videos.push({id: video.id, title: title});
                });
            }
            $searchBtn.button('reset');
        }

        function onFailureFn (response) {
            console.log('Error');
            $searchBtn.button('reset');
        }

        
    };

    $scope.page = function (page) {
        $scope.startIndex = ((page - 1) * MAX_RESULTS) + 1;
    }

    $scope.nextPage = function () {
        $scope.startIndex += MAX_RESULTS;
    }

    $scope.prevPage = function () {
        $scope.startIndex -= MAX_RESULTS;
    }

    $scope.playlist.get = function () {
        if (!$scope.isSearch) return false;

        var _data = store.get('myPlaylist');
        if (angular.isDefined(_data)) {
            $scope.videos = [];
            _videoCount = _data.length;

            if (_videoCount > 0) {
                $scope.videos = _data;
                $scope.videoCount = _videoCount;
                $scope.isSearch = false;
                $scope.startIndex = 1;
            }
        } else {
            $scope.videoCount = 0;
        }
    }

    $scope.playlist.addSong = function (video) {
        console.log('added');
        var _data = store.get('myPlaylist'),
            videoIsExist = false;

        if (angular.isUndefined(_data)) {
            var _video = [{id: video.id, title: video.title}];
            store.set('myPlaylist', _video);
        } else {
            var current_data = store.get('myPlaylist');
            var _video = {id: video.id, title: video.title};

            angular.forEach(current_data, function(v, i){
                if (v.id == _video.id) {
                    videoIsExist = true;
                    console.log('this video is already added');
                    return false;
                }
            });

            if (videoIsExist) {
                return false;
            }

            current_data.push(_video);

            store.set('myPlaylist', current_data);
            $scope.videos = current_data;
            $scope.isSearch = false;
            $scope.videoCount = current_data.length;
        }
    }

    $scope.playlist.deleteSong = function (video) {
        console.log('deleted');
        var _data = store.get('myPlaylist');
        var videoIndex = 0;

        if (angular.isDefined(_data)) {

            angular.forEach(_data, function(_video, i){
                if (_video.id == video.id) {
                    videoIndex = i;
                }
            });

            console.log(videoIndex);
            _data.splice(videoIndex, 1);
            store.set('myPlaylist', _data);

            $scope.videos.splice($scope.videos.indexOf(video), 1);
            $scope.videoCount -= 1;
        }
    }

    $scope.playlist.isAdded = function (video) {
        console.log('added');
        var _data = store.get('myPlaylist'),
            isAdded = false,
            isSearch = $scope.isSearch;

        angular.forEach(_data, function(_video, i){
            if (_video.id == video.id) {
                isAdded = true;
                return false;
            }
        });

        return isAdded;
    }

    $scope.$watch('startIndex', function(val) {
        if ($scope.isSearch) {
            $scope.search($scope.query);  
        } 
    });
     
}

AppCtrl.$inject = ['$scope', '$resource', 'Videos'];