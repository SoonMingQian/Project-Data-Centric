const MongoClient = require('mongodb').MongoClient

var coll;

//Connect to mongoDB server
MongoClient.connect('mongodb://127.0.0.1:27017')
    .then((client) => {
        db = client.db('usersdb')
        coll = db.collection('proj2023MongoDB')
    })
    .catch((error) => {
        console.log(error.message)
    })

//Function to find a manager by ID in MongoDB collection
var findManagerID = function (managerID) {
    return new Promise((resolve, reject) => {
        coll.findOne({ _id: managerID })
        .then((documents) => {
            resolve(documents)
        })
        .catch((error) => {
            reject(error)
        })
    });
};

//Function to get all manager from the MongoDB collection
var getManager = function(){
    return new Promise((resolve, reject) => {
        var cursor = coll.find()
        cursor.toArray()
        .then((documents) => {
            resolve(documents)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

//Function to add a new manager to the MongoDB collection
var addManager = function(managerData){
    return new Promise((resolve, reject) => {
        coll.insertOne({_id: managerData._id, name: managerData.name, salary: managerData.salary})
        .then((documents) => {
            resolve(documents)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

module.exports = { findManagerID, getManager, addManager }