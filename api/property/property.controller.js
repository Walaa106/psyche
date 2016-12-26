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

    var size = 10;
    var page = 0;

    while (page <= 1050) {
        var properties = await (getPropertiesByElastic(size, page));
        var indexed_properties = await (indexing(properties, size, page));
        var waiting_time = 60*60*2

        setTimeout(function() {
            page+=size;
            console.warn('Here you go:', page);
        }, waiting_time);
    }

    return res.json({'done': true});
});


var indexing = async(function(properties, size, page_number) {
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

var getPropertiesByElastic = async(function(size, page_number) {
    var elastic = config.elastic;
    var client = new elasticsearch.Client({
        host: elastic.host
    });

    var response = await (client.search({
        index: 'properties',
        type: 'property',
        from: page_number,
        size: size,
        body: {
            "fields": ["en.name", "en.id"],
            "query": {
                "term": { "en.supplier_id": "1" }
            }
        }
    }));

    if (response && response.hits && response.hits.hits) {
        return response.hits.hits;
    }
})
