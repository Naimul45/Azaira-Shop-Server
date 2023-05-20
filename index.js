const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken')


// middleware
app.use(cors())
app.use(express.json())






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f21lusd.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send('unauthorized access')
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'forbidden access' })

    }
    req.decoded = decoded;
    next();
  })
}
async function run() {
  try {


    const milkProductsCollection = client.db("departmentalStore").collection("milkProducts")
    const cakeProductsCollection = client.db("departmentalStore").collection("cakeproducts")
    const shampooProductsCollection = client.db("departmentalStore").collection("shampoo")
    const chocolateProductsColletion = client.db("departmentalStore").collection("chocolateproducts")
    const bookingsCollection = client.db("departmentalStore").collection('bookings');
    const addServiceCollection = client.db("departmentalStore").collection("addservice");
    const reviewCollection = client.db("departmentalStore").collection("review");
    const randomCollection = client.db("departmentalStore").collection("randomproducts");
    const usersCollection = client.db("departmentalStore").collection("users");


    app.post('/users', async (req, res) => {
      const info = req.body;
      const result = await usersCollection.insertOne(info)
      res.send(result)
    })
    app.get('/users', async (req, res) => {
      const query = {}
      const result = await usersCollection.find(query).toArray()
      res.send(result)
    })
    app.get('/products', async (req, res) => {
      // const email = req.query.email;
      // const decodedEmail = req.decoded.email
      // if (email !== decodedEmail) {
      //   return res.status(403).send({ message: 'forbidden access' })
      // }
      const query = {};
      const result = await milkProductsCollection.find(query).toArray();
      // console.log(result);
      res.send(result)
    })
    app.get('/cake', async (req, res) => {
      const query = {}
      const result = await cakeProductsCollection.find(query).toArray();
      res.send(result)
    })
    app.get('/shampoo', async (req, res) => {
      const query = {}
      const result = await shampooProductsCollection.find(query).toArray();
      res.send(result)
    })
    app.get('/bookings', async (req, res) => {
      const email = req.query.email;
      // const decodedEmail = req.decoded.email;
      // if (email !== decodedEmail) {
      //   return res.status(403).send({ message: 'forbidden access' })
      // }
      const query = { email: email }
      const result = await bookingsCollection.find(query).toArray()
      res.send(result)
    })
    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;

      console.log("id", id)
      const filter = { _id: new ObjectId(id) }
      const result = await bookingsCollection.deleteOne(filter);
      res.send(result)




    })
    app.post('/bookings', async (req, res) => {
      const info = req.body;
      // console.log(info)
      const result = await bookingsCollection.insertOne(info)
      res.send(result)

    })
    app.post('/review', async (req, res) => {
      const info = req.body;
      const result = await reviewCollection.insertOne(info)
      res.send(result)
    })

    app.get('/review', async (req, res) => {
      const query = {}
      const result = await reviewCollection.find(query).toArray()
      res.send(result)
    })
    app.get('/addservice', async (req, res) => {
      const query = {}
      const result = await addServiceCollection.find(query).toArray()
      res.send(result)
    })
    app.get('/randomproducts', async (req, res) => {
      const query = {}
      const result = await randomCollection.find(query).toArray()
      res.send(result);
    })

    app.get('/jwt', async (req, res) => {
      const email = req.query.email;
      const query = { email: email }
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
        return res.send({ accessToken: token })
      }

      // console.log(user)
      res.status(403).send({ accessToken: '' })
    })

    app.post('/addservice', async (req, res) => {
      const info = req.body;
      const result = await addServiceCollection.insertOne(info);
      res.send(result);
    })

    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === 'admin' });
    })
    app.put('/users/admin/:id', verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      console.log(decodedEmail)
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query)
      if (user?.role !== 'admin') {
        return res.status(403).send({ message: 'forbidden access' })
      }
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await usersCollection.updateOne(filter, updatedDoc, options);
      res.send(result)
    })

    app.listen(port, () => {
      console.log(`Server is running on ${port}`)
    })

  }


  finally {

  }
}
run().catch(error => console.error(error));
app.get('/', async (req, res) => {
  res.send('we are going start our server-side')
})


