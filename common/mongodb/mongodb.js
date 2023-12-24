const { MongoClient } = require("mongodb");

let _client = null;

module.exports = class MongoDBClient {
  mongoClient;
  collectionClient;
  tableName;
  context;

  constructor(uri, dbName, collectionName, context) {
    return (async () => {
      this.context = context ? context : console;

      let mongoClient = null;
      if (_client != null) {
        this.context.log("constructor Existed");
        mongoClient = _client;
      } else {
        this.context.log("constructor New");
        mongoClient = new MongoClient(uri);
        await mongoClient.connect();
        _client = mongoClient;
      }

      const database = mongoClient.db(dbName);
      const collectionClient = database.collection(collectionName);

      this.mongoClient = mongoClient;
      this.collectionClient = collectionClient;

      return this;
    })();
  }

  async getOneByID(id) {
    const query = { _id: id };
    return this.collectionClient.findOne(query, {});
  }

  async getOne(query) {
    return this.collectionClient.findOne(query, {});
  }

  // Ex: const sort = { length: -1 };
  async getOneWithSort(query, sort) {
    return this.collectionClient.findOne(query, {
      sort: sort,
    });
  }

  async getAll() {
    const query = {};
    const cursor = await this.collectionClient.find(query, {});

    const result = [];
    await cursor.forEach((entity) => {
      result.push(entity);
    });

    return result;
  }

  // Page start from 1
  async getAllPagination(count, page) {
    if (count < 0 || page < 0) {
      return [];
    }

    const query = {};
    const cursor = await this.collectionClient
      .find(query, {})
      .skip((page - 1) * count)
      .limit(count);

    const result = [];
    await cursor.forEach((entity) => {
      result.push(entity);
    });

    return result;
  }

  // Page start from 1
  async getAllPaginationWithSort(sort, count, page) {
    if (count < 0 || page < 0) {
      return [];
    }

    const query = {};
    const cursor = await this.collectionClient
      .find(query, { sort: sort })
      .skip((page - 1) * count)
      .limit(count);

    const result = [];
    await cursor.forEach((entity) => {
      result.push(entity);
    });

    return result;
  }

  async queryAll(query) {
    const cursor = await this.collectionClient.find(query, {});

    const result = [];
    await cursor.forEach((entity) => {
      result.push(entity);
    });

    return result;
  }

  async queryAllWithProjection(query, projection) {
    const cursor = await this.collectionClient.find(query).project(projection);

    const result = [];
    await cursor.forEach((entity) => {
      result.push(entity);
    });

    return result;
  }

  async queryAllWithSort(query, sort) {
    const cursor = await this.collectionClient.find(query, { sort: sort });

    const result = [];
    await cursor.forEach((entity) => {
      result.push(entity);
    });

    return result;
  }

  // https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/query-document/
  // Page start from 1
  async queryAllPaginationWithSort(query, sort, count, page) {
    if (count < 0 || page < 0) {
      return [];
    }

    const cursor = await this.collectionClient
      .find(query, { sort: sort })
      .skip((page - 1) * count)
      .limit(count);

    const result = [];
    await cursor.forEach((entity) => {
      result.push(entity);
    });

    return result;
  }

  async countTotal() {
    return this.collectionClient.countDocuments({});
  }

  async countTotalByQuery(query) {
    return this.collectionClient.countDocuments(query);
  }

  async insertOne(doc) {
    try {
      const result = await this.collectionClient.insertOne(doc);
      return result.acknowledged;
    } catch (e) {
      this.context.log(e);
      return false;
    }
  }

  async insertMultiple(docs) {
    try {
      const options = { ordered: true };
      const result = await this.collectionClient.insertMany(docs, options);
      return result.acknowledged;
    } catch (e) {
      this.context.log(e);
      return false;
    }
  }

  async updateOne(query, doc) {
    try {
      const result = await this.collectionClient.updateOne(query, {
        $set: doc,
      });
      return result.acknowledged;
    } catch (e) {
      this.context.log(e);
      return false;
    }
  }

  async updateOneWithOptions(query, doc, options) {
    const result = await this.collectionClient.updateOne(
      query,
      {
        $set: doc,
      },
      options
    );
    return result.acknowledged;
  }

  async pushDocument(query, doc, multiple) {
    let result;
    if (multiple) {
      result = await this.collectionClient.updateMany(query, {
        $push: doc,
      });
    } else {
      result = await this.collectionClient.updateOne(query, {
        $push: doc,
      });
    }
    return result.acknowledged;
  }

  async pullDocument(query, doc) {
    const result = await this.collectionClient.updateOne(query, {
      $pull: doc,
    });
    return result.acknowledged;
  }

  async updateMany(query, doc) {
    const result = await this.collectionClient.updateMany(query, {
      $set: doc,
    });
    return result.acknowledged;
  }

  async aggregate(query) {
    const result = await this.collectionClient.aggregate(query);
    return result.acknowledged;
  }

  async deleteOne(query) {
    try {
      const result = await this.collectionClient.deleteOne(query);
      return result.deletedCount === 1;
    } catch (e) {
      this.context.log(e);
      return false;
    }
  }

  async close() {
    await this.mongoClient.close();
  }
};
