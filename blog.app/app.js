//carregando modulos

const express = require('express')
const handlebars = require('express-handlebars')
const bodyParse = require("body-parser")
const app = express()
const admin = require("./routes/admin")
const path = require("path")
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require("./routes/Usuario")
const passport = require("passport")
require("./config/auth")(passport)
const db = require("./config/db")
//configurações
//session
    app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
    }) )  
    app.use(passport.initialize())
    app.use(passport.session()) 
    app.use(flash())
    //middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null;
        next()
    })
//body-parser
    app.use(bodyParse.urlencoded({ extended: false }))
    app.use(bodyParse.json())
    //handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}));
    app.set('view engine', '.handlebars');
    //mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect(db.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true,  
} ).then(() =>{
             console.log("Conectado ao mongo")
    }).catch((err) =>{
        console.log("Erro ao se conectar" +err)
    })
    // public
    app.use(express.static(path.join(__dirname, "public")))


//rotas
app.get('/',  (req, res) => {
    Postagem.find().populate("categoria").sort({data: "desc"}).lean().then((postagens) =>{
        res.render("index", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/404")
    })
   
})


app.get("/postagem/:slug", (req, res) => {
     Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
         if(postagem) {
             res.render("postagem/index", { postagem: postagem})
         }else{
             req.flash("error_msg", "Esta postagem não existe")
             res.redirect("/")
         }
     }).catch((err) => {
         res.flash("error_msg", "Houve um erro interno!")
         res.redirect("/")
     })
})

app.get("/categorias", (req, res) => {
    Categoria.find().lean().then((categorias) => {
           res.render("categorias/index", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao lstar as categorias")
        res.redirect("/")
    })
})

app.get("/categorias/:slug", (req, res ) => {
    Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
        if(categoria) {

            Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                 
                res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao listar os posts!")
                res.redirect("/")
            })
        }else{
            req.flash("error_msg", "Essa categoria não existe")
            res.redirect("/")
        }
    }).catch((err) => {
        res.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria!")
        res.redirect("/")
    })
})





app.get("/404", (req, res) => {
    res.send('Erro 404!')
})



 app.get('/posts', (req, res) => {
     res.send("Pagina de Posts")
 })    

app.use('/admin', admin)
app.use("/usuarios", usuarios)
//outros
const port =  process.env.PORT || 3000
app.listen(port, () => {
console.log("Servidor rodando...", port)
} )