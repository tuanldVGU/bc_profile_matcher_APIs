import { NextFunction, Request, Response } from "express";

const PSI = require('@openmined/psi.js');

var express = require('express');
var app = express();
const cors = require('cors');
var bodyParser = require('body-parser');

import 'reflect-metadata';

require('dotenv').config();
 
// create application/json parser
var jsonParser = bodyParser.json();
app.use(cors());

app.use(express.static('public'));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(function(req: Request, res: Response, next: NextFunction) {
  res.header("Access-Control-Allow-Origin", "*")
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested, Content-Type, Accept Authorization"
    )
    if (req.method === "OPTIONS") {
      res.header(
        "Access-Control-Allow-Methods",
        "POST, PUT, PATCH, GET, DELETE"
      )
      return res.status(200).json({})
    }
    next()
});

app.get('/', function (req: Request, res: Response) {
  console.log("GOT IN")
  res.end("DONE")
});

app.post('/movies', jsonParser, function (req: Request, res: Response) {

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

app.post('/maps', jsonParser, function (req: Request, res: Response) {
  (async () => {

    const psi = await PSI()

    const fpr = 0.001; // false positive rate (0.1%)
    const numClientElements = 10; // Size of the client set to check
    const numTotalElements = 100; // Maximum size of the server set
    const revealIntersection = false; // Allows to reveal the intersection (true)
  
  
    const server = psi.server.createWithNewKey(revealIntersection)

    const serverInputs = ['r1f93ckm', 'r1f963uz', 'r1f94z5q', 'r1f91rwj', 'r1f94jfz', 'r1f936kn', 'r1f963et', 'r1f96500', 'r1f965cz', 'r1f96k00']
  
    const serverSetup = server.createSetupMessage(
      fpr,
      numClientElements,
      serverInputs
    )
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


import SocketServer from './socket'

const http = require('http').createServer(app)



var server = http.listen(process.env.PORT || 8081, function () {
  var host = server.address().address
  var port = server.address().port
  console.log(server.address())
  console.log(`Example app listening at http://${host}:${port}`)
})

const io = SocketServer(server)



