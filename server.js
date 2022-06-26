require('dotenv').config()
const express=require('express');
const app=express();
const ejs=require('ejs');
const expressLayout=require('express-ejs-layouts');
const path=require('path');
const mongoose=require('mongoose')
const session=require('express-session')
const flash=require('express-flash')
const MongoDbStore=require('connect-mongo')
const passport=require('passport')    


const PORT=process.env.PORT || 3000;

//Database Connection
const url='mongodb://localhost/pizza';
mongoose.connect(url,{useNewUrlParser: true, useUnifiedTopology: true});
const connection=mongoose.connection;
connection.once('open',()=>{
    console.log("Database connected");
})


//Session store
let mongoStore=MongoDbStore.create({
    mongoUrl:'mongodb://localhost/pizza',
    collectionName: 'session'
})
//Session
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: {maxAge: 1000*60*60*24}
}))
//Passport config
const passportInit=require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
//Assets
app.use(express.static('public'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())


//Global Middleware
app.use((req,res,next)=>{
    res.locals.session=req.session
    res.locals.user=req.user
    next()
})
//set template engine
app.use(expressLayout)
app.set('views',path.join(__dirname,'/resources/views'));
app.set('view engine','ejs');

require('./routes/web')(app)

app.listen(PORT,()=>{
    console.log(`Server started at port ${PORT}`);
});





