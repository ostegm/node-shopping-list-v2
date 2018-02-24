
const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const {ShoppingList, Recipes} = require('./models');

const jsonParser = bodyParser.json();
const app = express();

// log the http layer
// app.use(morgan('common'));
morgan.token('full-body', function (req, res) { return JSON.stringify(req.body)})
app.use(morgan(':date[iso] :method :url :full-body'));

// we're going to add some items to ShoppingList
// so there's some data to look at
ShoppingList.create('beans', 2);
ShoppingList.create('tomatoes', 3);
ShoppingList.create('peppers', 4);

// adding some recipes to `Recipes` so there's something
// to retrieve.
Recipes.create(
  'boiled white rice', ['1 cup white rice', '2 cups water', 'pinch of salt']);
Recipes.create(
  'milkshake', ['2 tbsp cocoa', '2 cups vanilla ice cream', '1 cup milk']);

// when the root of this router is called with GET, return
// all current ShoppingList items
app.get('/shopping-list', (req, res) => {
  res.json(ShoppingList.get());
});

const checkRequiredFields = (req, res, requiredFields) => {
  let missing = []
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      missing.push(field)
    }
  }
  return missing
}

app.post('/shopping-list', jsonParser, (req, res) => {
  // ensure `name` and `budget` are in request body
  const missingFields = checkRequiredFields(req, res,['name', 'budget']);
  if ( missingFields.length > 0 ) {
    const message = `Missing \`${missingFields.length}\` fields in request body`
    console.error(message);
    return res.status(400).send(message);
  }
  const item = ShoppingList.create(req.body.name, req.body.budget);
  res.status(201).json(item);
});


app.get('/recipes', (req, res) => {
  res.json(Recipes.get());
})

app.post('/recipes', jsonParser, (req, res) => {
  const missingFields = checkRequiredFields(req, res,['name', 'ingredients']);
  if ( missingFields.length > 0 ) {
    const message = `Missing \`${missingFields.length}\` fields in request body`
    console.error(message);
    return res.status(400).send(message);
  }

  const recipe = Recipes.create(req.body.name, req.body.ingredients);
  res.status(201).json(recipe);
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});
