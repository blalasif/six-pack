const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const app = express();
const bcrypt = require('bcrypt');
// setting the engine 

mongoose.connect('mongodb+srv://bilaljee684:Asdf1234@record.zssorlb.mongodb.net/')
    .then(() => console.log("Database Connected")).catch((error) => console.log(error))

app.set("view engine", "ejs")

const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies
    if (token) {
        const decoded = jwt.verify(token, "djsfajadl")
        req.user = await User.findById(decoded._id)
        next();
    }
    else {
        res.redirect('/login')
    }



}

app.use(express.static(path.join(path.resolve(), "public")))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())



//message Schema

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String

})

const User = mongoose.model("User", userSchema)


app.get('/', isAuthenticated, (req, res) => {
    console.log(req.user);
    res.render("logout", { email: req.user.email })
})


app.get('/register', (req, res) => {
    res.render("register")
})


//Register api
app.post('/register', async (req, res) => {

    const { name, email, password } = req.body
    let user = await User.findOne({ email })
    if (user) {
        return res.redirect("/login");
    }

    const hashPassword = await bcrypt.hash(password, 10)


    user = await User.create({
        email,
        password: hashPassword,
        name,

    })

    const token = jwt.sign({ _id: user._id }, "djsfajadl")

    res.cookie("token", token, {
        httpOnly: true
    })
    res.redirect("/login")
})
app.get('/logout', (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    })
    res.redirect("/")
})


//login api

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    let user = await User.findOne({ email })
    if (!user) {
        return res.redirect('/register')
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.render('login', { email, message: "Incorrect Password" })
    }

    //token code
    const token = jwt.sign({ _id: user._id }, "djsfajadl")

    res.cookie("token", token, {
        httpOnly: true
    })
    res.redirect("/")
})
app.get('/logout', (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    })
    res.redirect("/")
})

































app.listen(2000, (req, res) => {
    console.log('Server Is Running');
})