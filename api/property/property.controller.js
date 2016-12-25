/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/properties  ->  index
 */

'use strict';

var _ = require('lodash');
var request = require('request');
var range = require('node-range');
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

    var pages_arr = range(0,page_limit).toArray().map(function(i) { return i })
    console.log(pages_arr);


    // var all = await (pages_arr.map(async(function(page) {
    //               var wait = await (getAndIndex(size, page))
    //               return wait;
    //             })));
    // return res.json(all);
});


var getAndIndex = async(function(size, page_number) {
    var properties = await (getPropertiesByElastic(size, page_number));

    var results = await (_.map(properties, async(function(property, index) {
        console.warn('### ' + page_number + '##' + index + ' ### Start indexing property ...');
        console.log('.... ID#: ' + property._id);
        var res = await (indexPorpertyHealth(property._id));
        if (res) {
          return res;
        }
        return property._id
    })));

    return results;

})

var indexPorpertyHealth = function(property_id) {
    //- config.endpoint: it's a api gateway to exucute lambda function for indexing property content health
    var deferred = $q.defer();
    console.log(config.endpoint, 'config.endpoint');
    request({
        url: config.endpoint + '?property_id=' + property_id,
        method: 'POST'
    }, function(error, response, body) {
        if (response) {
            console.log(response.statusCode, 'response.statusCode', property_id);
        }
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

    var response = await (client.search({
        index: 'properties',
        type: 'property',
        size: size,
        from: page_number,
        body: {
            "fields": ["en.name", "en.id"],
            "query": {
                "match": { "en.supplier_id": "1" }
            },
            "sort": { "created_at": { "order": "asc" } }
        }
    }));

    if (response && response.hits && response.hits.hits) {
        return response.hits.hits;
    }
}
