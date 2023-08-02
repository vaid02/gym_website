const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require("path");
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/gymdbs', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(()=>{
    console.log(`connetion successful`)
}).catch((e)=>{
    console.log(`connection failed ${e}`)
}) ;

// Define a User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  email :  {type:String , unique:true},
  phone:{type: Number}
});

const User = mongoose.model('User', userSchema);


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(
  session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true,
  })
);

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/home.html');
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,phone,
      password: hashedPassword,
    });
    await newUser.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }

  const insert =async ()=>{
    const db=await User();
    const result =await db.insert(
      {username:'vaid'}
    )
    console.log(result);
    };insert();
  
  return ('/dashboard');
});



app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.redirect('/');
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.redirect('/');
      return;
    }

    // Store user data in session
    req.session.user = user;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    res.redirect('/');
    return;
  }

  res.sendFile(__dirname + '/public/home.html');
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect('/');
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});