var pmysql = require('promise-mysql')

var pool;

//Create a MySQL connection pool
pmysql.createPool({
    connectionLimit: 3,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'proj2023'
})
    .then((p) => {
        pool = p
    })
    .catch((e) => {
        console.log("pool error:" + e)
    })


//Function to get all stores
function getStores() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM store')
            .then((data) => {
                // Resolve the promise with the fetched data
                resolve(data);
            })
            .catch(error => {
                // Reject the promise with the error

                reject(error);
            });
    });
}

// Function to fetch a store by its ID
function getStoreByID(storeID) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'SELECT * FROM store WHERE sid = ?',
            values: [storeID.storeID]
        }
        pool.query(myQuery)
            .then((data) => {
                console.log(data)
                resolve(data);
            })
            .catch(error => {
                console.log(error)
                reject(error);
            })
    })
}

// Function to add a new store
function addStores(storeData) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'INSERT INTO store VALUES (?, ?, ?)',
            values: [storeData.sid, storeData.location, storeData.mgrid]
        }
        pool.query(myQuery)
            .then((data) => {
                console.log(data)
                resolve(data);
            })
            .catch(error => {
                console.log(error)
                reject(error);
            })
    })
}

// Function to edit an existing store
function editStores(storeData) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'UPDATE store SET location = ?, mgrid = ? WHERE sid = ?',
            values: [storeData.location, storeData.mgrid, storeData.sid]
        }
        pool.query(myQuery)
            .then((data) => {
                console.log(myQuery)
                console.log(data)
                resolve(data);
            })
            .catch(error => {
                console.log(error)
                reject(error);
            })
    })
}

// Function to fetch all products
function getProducts() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT product.pid, product.productdesc, product.supplier, product_store.sid, store.location, product_store.Price FROM product INNER JOIN product_store ON product.pid = product_store.pid INNER JOIN store ON product_store.sid = store.sid')
            .then((data) => {
                // Resolve the promise with the fetched data
                resolve(data);
            })
            .catch(error => {
                // Reject the promise with the error
                reject(error);
            });
    })
}

// Function to check if a product is associated with any store
function checkProducts(pid) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'SELECT COUNT(*) AS count FROM product_store WHERE pid = ?',
            values: [pid]
        }
        pool.query(myQuery, (error, results) => {
            if (error) {
                reject(error);
                return;
            }

            const count = results[0].count;
            resolve(count > 0);
        });
    })
}

// Function to delete a product
function deleteProducts() {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'DELETE FROM product WHERE pid = ?',
            values: [pid]
        }
        pool.query(myQuery)
            .then((data) => {
                console.log(data)
                resolve(data);
            })
            .catch(error => {
                console.log(error)
                reject(error);
            })
    })
}

// Function to check if a manager is currently managing any store
function isManagerWorking(managerID){
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'SELECT * FROM store WHERE mgrid = ?',
            values: [managerID]
        }
        pool.query(myQuery)
        .then((data) => {
            console.log(myQuery)    
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    })
}

function duplicateStore(sid){
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'SELECT * FROM store WHERE sid = ?',
            values: [sid]
        }
        pool.query(myQuery)
        .then((data) => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    })
}

function duplicateManager(managerID){
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'SELECT * FROM store WHERE mgrid = ?',
            values: [managerID]
        }
        pool.query(myQuery)
        .then((data) => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        })
    })
}
module.exports = { getStores, addStores, editStores, getStoreByID, getProducts, checkProducts, deleteProducts, isManagerWorking, duplicateStore, duplicateManager}