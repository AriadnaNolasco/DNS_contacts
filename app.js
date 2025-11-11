require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { init } = require('./models');
const contactRoutes = require('./routes/contacts');
const expressLayouts = require('express-ejs-layouts');

const app = express();
app.use(expressLayouts);
app.set('layout', 'layout'); // usa views/layout.ejs

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', contactRoutes);

const PORT = process.env.PORT || 3000;
init().then(() => {
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}).catch(err => {
  console.error('Failed to init DB', err);
});
