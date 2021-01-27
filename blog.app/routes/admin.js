const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin")

router.get("/", eAdmin, (req, res) => {
    res.render("admin/index")
})

 router.get('/categorias', eAdmin, (req, res) => {
     Categoria.find().lean().sort({data: 'desc'}).then((categorias) =>{
          res.render("admin/categorias", {categorias: categorias})
     }).catch((err) => {
         req.flash("error_msg", "Houve um erro ao listar as categorias!")
         res.redirect("/admin")
     })
     
 })
   
 router.get('/categorias/add', eAdmin, (req, res) => {
     res.render("admin/addcategorias")
 })

 router.post("/categorias/nova", eAdmin, (req, res) => {
    var erros = []

    if ( !req.body.nome || typeof req.body.nome == undefined || req.body.nome == null ){
        erros.push({texto: "Nome inválido" })
    }
    
    if ( !req.body.slug || typeof req.body.slug == undefined || req.body.slug == null ){
        erros.push({texto: "Slug inválido!" })
    }
        if( req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria é muito pequeno!"})
    }
    
    if(erros.length > 0) {
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criado com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!")
         res.redirect("/admin")
        })
    }
    
})



router.get('/categorias/edit/:id', eAdmin, (req, res) => {
   
   
    Categoria.findOne({_id:req.params.id }).lean().then((categoria) => {
        res.render("admin/editcategorias", {categoria: categoria})
     
    }).catch((err) => {
       
        req.flash("error_msg" , "Categoria não existe!")
        res.redirect("/admin/categorias")
    })
   
})


router.post('/categorias/edit/', eAdmin, (req, res) => {
    
    var erros = []

    if ( !req.body.nome || typeof req.body.nome == undefined || req.body.nome == null ){
        erros.push({texto: "Nome inválido" })
        
    }
    
    if ( !req.body.slug || typeof req.body.slug == undefined || req.body.slug == null ){
        erros.push({texto: "Slug inválido!" })
    }
        if( req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria é muito pequeno!"})
    }
    
    if(erros.length > 0) {
       
        res.render("admin/editcategorias", {erros: erros})
           
          
        
    }else{
     
    Categoria.findOne({_id: req.body.id}).lean().then((categoria) => {
   
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
        
       categoria.save().then(() => {
          req.flash("success_msg", "Categoria editada com sucesso!")
          res.redirect("/admin/categorias")

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao salvar a edição da categoria")
        res.redirect("admin/categorias")
    })

    }).catch((err) => {
        req.flash("error_msg", "Impossivel Editar categoria")
        res.render("admin/editcategorias")
    })
}
})

router.post("/categorias/deletar", eAdmin, (req,res)=>{
    Categoria.deleteOne({_id: req.body.id}).then(()=>{
      req.flash("success_msg","Categoria deletada com sucesso!!!")
      res.redirect("/admin/categorias")
    }).catch((err)=>{
      req.flash("error_msg","Houve um erro ao deletar a categoria"+err)
      res.redirect("/admin/categorias")
    })
})


router.get("/postagens", eAdmin, (req, res) => {
        Postagem.find().populate("categoria").sort({dati: "desc"}).lean().then((postagens) => {
            res.render("admin/postagens", {postagens:postagens})
            
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as postagens ")
            res.redirect("/admin")
        })
  
  
  
  
  
    
})

router.get("/postagens/add", eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um problema ao carregar o formulário")
        res.redirect("/admin")
    })
    
})

router.post('/postagens/nova', eAdmin, (req, res) => {
      var erros = []

      if(req.body.categoria == "0"){
            erros.push({texto:"Categoria inválida, Registre uma categoria!"})

      }
      if (erros.length > 0){
          res.render("admin/addpostagem", {erros: erros})
      }else{
          const novaPostagem = {
              titulo: req.body.titulo,
              descricao: req.body.descricao,
              conteudo: req.body.conteudo,
              categoria: req.body.categoria,
              slug: req.body.slug 

          }

          new Postagem(novaPostagem).save().then(() => {
              req.flash("success_msg", "Postagem salva com sucesso!")
              res.redirect("/admin/postagens")
          }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem ")
            res.redirect("/admin/postagens")
          })

         
      }

     
})

 router.get("/postagens/edit/:id", eAdmin, (req, res) =>{
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("admin/postagens")
        })
    }).catch((err) => {
        req.flash("error_msg" , "Houve um erro ao carregar o formulario de edição")
        res.redirect("admin/postagens")
    }) 
    
 })



 router.post("/postagem/edit" , eAdmin, (req, res) => {
 

    Postagem.findOne({_id: req.body.id}).then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso ")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Erro interno!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("Houve um erro ao salvar edição!")
            res.redirect("/admin/postagens")
        })
        
    })
 })


router.get("/postagens/deletar/:id", eAdmin, (req, res) => {
    Postagem.remove({_id: req.params.id}).then(() =>{
        req.flash("success_msg", "Postagem deletada com sucesso")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/admin/postagens")
    })
})
 










module.exports = router