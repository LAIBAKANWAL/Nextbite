// Load environment variables FIRST - at the very top of your main server file
require('dotenv').config();
const express = require('express')
const app = express()
// const port = 5000

const mongoDB = require('./db')
mongoDB();

app.use((req,res,next)=>{
 res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL||"http://localhost:5173");
 res.header(
  "Access-Control-Allow-Headers",
  "Origin, X-Requested-With, Content-Type, Accept"
 );
 next()
})


app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!. This is NetxBite Backend.')
}) 

app.use('/api', require('./Routes/CreateUser'));
app.use('/api', require('./Routes/DisplayData'));
app.use('/api', require('./Routes/OrderData'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`NetxBite Backend listening on port ${PORT}`)
})