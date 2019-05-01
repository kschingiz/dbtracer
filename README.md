# DBTracer

DBTracer nodejs client will instrument mongodb and trace your queries:

4. Filter
5. Sort
6. Projection
7. Query duration

And it detects queries which is getting stuck.

## Installation

The package is not published to npm yet, but you clone this repo and link it to your project:

```bash
cd dbtracer
npm link

cd yourproject
npm link dbtracer
```

## Usage

```js
const assert = require('assert');
const mongodb = require('mongodb');

const DBTracer = require('./lib/index');

const dbtracer = DBTracer.start({
  mongodb,
  consoleLog: true,
  dbtracerServer: 'http://dbtracer.server/', // dbtracer server is in deep development
  queryTimeout: 10 * 1000,
  startQueryWatcher: true,
  queryWatcherInterval: 30 * 1000,
});

mongodb.MongoClient.connect('your conn string', { useNewUrlParser: true }, (err, dbClient) => {
  assert.ifError(err);

  const database = dbClient.db('your db');

  const restaurants = database.collection('mycollection');

  // this query will be caught by dbtracer and logger to the console and send to the dbtracer server
  restaurants.findOne({ name: 'query' });
});
```
