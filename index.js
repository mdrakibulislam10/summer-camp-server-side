const express = require("express");
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000 || process.env.PORT;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pqpiudt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();

        const usersCollection = client.db("summerCamp").collection("users");
        const classesCollection = client.db("summerCamp").collection("classes");

        // users related api
        app.post("/users", async (req, res) => {
            const user = req.body;
            const email = user?.email;
            const query = { email: email };
            const exists = await usersCollection.findOne(query);
            if (!exists) {
                const result = await usersCollection.insertOne(user);
                res.send(result);
            }
        });

        app.get("/userRole", async (req, res) => {
            const email = req.query?.email;
            if (email) {
                const query = { email: email };
                const user = await usersCollection.findOne(query);
                const userRole = user?.role;
                res.send(userRole);
            }
        });

        app.get("/users", async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        });

        app.patch("/users/:id", async (req, res) => {
            const id = req.params?.id;
            const userRoleObj = req.body;
            const filter = { _id: new ObjectId(id) };
            if (id) {
                const updateDoc = {
                    $set: {
                        role: userRoleObj.userRole,
                    },
                };

                const result = await usersCollection.updateOne(filter, updateDoc);
                res.send(result);
            }
        });

        // classes related api
        app.post("/classes", async (req, res) => {
            const martialClass = req.body;
            const result = await classesCollection.insertOne(martialClass);
            res.send(result);
        });

        app.get("/classes", async (req, res) => {
            const email = req.query.email;
            if (email) {
                const query = { email: email };
                const result = await classesCollection.find(query).toArray();
                res.send(result);
            }
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('summer camp is running');
});

app.listen(port, () => {
    console.log(`Summer camp listening on port ${port}`)
});