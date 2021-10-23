var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectId;

MongoClient.connect('mongodb://localhost:27017/todolist').then(client => {
  const db = client.db('todolist');
  const todosCollection = db.collection('todos');

  router.get('/todos', (req, res) => {
    todosCollection.find().toArray()
    .then(results => {
      console.log(results);
      res.json({"results": results});
    })
    .catch(error => console.error(error))
  });

  router.get('/todos/:id', (req, res) => {
    const id = req.params.id;
    todosCollection.findOne({_id: new ObjectId(id)})
    .then(results => {
      console.log(results);
      res.json({"results": [results]});
    })
    .catch(error => console.error(error))
  });

  router.post('/todos', (req, res) => {
    req.body.date_added = new Date();
    todosCollection.insertOne(req.body)
      .then(result => {
        console.log(result);
        res.json({"results": `Added todo ${result.insertedId}`});
      })
      .catch(error => console.error(error))
  });

  router.delete('/todos/:id', (req, res) => {
    const id = req.params.id;
    todosCollection.deleteOne({_id: new ObjectId(id)}, (err, obj) => {
      let delRes = {};
      if (err) {
        console.error(err);
        delRes.message = err;
      }
      if (obj.deletedCount === 0) {
        console.log("Nothing deleted");
        delRes.message = "Nothing deleted";
      } else {
        console.log(`Deleted ${obj.deletedCount} documents`);
        delRes.message = `Deleted ${obj.deletedCount} documents`;
      }
      res.json(delRes);
    });
  });

  router.put('/todos/:id', (req, res) => {
    const id = req.params.id;
    let body = {};
    let validProperties = ['msg', 'checked'];
    validProperties.forEach(property => {
      if (req.body.hasOwnProperty([property])) {
        body[property] = req.body[property];
      }
    });
    const setBody = { $set: body }
    todosCollection.updateOne({_id: new ObjectId(id)}, setBody, (err, obj) => {
      let putRes = {};
      console.log(obj);
      if (err) {
        console.error(err);
        putRes.message = err;
      }
      if (obj.modifiedCount === 0) {
        console.log("Nothing updated");
        putRes.message = "Nothing updated";
      } else {
        console.log(`Updated ${obj.modifiedCount} documents`);
        putRes.message = `Updated ${obj.modifiedCount} documents`;
      }
      res.json(putRes);
    });
  });

}).catch(err => {
  console.error("Could not connect to database", err);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
