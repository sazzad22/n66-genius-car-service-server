const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

//middleware
app.use(cors());
app.use(express.json());

//jwt middleware fucn
function verifyJWT(req, res, next) {
  const authHeader = req.header.authorization;
  console.log("from verifyJWT", authHeader);
}

//connecting with mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster-j.ca2ci.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//async function - inside we write api's
async function run() {
  try {
    await client.connect();
    const serviceCollection = client
      .db("GeniusCarService")
      .collection("services");
    const orderCollection = client.db("GeniusCarService").collection("order");
    //data load ,find document, update or any other crud operation api er vetor rakhte hobe

    //we use this api to load all the services in the client side

    //AUTH
    //JWT
    app.post("/login", async (req, res) => {
      //ei user er vetor usually user er email thake.password ekhane rakha hoy na cz sheta secure na.
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query); //multiple hole find ,one data hole find one
      const services = await cursor.toArray();
      res.send(services);
    });
    // (read)api for loading single service by the id route
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    //post - (create) saving new service to the db
    app.post("/services", async (req, res) => {
      const newService = req.body;
      const result = await serviceCollection.insertOne(newService);
      res.send(result);
    });
    //delete
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    });

    //Order collection api
    //read from the db
    //getting the orders of a specific user the jwt middle ware will verify the jwt token. It can be used at other api's but should be used where needed
    app.get("/order", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });
    //Create
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
  } finally {
  }
}

//calling the async function
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, () => {
  console.log("running genius server to port - ", port);
});
