const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Nexmo = require('nexmo');
const socketio = require('socket.io');

const nexmo = new Nexmo({
  apiKey: '3797d477',
  apiSecret: 'nXuD9v2nzWm4t5iT',
});

const from = '19564482986';
const to = '17814394222';
const text = 'Hello from Vonage';

nexmo.message.sendSms(from, to, text);

// inti app
const app = express();


//template engine setup
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

//Public
app.use(express.static(__dirname + '/public'));

//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//Index route
app.get('/', (req, res) => {
  res.render('index');
});

// Catch form submit
app.post('/', (req, res) => {
  // res.send(req.body);
  console.log(req.body);
  const { number, text} = req.body;

  nexmo.message.sendSms(
    '19564482986', number, text, { type: 'unicode' },
    (err, responseData) => {
      if (err) {
        console.log(err);
      } else {
        const { messages } = responseData;
        const { ['message-id']: id, ['to']: number, ['error-text']: error } = messages[0];
        console.dir(responseData);
        // Get data from response
        const data = {
          id,
          number,
          error
        };
        // emmit to the client
        io.emit('smsStatus', data);
      }
    }
  );
});

//Define a port
const port = 3000;
//start server
const server = app.listen(port, () => console.log(`server started on port ${port}`));
//connect to socket.io
const io = socketio(server);
io.on('connection', (socket) => {
  console.log('Connected');
  io.on('disconnect', () => {
    console.log('Disconnected');
  })
});
