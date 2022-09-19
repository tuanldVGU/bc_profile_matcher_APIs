const PSI = require('@openmined/psi.js');

(async () => {
  const psi = await PSI()

  // Define mutually agreed upon parameters for both client and server
  const fpr = 0.001 // false positive rate (0.1%)
  const numClientElements = 10 // Size of the client set to check
  const numTotalElements = 100 // Maximum size of the server set
  const revealIntersection = false // Allows to reveal the intersection (true)
  /******************
   *** 1. Server ****
   ******************/
  // Create new server instance
  //
  // By default, the server will only support calculating
  // the intersection size (cardinality). To obtain the
  // intersection of the two sets, pass in the boolean `true`.
  //
  // Ex: const server = psi.server.createWithNewKey(true)
  const server = psi.server.createWithNewKey(revealIntersection)
  // Specifying no parameters is equivalent to passing in `false`
  // const server = psi.server.createWithNewKey()

  // Example server set of data
  const serverInputs = Array.from(
    { length: numTotalElements },
    (_, i) => `Element ${i * 2}`
  )

  // Create the setup message that will later
  // be used to compute the intersection. By default,
  // this function will use Golomb Compressed Sets (GCS).
  // You may pass in an extra argument at the end to pick
  // the bloom filter option.
  const serverSetup = server.createSetupMessage(
    fpr,
    numClientElements,
    serverInputs
    // psi.dataStructure.GCS // This is the default and can omitted
  )

  // Example with regular bloom filter
  // const serverSetup = server.createSetupMessage(
  //   fpr,
  //   numClientElements,
  //   serverInputs,
  //   psi.dataStructure.BloomFilter
  // )

  /******************
   *** 2. Client ****
   ******************/
  // Create new client instance
  //
  // By default, the client will only support calculating
  // the intersection size (cardinality). To obtain the
  // intersection of the two sets, pass in the boolean `true`.
  //
  // Ex: const server = psi.client.createWithNewKey(true)
  const client = psi.client.createWithNewKey(revealIntersection)
  // Specifying no parameters is equivalent to passing in `false`
  // const client = psi.client.createWithNewKey()

  // Example client set of data to check
  const clientInputs = Array.from(
    { length: numClientElements },
    (_, i) => `Element ${i}`
  )
  // Create a client request to send to the server
  const clientRequest = client.createRequest(clientInputs)

  // Serialize the client request. Will be a Uint8Array.
  const serializedClientRequest = clientRequest.serializeBinary()

  console.log(serializedClientRequest)
  // ... send the serialized client request from client -> server

  /******************
   *** 3. Server ****
   ******************/
  // Deserialize the client request for the server
  const deserializedClientRequest = psi.request.deserializeBinary(
    serializedClientRequest
  )

  // Process the client's request and return to the client
  const serverResponse = server.processRequest(deserializedClientRequest)

  // Serialize the server response. Will be a Uint8Array.
  const serializedServerResponse = serverResponse.serializeBinary()

  // Serialize the server setup. Will be an Uint8Array.
  const serializedServerSetup = serverSetup.serializeBinary()
  // ... send the serialized server setup _and_ server response from server -> client

  /******************
   *** 4. Client ****
   ******************/
  // Deserialize the server response
  const deserializedServerResponse = psi.response.deserializeBinary(
    serializedServerResponse
  )

  // Deserialize the server setup
  const deserializedServerSetup = psi.serverSetup.deserializeBinary(
    serializedServerSetup
  )

  // NOTE:
  // A client can always compute the intersection size (cardinality), but by
  // default does not reveal the actual intersection between the two arrays.
  // This is dependent on whether or not _both_ client/server were initialized
  // with the same boolean `true` value which sets an internal `reveal_intersection` flag.
  // Any calls made to `getIntersection` will throw an error if this flag was not set to true.

  // Reveal the cardinality
  const intersectionSize = client.getIntersectionSize(
    deserializedServerSetup,
    deserializedServerResponse
  )
  console.log('intersectionSize', intersectionSize)
  // intsersectionSize 5

  // Reveal the intersection (only if `revealIntersection` was set to true)
  // const intersection = client.getIntersection(
  //   deserializedServerSetup,
  //   deserializedServerResponse
  // )
  // console.log('intersection', intersection)
  // intersection [ 0, 2, 4, 6, 8 ]
})()