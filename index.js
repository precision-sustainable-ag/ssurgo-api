const dotenv = require('dotenv');

dotenv.config();

const ip = require('ip');

console.log('IP:', ip.address()); // if needed for /etc/postgresql/11/main/pg_hba.conf

process.on('uncaughtException', (err) => {
  console.error(err);
  console.log('Node NOT Exiting...');
});

const express = require('express'); // simplifies http server development
const open = require('open');

const bodyParser = require('body-parser'); // make form data available in req.body
const cors = require('cors'); // allow cross-origin requests
const path = require('path'); // to get the current path

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use((err, req, res, next) => { // next is unused but required??!
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const ssurgo = require('./ssurgo');

app.get('/', (req, res) => {
  console.log(req.query);
  ssurgo.ssurgo(req, res);
});

app.all('/polygon', ssurgo.polygon);
app.all('/mapunits', ssurgo.mapunits);
app.all('/vegspec', ssurgo.vegspec);

app.use(express.static(path.join(__dirname, 'public'))); // make the public folder available

app.use(express.static(`${__dirname}/static`, { dotfiles: 'allow' })); // from Ayaan

app.listen(80, () => {
  if (process.argv.includes('dev')) {
    open('http://localhost');
  }
});

console.log('Running!');
