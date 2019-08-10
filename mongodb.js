const { MongoClient, ObjectID } = require("mongodb");

const connectionURL = `mongodb://127.0.0.1:27017/`;
const dbName = "task-manager";

MongoClient.connect(
  connectionURL,
  { useNewUrlParser: true },
  (error, client) => {
    if (error) {
      return console.log("There is some error", error);
    }

    const db = client.db(dbName);
    /**
     * CREATE
     */

    // db.collection('users').insertOne({
    //     name: 'Ajay',
    //     age: 34
    // }, (err, result) => {
    //     if (err) {
    //         return console.log('Error in db collection insertion');
    //     }

    db.collection("users").insertMany(
      [
        {
          name: "Ajay",
          age: 34
        },
        {
          name: "Neha",
          age: 33
        }
      ]
    ).then(result => {
        console.log(result.ops);
    }).catch(err => {
        console.log("Error in db collection insertion", err);
    });

    // db.collection('tasks').insertMany([
    //     {
    //         description: 'Finish NodeJs course',
    //         completed: false
    //     },
    //     {
    //         description: 'Search for a new JOB',
    //         completed: false
    //     },
    //     {
    //         description: 'Be patient and confident',
    //         completed: true
    //     }
    // ], (err, result) => {
    //     if (err) {
    //         return console.log('Error inserting documents to the `tasks` collection.')
    //     }

    //     console.log(result.ops)
    // })

    /**
     * READ---
     */
    /*
    // Fetch user with particular field (`_id` in this case)
    db.collection('tasks').findOne({ _id: new ObjectID('5d4cde21afc102cab0d0aef3') }, (err, user) => {
        if (err) {
            return console.log('Error in fetching user');
        }

        console.log(user);
    });

    db.collection('tasks').find({ completed: false }).toArray((err, tasks) => {
        console.log(tasks);
    });
    */

    /**
     * UPDATE---
     */

    /*
     db.collection('tasks').updateOne({ _id: new ObjectID('5d4cde21afc102cab0d0aef3') }, {
        $set: {
            description: 'Learn soon and try deployment'
        }
    }).then(doc => {
        console.log(doc)
    }).catch(err => {
        console.log(err);
    });

    db.collection('tasks').updateMany({ completed: false }, {
        $set: {
            completed: true
        }
    }).then(docs => {
        console.log(docs);
    }).catch(err => {
        console.log(err);
    })
    */

    /**
     * DELETE---
     */
    // db.collection("users")
    //   .deleteOne({ age: 34 })
    //   .then(result => console.log(result))
    //   .catch(err => console.log(err));
  }
);
