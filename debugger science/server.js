// Include Nodejs' net module.
const Net = require('net');

const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

// The port on which the server is listening.
const port = 10000;

// Use net.createServer() in your code. This is just for illustration purpose.
// Create a new TCP server.
const server = new Net.Server();
// The server listens to a socket for a client to make a connection request.
// Think of a socket as an end point.
server.listen(port, function() {
    console.log(`Server listening for connection requests on socket localhost:${port}`);
});

// When a client requests a connection with the server, the server creates a new
// socket dedicated to that client.
server.on('connection', function(socket) {
    console.log('A new connection has been established.');

    let messageCount = 0;

    rl.on("line", line => {
        socket.write(new Uint8Array([...Buffer.from(line, "utf-8"), 0]));
    });

    // The server can also receive data from the client by reading from its socket.
    socket.on('data', function(chunk) {
        console.log(`Data received from client: ${chunk.toString()}`);
        let payload = chunk.toString();
        /*if (messageCount++ == 0) {
            let response = new Uint8Array([...Buffer.from("run -i 0", "utf-8"), 0]);
            console.log(response);
            socket.write(response);

            let response2 = new Uint8Array([...Buffer.from("breakpoint_set -i 1 -t line -f \"C:\\Program Files (x86)\\Steam\\steamapps\\common\\dota 2 beta\\game\\dota_addons\\monopolis\\scripts\\vscripts\GameMode.lua\" -n 28"), 0]);
            console.log(response2);
            socket.write(response2);

        }*/
    });

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    socket.on('end', function() {
        console.log('Closing connection with the client');
    });

    // Don't forget to catch error, for your own sake.
    socket.on('error', function(err) {
        console.log(`Error: ${err}`);
    });
});