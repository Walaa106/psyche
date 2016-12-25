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
    // var size = req;
    // var page_limit = res;
    var size = req.query.size || 50
    var page_limit = req.query.page || 10
    var wait = await (getAndIndex(size, page_limit))
    return res.json({ data: wait })
});


var getAndIndex = async(function(size, page_number) {
    var properties = await (getPropertiesByElastic(size, page_number));
    return properties
    var results = await (_.map(properties, async(function(property, index) {
        property = await (property);
        console.warn('### ' + page_number + '##' + index + ' ### Start indexing property ...');
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

    var response = await(client.search({
        index: 'properties',
        type: 'property',
        size: 1000,
        from: 0,
        body: {
            "fields" : ["en.name", "en.id"],
            "query": {
                "match": { "en.supplier_id": "1" }
            }
        }
    }));

    if (response && response.hits && response.hits.hits) {
      return response.hits.hits;
    }
}
