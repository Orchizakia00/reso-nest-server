const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors(
    // {
    //     origin: ['http://localhost:5173', 'https://reso-nest.web.app'],
    //     credentials: true
    // }
));
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.favwuwx.mongodb.net/?retryWrites=true&w=majority`;
// const uri = "mongodb://zakia290:Z3Y09hWOUXWSIxOT@ac-2rc66du-shard-00-00.favwuwx.mongodb.net:27017,ac-2rc66du-shard-00-01.favwuwx.mongodb.net:27017,ac-2rc66du-shard-00-02.favwuwx.mongodb.net:27017/?ssl=true&replicaSet=atlas-jki1xt-shard-0&authSource=admin&retryWrites=true&w=majority";
// MongoClient.connect(uri, function(err, client) {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });



const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
        tls: true,
        tlsAllowInvalidCertificates: false,
        tlsVersion: 'TLSv1.2'
    }
});

async function run() {
    try {
        // await client.connect();
        // console.log('connected');

        const roomsCollection = client.db('resoNest').collection('rooms');
        const bookingCollection = client.db('resoNest').collection('bookings');
        const reviewCollection = client.db('resoNest').collection('reviews');

        // auth api
        // jwt related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token });
        })

        // app.post('/jwt', async (req, res) => {
        //     const user = req.body;
        //     console.log(user);
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

        //     res
        //         .cookie('token', token, {
        //             httpOnly: true,
        //             secure: process.env.NODE_ENV === 'production',
        //             sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        //         })
        //         .send({ success: true });
        // })

        // rooms api
        app.get('/rooms', async (req, res) => {
            const cursor = roomsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/rooms/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await roomsCollection.findOne(query);
            res.send(result);
        })

        app.put('/rooms/:id/updateAvailability', async (req, res) => {
            const { id } = req.params;
            const query = { _id: new ObjectId(id) };
            // const options = { upsert: true };
            const updateDoc = { $set: { availability: false } };


            const result = await roomsCollection.updateOne(query, updateDoc);
            res.send(result);
        });

        app.put('/rooms/:id/updateAvailabilityToTrue', async (req, res) => {
            const { id } = req.params;
            const query = { _id: new ObjectId(id) };
            // const options = { upsert: true };
            const updateDoc = { $set: { availability: true } };


            const result = await roomsCollection.updateOne(query, updateDoc);
            res.send(result);
        });




        // booking api

        app.get('/bookings', async (req, res) => {
            console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

        app.get('/bookings', async (req, res) => {
            const cursor = bookingCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingCollection.findOne(query);
            res.send(result);
        })

        app.get('/bookings/:roomId', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingCollection.findOne(query);
            res.send(result);
        })

        app.put('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateBooking = req.body;
            console.log(updateBooking);
            // res.send(result);
            const updateDoc = {
                $set: {
                    customerName: updateBooking.customerName,
                    phone: updateBooking.phone,
                    date: updateBooking.date,
                    duration: updateBooking.duration,
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc, options);
            res.send(result);

        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        })

        // review api
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find();
            const result = await cursor.toArray();

            res.send(result);
        })

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            console.log(review);
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', async (req, res) => {
    res.send('Reso Nest server running');
})

app.listen(port, () => {
    console.log(`Reso Nest Server running on port ${port}`);
})

