import { Request, Response } from "express";

const PSI = require('@openmined/psi.js');

var express = require('express');
var app = express();
const cors = require('cors');
var bodyParser = require('body-parser');
 
// create application/json parser
var jsonParser = bodyParser.json();
app.use(cors());

app.use(express.static('public'));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function (req: Request, res: Response) {
  console.log("GOT IN")
  res.end("DONE")
});

app.post('/movies', jsonParser, function (req: Request, res: Response) {
  // console.log(req.body)
  // res.header("Access-Control-Allow-Origin", "*");
  // res.send("OK")

  (async () => {

    const psi = await PSI()

    const fpr = 0.001; // false positive rate (0.1%)
    const numClientElements = 10; // Size of the client set to check
    const numTotalElements = 100; // Maximum size of the server set
    const revealIntersection: boolean = false; // Allows to reveal the intersection (true)
  
  
    const server = psi.server.createWithNewKey(revealIntersection)

    const serverInputs = ["Iron Man (2008)", "The Incredible Hulk (2008)", "Iron Man 2 (2010)", "Thor (2011)", "Captain America: The First Avenger (2011)", "The Avengers (2012)", "Iron Man 3 (2013)", "Thor: The Dark World (2013)", "Captain America: The Winter Soldier (2014)", "Guardians of the Galaxy (2014)"]
  
    const serverSetup = server.createSetupMessage(
      fpr,
      numClientElements,
      serverInputs
    )
  
    // let data: number[] = [] 
    // for (const [key , value] of Object.entries(req.body.data)) {
    //   data.push(value as number)
    // }
    const clientRequest = Uint8Array.from(Uint8Array.from(req.body.data))
    

    const deserializedClientRequest = psi.request.deserializeBinary(
      clientRequest
    )
  
    // Process the client's request and return to the client
    const serverResponse = server.processRequest(deserializedClientRequest)
    const serializedServerResponse = serverResponse.serializeBinary()

    // Serialize the server setup. Will be an Uint8Array.
    const serializedServerSetup = serverSetup.serializeBinary()
    res.header("Access-Control-Allow-Origin", "*");
    res.send({
      serializedServerResponse: Array.from(serializedServerResponse),
      serializedServerSetup: Array.from(serializedServerSetup)
    })
  })()  
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})