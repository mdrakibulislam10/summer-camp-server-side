const express = require("express");
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000 || process.env.PORT;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
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