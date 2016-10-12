'use strict';
var views = require('co-views');
var parse = require('co-body');
var monk = require('monk');
var wrap = require('co-monk');
// mongodb generator goodness for co
var db = monk('localhost/library');
// Monk is a tiny layer that provides simple yet substantial usability improvements for MongoDB usage within Node.JS.
// const db = require('monk')('localhost/mydb')
// const users = db.get('users')
//
// users.index('name last')
// users.insert({ name: 'Tobi', bigdata: {} })
// users.find({ name: 'Loki' }, '-bigdata').then(function () {
//   // exclude bigdata field
// })
// users.find({}, {sort: {name: 1}}).then(function () {
//   // sorted by name field
// })
// users.remove({ name: 'Loki' })
//
// db.close()

var co = require('co');
// Generator based control flow goodness for nodejs and the browser, using promises, letting you write non-blocking(无阻塞) code in a nice-ish way.
var books = wrap(db.get('books'));
// Call wrap() on collections to make them generator friendly

// From lifeofjs
co(function * () {
  var books = yield books.find({});
});

var render = views(__dirname + '/../views', {
  map: {
    html: 'swig'
  }
});

module.exports.home = function * home(next) {
  if ('GET' != this.method) return yield next;
  this.body = yield render('layout');
};

module.exports.list = function * list(next) {
  if ('GET' != this.method) return yield next;
  this.body = yield render('list', {
    'books': yield books.find({})
  });
};

// This must be avoided, use ajax in the view.
module.exports.all = function * all(next) {
  if ('GET' != this.method) return yield next;
  this.body = yield books.find({});
};

module.exports.fetch = function * fetch(id,next) {
  if ('GET' != this.method) return yield next;
  // Quick hack.
  if(id === ""+parseInt(id, 10)){
    var book = yield books.find({}, {
      'skip': id - 1,
      'limit': 1
    });
    if (book.length === 0) {
      this.throw(404, 'book with id = ' + id + ' was not found');
    }
    this.body = yield book;
  }

};

module.exports.add = function * add(data,next) {
  if ('POST' != this.method) return yield next;
  var book = yield parse(this, {
    limit: '1kb'
  });
  var inserted = yield books.insert(book);
  // insert是数据库操作 monk用语
  if (!inserted) {
    this.throw(405, "The book couldn't be added.");
  }
  this.body = 'Done!';
};

module.exports.modify = function * modify(id,next) {
  if ('PUT' != this.method) return yield next;

  var data = yield parse(this, {
    limit: '1kb'
  });

  var book = yield books.find({}, {
    'skip': id - 1,
    'limit': 1
  });

  if (book.length === 0) {
    this.throw(404, 'book with id = ' + id + ' was not found');
  }

  var updated = books.update(book[0], {
    $set: data
  });

  if (!updated) {
    this.throw(405, "Unable to update.");
  } else {
    this.body = "Done";
  }
};

module.exports.remove = function * remove(id,next) {
  if ('DELETE' != this.method) return yield next;

  var book = yield books.find({}, {
    'skip': id - 1,
    'limit': 1
  });

  if (book.length === 0) {
    this.throw(404, 'book with id = ' + id + ' was not found');
  }

  var removed = books.remove(book[0]);

  if (!removed) {
    this.throw(405, "Unable to delete.");
  } else {
    this.body = "Done";
  }

};

module.exports.head = function *(){
  return;
};

module.exports.options = function *() {
  this.body = "Allow: HEAD,GET,PUT,DELETE,OPTIONS";
};

module.exports.trace = function *() {
  this.body = "Smart! But you can't trace.";
};
