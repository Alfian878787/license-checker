var vows = require('vows'),
    assert = require('assert'),
    path = require('path'),
    util = require('util');
    checker = require('../lib/index');

var tests = {
    loading: {
        topic: function() {
            return checker;
        },
        'should load init': function(topic) {
            assert.isFunction(topic.init);
        },
        'should load print': function(topic) {
            assert.isFunction(topic.print);
        }
    },
    'should parse local with unknown': {
        topic: function () {
            var self = this;

            checker.init({
                start: path.join(__dirname, '../')
            }, function (sorted) {
                self.callback(null, sorted);
            });
        },
        'and give us results': function (d) {
            assert.isTrue(Object.keys(d).length > 70);
            assert.equal(d['abbrev@1.0.7'].licenses, 'ISC');
        },
        'and convert to CSV': function(d) {
            var str = checker.asCSV(d);
            assert.equal('"module name","license","repository"', str.split('\n')[0]);
            assert.equal('"abbrev@1.0.7","ISC","https://github.com/isaacs/abbrev-js"', str.split('\n')[1]);
        },
        'and convert to MarkDown': function(d) {
            var str = checker.asMarkDown(d);
            assert.equal('[abbrev@1.0.7](https://github.com/isaacs/abbrev-js) - ISC', str.split('\n')[0]);
        },
        'should parse local without unknown': {
            topic: function () {
                var self = this;

                checker.init({
                    start: path.join(__dirname, '../'),
                    unknown: true
                }, function (sorted) {
                    self.callback(null, sorted);
                });
            },
            'and give us results': function (d) {
                assert.ok(d);
                assert.ok(d['vows@0.8.0'], 'failed to lookup vows dep');
                assert.equal(d['vows@0.8.0'].licenses, 'MIT');
                assert.isTrue(Object.keys(d).length > 20);
            }
        }
    },
    'should parse local with unknown': {
        topic: function () {
            var self = this;

            checker.init({
                start: path.join(__dirname, '../'),
                exclude: "MIT, ISC"
            }, function (filtered) {
                self.callback(null, filtered);
            });
        },
        'and exclude MIT and ISC licensed modules from results': function (d) {
            var excluded = true;
            Object.keys(d).forEach(function(item) {
                if (d[item].licenses && (d[item].licenses == "MIT" || d[item].licenses == "ISC"))
                    excluded = false;
            })
            assert.ok(excluded);
        }
    },
    'should not error': {
        topic: function () {
            var lic = require('../lib/license.js');
            return lic();
        },
        'on undefined': function (d) {
            assert.equal(d, 'Undefined');
        }
    },
    'should init without errors': {
        topic: function () {
            var self = this;

            checker.init({
                start: path.join(__dirname, '../')
            }, function (sorted, err) {
                self.callback(sorted, err);
            });
        },
        'errors should not exist': function (d, err) {
            assert.equal(err, null);
        }
    },
    'should init with errors (npm packages not found)': {
        topic: function () {
            var self = this;

            checker.init({
                start: 'C:\\'
            }, function (sorted, err) {
                self.callback(sorted, err);
            });
        },
        'errors should exist': function (d, err) {
            assert.isTrue(util.isError(err));
        }
    }
};



vows.describe('license-checker').addBatch(tests).export(module);
