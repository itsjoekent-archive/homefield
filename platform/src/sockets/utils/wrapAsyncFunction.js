module.exports = function wrapAsyncFunction(target, onFail = defaultOnFail) {
  async function wrapper(...args) {
    try {
      return await target(...args);
    } catch (error) {
      if (onFail) {
        return onFail(error);
      } else {
        return defaultOnFail(error);
      }
    }
  }

  return wrapper;
}
