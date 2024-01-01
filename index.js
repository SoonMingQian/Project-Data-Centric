var express = require('express');
let ejs = require('ejs');
var mySQLDAO = require('./mySQLDAO');
var mongoDAO = require('./mongoDAO')
var app = express();
var bodyParser = require('body-parser');

// Define bodyParser middleware before routes
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

//A route for home page
app.get('/', (req, res) => {
    //Render the home page with links to various sections
    res.render('home', {
        links: [
            { url: '/stores', text: 'Stores' },
            { url: '/products', text: 'Products' },
            { url: '/managers', text: 'Managers (MongoDB)' },
        ],
    });
});

//A route to fetch and render stores data
app.get('/stores', (req, res) => {
    mySQLDAO.getStores()
        .then((data) => {
            res.render("stores", { "store": data });
        })
        .catch((error) => {
            console.error(error);
            res.send('Error fetching stores data');
        });
});

//A route to render the form for adding store
app.get('/addStores', (req, res) => {
    res.render('addStores');
});

//Handle the addition of stores
app.post('/addStores', async (req, res) => {
    console.log(req.body); // Log the request body to inspect its structure

    //Extract store data from the request body
    const storeData = {
        sid: req.body.sid,
        location: req.body.location,
        mgrid: req.body.mgrid,
    };

    //Check if the manager with the given ID exists in MongoDB
    const managerID = req.body.mgrid;
    const manager = await mongoDAO.findManagerID(managerID);
    const sid = req.body.sid;
    const storeDuplicate = await mySQLDAO.duplicateStore(sid);
    const managerDuplicate = await mySQLDAO.duplicateManager(managerID);

    //Handle errors and success 
    if(manager == null){
        return res.render('addStores', { message: "Error: Manager ID " + storeData.mgrid + " does not exist in MongoDB." })
    //Check the store id is duplicate
    }else if (storeDuplicate.length > 0){
        return res.render('addStores', { message: storeData.sid + " store ID is already exists." });
    }else if (managerDuplicate.length>0){
        return res.render('addStores', { message: storeData.mgrid + " is working in another store." });
    }else{
        mySQLDAO.addStores(storeData)
        res.redirect('/stores')
    }
});

//Routes for editing stores
app.get('/editStores/:sid', async (req, res) => {
    //Fetch store data by ID and render the edit form
    const storeID = {
        storeID: req.params.sid
    };

    mySQLDAO.getStoreByID(storeID)
        .then((data) => {
            res.render('editStores', { "store": data });
        })
        .catch((error) => {
            console.error(error);
            res.send('Error fetching stores data');
        })
})

app.post('/editStores/:sid', async (req, res) => {
    //Extract store data for editing
    const storeData = {
        sid: req.params.sid,
        location: req.body.location,
        mgrid: req.body.mgrid
    }

    //Check if the manager with the given ID exists in MongoDB
    //Fetch manager data and check if manager is another store
    const storeID = {
        storeID: req.params.sid
    };
    const managerID = req.body.mgrid;
    const manager = await mongoDAO.findManagerID(managerID);

    const managerWorking = await mySQLDAO.isManagerWorking(managerID);

    //Handle errors and success
    if (manager == null) {
        // handle manager not found error
        mySQLDAO.getStoreByID(storeID)
            .then((data) => {
                console.log(data)
                return res.render('editStores', { message: "Manager: " + storeData.mgrid + " doesnt exist in MongoDB.", "store": data })
            })
            .catch((error) => {
                console.error(error);
                res.send('Error fetching stores data');
            })
    } else if (storeData.location.length < 1) {
        // handle location length error
        mySQLDAO.getStores(storeID)
            .then((data) => {
                console.log(data)
                return res.render('editStores', { message: "Location must be at least 1 character.", "store": data })
            })
            .catch((error) => {
                console.error(error);
                res.send('Error fetching stores data');
            })
    } else if (managerWorking.length > 0 ) {
        // handle manager already managing another store error
        mySQLDAO.getStoreByID(storeID)
            .then((data) => {
                console.log(data)
                return res.render('editStores', { message: "Manager: " + storeData.mgrid + " already managing another store.", "store": data })
            })
            .catch((error) => {
                console.error(error);
                res.send('Error fetching stores data');
            })
    } else {
        //Edit the store and render the updated store data
        mySQLDAO.editStores(storeData)
        .then((data) => {
            console.log(data)
            mySQLDAO.getStores()
            .then((data) => {
                res.render("stores", { "store": data });
            })
            .catch((error) => {
                console.error(error);
                res.send('Error fetching stores data');
            });
           
        })
        .catch((error) => {
            res.render('error', { error: 'An error occurred while editing the store.' });
        })
    }
})

//Route to fetch and render products data
app.get('/products', async (req, res) => {
    mySQLDAO.getProducts()
        .then((data) => {
            res.render("products", { "product": data });
        })
        .catch((error) => {
            console.error(error);
            res.send('Error fetching products data');
        });
})

//Route to handle the deletion of products
app.get('/products/delete/:pid', async (req, res) => {
    //Fetch product ID 
    const productID = req.params.pid;

    //Check the product is sold
    try {
        const productSold = await mySQLDAO.checkProducts(productID);

        //Delete the product if sold, otherwise render an error message
        if (!productSold) {
            await mySQLDAO.deleteProducts(productID);
            res.redirect('/products');
        } else {
            res.render('errorMessage', { productID })
        }
    } catch (error) {
        console.error(error)
    }
})

//Route to fetch and render manager data from MongoDB
app.get('/managers', async (req, res) => {
    mongoDAO.getManager()
        .then((data) => {
            res.render("managers", { "manager": data })
        })
        .catch((error) => {
            console.log(error)
        })
})

//Route to render the form for adding managers
app.get('/addManager', (req, res) => {
    res.render('addManager');
});

//Handle the addition of manager
app.post('/addManager', async (req, res) => {
    console.log(req.body); // Log the request body to inspect its structure

    //Extract manager data from the request body
    const managerData = {
        _id: req.body.id,
        name: req.body.name,
        salary: req.body.salary,
    };

    //Check if the manager with the given ID exists in MongoDB
    const managerID = req.body.id;
    const manager = await mongoDAO.findManagerID(managerID);
    if (manager !== null) {
        return res.render('addManager', { message: "Error: Manager ID " + managerData._id + " already exists in MongoDB." })
    } else if (managerData._id.length != 4) {
        return res.render('addManager', { message: "Error: Manager ID must be 4 characters" })
    } else if (managerData.name.length <= 5) {
        return res.render('addManager', { message: "Error: Name must be > 5 characters" })
    } else if (managerData.salary < 30000 || managerData.salary > 70000) {
        return res.render('addManager', { message: "Error: Salary must be between 30,000 and 70,000" })
    } else {
        //Add manager to MongoDB and redirect to managers page
        mongoDAO.addManager(managerData)
        res.redirect('/managers')
    }
});

//Start the server and listen on port 3000
app.listen(3000, () => {
    console.log("Listening on port 3000");
});
