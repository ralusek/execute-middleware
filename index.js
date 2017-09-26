'use strict';


/**
 *
 */
module.exports.serial = serial;

/**
 *
 */
module.exports.concurrent = concurrent;

/**
 *
 */
module.exports.any = any;



/**
 *
 */
function serial(middlewares, err) {
  if (!Array.isArray(middlewares)) throw new Error('concurrent-middleware serial expects first argument to be an array of middleware.');
  if (!middlewares.length) return next(err);

  return (req, res, next) => {
    let current = 0;

    execute(middlewares[current], err);

    function execute(middleware, err) {
      if (Array.isArray(middleware)) return execute(serial(middleware, err));
      const isErrorHandler = middleware.length === 4;
      if (err) {
        // There is an error and the current middleware is an error handler.
        if (isErrorHandler) return middleware(err, req, res, handleNext);
        // There is an error but the current middleware is not an error handler,
        // so we progress to the next.
        if (err) return handleNext(err);
      }
      // There is no error but this middleware is an error handler, so we progress
      // to next.
      if (isErrorHandler) return handleNext();
      // There is no error and this middleware is not an error handler.
      middleware(req, res, handleNext);
    }

    function handleNext(err) {
      const subsequent = middlewares[++current];
      if (!subsequent) return next(err);
      execute(subsequent, err);
    }
  };
}


/**
 *
 */
function concurrent(middlewares) {
  if (!middlewares) throw new Error('concurrent-middleware cannot execute middlewares, none provided.');
  if (!Array.isArray(middlewares)) throw new Error('concurrent-middleware expects first argument to be an array of middleware.');
  const total = middlewares.length;

  return (req, res, next) => {
    let completed = 0;
    let error;
    middlewares.forEach(middleware => {
      if (Array.isArray(middleware)) middleware = serial(middleware);
      middleware(req, res, (err) => {
        // Check if an error has already been handled.
        if (error) return;
        if (err) return next(error = err);
        if (++completed === total) next();
      });
    });
  };
}


/**
 *
 */
function any(middlewares) {
  if (!middlewares) throw new Error('concurrent-middleware cannot execute middlewares, none provided.');
  if (!Array.isArray(middlewares)) throw new Error('concurrent-middleware expects first argument to be an array of middleware.');
  const total = middlewares.length;

  return (req, res, next) => {
    const errors = [];
    let completed = 0;

    middlewares.forEach(middleware => {
      if (Array.isArray(middleware)) middleware = serial(middleware);
      middleware(req, res, (err) => {
        if (err) errors.push(err);
        if (++completed === total) ((errors.length === total) ? next(errors) : next());
      });
    });
  };
}
