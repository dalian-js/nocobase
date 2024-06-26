export class ErrorHandler {
  handlers = [];

  register(guard: (err) => boolean, render: (err, ctx) => void) {
    this.handlers.push({
      guard,
      render,
    });
  }

  defaultHandler(err, ctx) {
    ctx.status = err.statusCode || err.status || 500;

    let message = err.message;
    // if error has a cause, append it to the message
    if (err.cause) {
      message += `: ${err.cause.message}`;
    }

    ctx.body = {
      errors: [
        {
          message,
          code: err.code,
        },
      ],
    };
  }

  middleware() {
    const self = this;
    return async function errorHandler(ctx, next) {
      try {
        await next();
      } catch (err) {
        ctx.log.error(err.message, { method: 'error-handler', err: err.stack });

        if (err.statusCode) {
          ctx.status = err.statusCode;
        }

        for (const handler of self.handlers) {
          if (handler.guard(err)) {
            return handler.render(err, ctx);
          }
        }

        self.defaultHandler(err, ctx);
      }
    };
  }
}
