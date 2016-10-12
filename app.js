'use strict';
var books = require('./controllers/books');
var compress = require('koa-compress');
// Compress middleware for Koa
var logger = require('koa-logger');
var serve = require('koa-static');
// Koa static file serving middleware, wrapper for koa-send.
// app.use(require('koa-static')(root, opts));
// root root directory string. nothing above this root directory can be served
// opts options object.

var route = require('koa-route');
var koa = require('koa');
var path = require('path');
// The path module provides utilities(工具) for working with file and directory(目录) paths. It can be accessed using:
var app = module.exports = koa();

// Logger
app.use(logger());
// Recommended(推荐) that you .use() this middleware near the top to "wrap" all subsequent middleware.

app.use(route.get('/', books.home));
app.use(route.get('/books/', books.all));
app.use(route.get('/view/books/', books.list));
app.use(route.get('/books/:id', books.fetch));
app.use(route.post('/books/', books.add));
app.use(route.put('/books/:id', books.modify));
app.use(route.delete('/books/:id', books.remove));
app.use(route.options('/', books.options));
app.use(route.trace('/', books.trace));
app.use(route.head('/', books.head));



// Serve static files  get static file
app.use(serve(path.join(__dirname, 'public')));

// Compress
app.use(compress());
// module.parent 表示直接父级 !module.parent 表示没有对此模块的直接引用
if (!module.parent) {
  app.listen(8080);
  console.log('listening on port 8080');
}
