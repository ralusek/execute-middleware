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
const mw = require('execute-middleware');
```

Now say we had some middleware like this:

```javascript
const MIDDLEWARE = [
  (req, res, next) => {
    console.log('Middleware A');
    next();
  },
  // Error handling middleware which should not be invoked.
  (err, req, res, next) => {
    console.log('Middleware B: I should not have been invoked.');
    next();
  },
  // Some nested middleware
  [
    (req, res, next) => {
      console.log('Middleware B1');
      next();
    },
    (req, res, next) => {
      console.log('Middleware B2');
      next();
    }
  ],
  (req, res, next) => {
    console.log('Middleware C');
    next();
  }
];
```

We could execute it like this:
```javascript
  // These can be anything, passed along as req/res objects.
  const req = {};
  const res = {};

  // Can invoke with a next
  mw(MIDDLEWARE)(req, res, (err) => {
    console.log('Middleware executed, if there was an error its here:', err);
  });

  // Or can invoke as a promise
  mw(MIDDLEWARE)(req, res)
  .then(() => console.log('Middleware executed.'));
```
