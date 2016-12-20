'use strict';

var express = require('express');
var controller = require('./property.controller');

var router = express.Router();

require('manakin').global;

router.get('/', controller.index);

module.exports = router;