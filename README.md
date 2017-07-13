### Use-case
This utility is for the execution of arbitrarily complex express-style middleware.

Express middleware is executed by allowing either a middleware function or an
array, calling each piece of middleware and awaiting the callback `next` to be
invoked. When `next` is invoked, the next middleware is called. If `next` is
invoked with an argument, this is treated as an error. Upon being invoked with
an error, all subsequent middleware is ignored until an error handler middleware
is encountered, defined as a piece of middleware expecting 4 arguments, rather
than 3.

This, for example, is how error handling middleware looks:

```javascript
(err, req, res, next) => {
  // Error handler
}

```
As compared to normal middleware, which would be skipped over if an error is
being propagated through the middleware:
```
(req, res, next) => {
  // Normal middlware
}
```

Note that the names of the arguments don't matter, just the amount of expected
arguments.


### Usage

`$ npm install execute-middleware`

```javascript
const executeMW = require('execute-middleware');

// Some middleware
const SOME_MIDDLEWARE = [
  (req, res, next) => {
    console.log('hi.');
    next()
  },
  [
    (req, res, next) => {
      console.log('hey');
    },
    (err, req, res, next) => {
      console.log('I will not be called, because im not an error.');
    }
  ]
];

// Execute MW serially
executeMW.serial(SOME_MIDDLEWARE);

// Execute MW concurrently
executeMW.concurrent(SOME_MIDDLEWARE);
```
