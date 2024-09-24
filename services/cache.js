const mongoose = require("mongoose");
const exec = mongoose.Query.prototype.exec;
const redis = require("redis");
const redisUrl = "redis://127.0.0.1:6379";
const util = require("util");

// Let's promisify this function in order to avoid calling
// the callback so we can know the result of reading a redis key
// by making client.get return a promise

const client = redis.createClient(redisUrl);
//client.get = util.promisify(client.get);
client.hget = util.promisify(client.hget);

mongoose.Query.prototype.cache = function (options = {}) {
  // `this` is the query instance
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "");
  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (this.useCache) {
    // `this` references to the current query
    const key = JSON.stringify(
      Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name,
      })
    );

    const cacheValue = await client.hget(this.hashKey, key);
    console.log("key is ", key, " cached value ", cacheValue);

    if (cacheValue) {
      const doc = JSON.parse(cacheValue);
      return Array.isArray(doc)
        ? doc.map((record) => new this.model(record))
        : new this.model(doc);
    }

    const result = await exec.apply(this, arguments);
    // Cache expires in 10 seconds
    client.hset(this.hashKey, key, JSON.stringify(result), "EX", 10);

    return result;
  }

  return exec.apply(this, arguments);
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
};
