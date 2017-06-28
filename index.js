'use strict';


module.exports = (chain) => {
  return (req, res, next) => {
    return new Promise((resolve, reject) => {
      callMiddlewareChain(chain, req, res, (err) => {
        if (next) next(err);
        if (err) return reject(err);
        return resolve();
      });
    });
  }
};


/**
 *
 */
function callMiddlewareChain(chain, req, res, next, err) {
  if (!chain || !chain.length) return next(err);

  let current = 0;
  call(err);

  function call(err) {
    const middleware = chain[current];
    if (Array.isArray(middleware)) return callMiddlewareChain(middleware, req, res, handleNext, err);
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
    const nextMiddleware = chain[++current];
    if (!nextMiddleware) return next(err);
    call(err);
  }
}
