/* global __dirname, require, process, it */
'use strict';

var pkg = require('../package.json'),
  myObject = require('../index.js'),
  TU = require('rd-tu'),
  fs = require('fs'),
  path = require('path');

// Données de test
var docObject = require('./dataset/in/docObject.sample.json'),
  dataset = {
    "paths": require('./dataset/in/data/paths.json'),
    "resources": require('./dataset/in/data/resources.json'),
    "files": require('./dataset/in/data/files.json'),
    "enrichments": require('./dataset/in/data/enrichments.json'),
    "directories": require('./dataset/in/data/directories.json'),
    "XML": require('./dataset/in/data/XML.json'),
    "URL": require('./dataset/in/data/URL.json')
  };

// Mapping indiquant quelle fonction de test et quelles données utiliser pour chaque fonction
var wrapper = {
  "paths": {
    "init": testOf_pathsInit
  },
  "resources": {
    "require": testOf_resourcesRequire
  },
  "files": {
    "createPath": null,
    "get": testOf_fileRepresentation,
    "select": testOf_fileRepresentation,
    "selectAll": testOf_fileRepresentation
  },
  "enrichments": {
    "save": testOf_enrichmentsSave,
    "write": testOf_enrichmentsWrite
  },
  "directories": {
    "sync": null
  },
  "XML": {
    "load": testOf_xmlLoad,
    "select": testOf_xmlSelect
  },
  "URL": {
    "addParameters": testOf_urlAddParameters
  }
};

/**
 * Test de chaques fonctions de :
 * - myObject.paths.
 *   - init()
 *
 * - myObject.resources.
 *   - require()
 *
 * - myObject.files.
 *   - selectAll()
 *   - select()
 *   - get()
 *   - createPath()
 *
 * - myObject.enrichments.
 *   - write()
 *   - save()
 *
 * - myObject.directories.
 *   - sync()
 *
 * - myObject.XML.
 *   - load()
 *   - select()
 *
 * - myObject.URL.
 *   - addParameters()
 */
TU.start({
  description: pkg.name + '/index.js',
  root: 'myObject',
  object: myObject,
  dataset: dataset,
  wrapper: wrapper
});

/**
 * Fonction de test à appliquée pour :
 * - myObject.paths.init()
 */
function testOf_pathsInit(fn, item, cb) {
  var result = fn(item.arguments.paths, item.arguments.root);
  return cb(result.test);
}

/**
 * Fonction de test à appliquée pour :
 * - myObject.resources.require()
 */
function testOf_resourcesRequire(fn, item, cb) {
  var paths = myObject.paths.init(item.arguments.paths, __dirname);
  return cb(fn(paths));
}

/**
 * Fonction de test à appliquée pour :
 * - myObject.files.selectAll()
 * - myObject.files.select()
 * - myObject.files.get()
 */
function testOf_fileRepresentation(fn, item, cb) {
  if (item.regExp) setRegex(item.regExp, item.arguments.options);
  return cb(fn(docObject[item.container], item.arguments.options));
}

/**
 * Fonction de test à appliquée pour :
 * - myObject.enrichments.save()
 */
function testOf_enrichmentsSave(fn, item, cb) {
  var before = (item.arguments.enrichments && item.arguments.enrichments[item.arguments.options.label]) ? item.arguments.enrichments[item.arguments.options.label].length : 0, // Nombre d'enrichissement avant
    result = fn(item.arguments.enrichments, item.arguments.options),
    after = result[item.arguments.options.label].length; // Nombre d'enrichissement aprés
  cb(after - before);
}

/**
 * Fonction de test à appliquée pour :
 * - myObject.enrichments.write()
 */
function testOf_enrichmentsWrite(fn, item, cb) {
  fn(item.arguments.options, function(err) {
    cb(err);
  });
}

/**
 * Fonction de test à appliquée pour :
 * - myObject.XML.load()
 */
function testOf_xmlLoad(fn, item, cb) {
  var xmlStr = fs.readFileSync(path.join(__dirname, item.path), 'utf-8');
  return cb(fn(xmlStr));
}

/**
 * Fonction de test à appliquée pour :
 * - myObject.XML.select()
 */
function testOf_xmlSelect(fn, item, cb) {
  var xmlStr = fs.readFileSync(path.join(__dirname, item.path), 'utf-8');
  var jsonObject = myObject.XML.load(xmlStr);
  return cb(fn(item.arguments.selector, jsonObject)[0]);
}

/**
 * Fonction de test à appliquée pour :
 * - myObject.URL.addParameters()
 */
function testOf_urlAddParameters(fn, item, cb) {
  return cb(fn(item.arguments.url, item.arguments.parameters));
}

// Set une regex pour chaque clée demandée
function setRegex(keys, options) {
  for (var i = 0; i < keys.length; i++) {
    if (options instanceof Array) {
      for (var j = 0; j < options.length; j++) {
        options[j][keys[i]] = new RegExp(options[j][keys[i]]);
      }
    } else {
      options[keys[i]] = new RegExp(options[keys[i]]);
    }
  }
}