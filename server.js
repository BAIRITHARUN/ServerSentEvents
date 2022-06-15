const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/status', (request, response) => response.json({ clients: clients.length }));

const PORT = process.env.PORT || 3001;

let clients = [];
let facts = [];

let sendEvents;

let starttimeout;

let count = 0;

let clearTimers = false;

app.listen(PORT, () => {
    console.log(`Facts Events service listening at http://localhost:${PORT}`)
})


const writeEvent = (res, sseId, data) => {
    res.write(`id: ${sseId}\n`);
    res.write(`data: ${data}\n\n`);
  };
  


function eventsHandler(request, response, next) {
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    response.writeHead(200, headers);

    const data = `data: ${JSON.stringify(facts)}\n\n`;

    // console.log("Data", data)

    response.write(data);

    const clientId = Date.now();

    const newClient = {
        id: clientId,
        response
    };

    clients.push(newClient);


    if(!clearTimers){
        sendEvents =  setInterval(() => {
            let result = {
                time: Date.now(),
                count: count.toString()
            }
            writeEvent(response, clientId, JSON.stringify(result))
        }, 1000)
    }
  

    request.on('close', (clientId) => {
        console.log(`${clientId} Connection closed`);
        clients = clients.filter(client => client.id !== clientId);
    });

    
}

app.get('/events', eventsHandler);


// ...

function sendEventsToAll(newFact) {
    clients.forEach(client => client.response.write(`data: ${JSON.stringify(newFact)}\n\n`))
}

async function addFact(request, respsonse, next) {
    const newFact = request.body;
    facts.push(newFact);
    respsonse.json(newFact)
    return sendEventsToAll(newFact);
}

app.post('/fact', addFact);


startincreament()

function startincreament () {
    starttimeout = setInterval(()=> {
        if(count == 0) {
            count = 10;
        } else {
            count = 0
        }
        console.log(count)
    }, 5000)
}

function removeIntervals () {
    clearInterval(starttimeout)
    clearInterval(sendEvents)
    clearTimers = true
    console.log("cleared")
}

app.get('/removeIntervals', removeIntervals);