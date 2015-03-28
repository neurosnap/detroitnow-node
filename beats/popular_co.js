var helper = require('./helper');
var config = require('../config');
var _ = require('lodash');
var Promise = require('bluebird');
var needle = Promise.promisifyAll(require('needle'));

module.exports = function(app) {
  var connections = [];
  app.get('/pop', function(req, res, next) {
    res.render('popular_co', { title: 'Popular Articles' });
  });

  app.io.route('popular_co', function(req) {
    req.io.join('popular_co')
  });

  var chartbeat_template = _.template("<%= chartbeat_url %>/live/toppages/v3/?limit=50&apikey=<%= api_key %>&host=")
  var chartbeat_string = chartbeat_template({
    chartbeat_url: config.chartbeat_url,
    api_key: config.api_key
  });

  var urls = [];
  _.forEach(config.sites, function(site) {
    urls.push(chartbeat_string + site);
  });

  function parse_article(article) {
    if (helper.isSectionPage(article.path)) return;

    return {
      path: article.path,
      title: article.title,
      visits: article.stats.visits
    };
  }

  function fetchData() {
    console.log("Fetching popular data");
    if (!app.io.sockets.clients('popular_co').length) {
      setTimeout(fetchData, 5000);
      return;
    }

    var articles = [];
    _.forEach(urls, Promise.coroutine(function* (url) {
      var response = yield needle.getAsync(url);
      _.forEach(response[1].pages, function(article) {
        var art = parse_article(article);
        if (art) articles.push(art);
      });
    }));

    app.io.room('popular_co').broadcast('chartbeat', {
      articles: articles.splice(0, 40)
    });

    setTimeout(fetchData, 5000);
  }

  fetchData();
}