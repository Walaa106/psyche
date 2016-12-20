/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/properties  ->  index
 */

'use strict';

var _ = require('lodash');
var request = require('request');
var $q = require('q');

var async = require('asyncawait/async');
var await = require('asyncawait/await');

var elasticsearch = require('elasticsearch');
var config = require('../../config/config');

exports.index = async(function(req, res) {
    // var size = req.query.size || 50
    var size = req;
    var all = [];
    var page = 1;
    while (page <= 2) {
        var wait = await (getAndIndex(size, page))
        all.push(wait);
        page++;
    }
    // return res.json({ data: all })
});


var getAndIndex = async(function(size, page_number) {
    var properties = await (getPropertiesByElastic(size, page_number));
    var results = await (_.map(properties, async(function(property, index) {
        console.warn('### ' + index + ' ### Start indexing property ...', property._source);
        console.info('.... Name: ' + property._source.en.name);
        console.log('.... ID#: ' + property._id);
        return await (indexPorpertyHealth(property._id));
    })));
    return results;
})

var indexPorpertyHealth = function(property_id) {
    //- config.endpoint: it's a api gateway to exucute lambda function for indexing property content health
    var deferred = $q.defer();
    request({
        url: config.endpoint + '?property_id=' + property_id,
        method: 'GET'
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);
            deferred.resolve(data)
        } else {
            deferred.resolve(error);
        }
    });
    return deferred.promise;
}

var getPropertiesByElastic = function(size, page_number) {
    var elastic = config.elastic;
    var client = new elasticsearch.Client({
        host: elastic.host
    });
    var deferred = $q.defer();

    client.search({
        index: 'properties',
        size: size,
        from: page_number,
        body: {
            "query": getQuery
        }
    }).then(function(response) {
        var hits = response.hits.hits;
        deferred.resolve(hits);
    }, function(error) {
        deferred.resolve(error);
    });
    return deferred.promise;
}

var getQuery = function() {
    return {
        "match_all": {
            "supplier_id": 1
        }
    }
}

var getProperties = function(page_number) {
    //- last_page
    var url = config.api + '/seo/properties?page=' + page_number;
    var deferred = $q.defer();
    request({
        url: url,
        method: 'GET'
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body).properties;
            deferred.resolve(data.data);
        } else {
            deferred.resolve(error);
        }
    });
    return deferred.promise;
}
require('make-runnable');
