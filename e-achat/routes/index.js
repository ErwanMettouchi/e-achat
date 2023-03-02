var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Utilisateur = require('../database/models/utilisateurs');
const Categorie = require('../database/models/categories');
const Produits = require('../database/models/produits');
const Marques = require('../database/models/marques');
const SousCategorie = require('../database/models/sousCategories');


/* GET home page. */
router.get('/', async (req, res) => {
  const allCategories = await Categorie.find();
  const allMarques = await Marques.find();

  if (req.session.user === undefined) {
    req.session.user = [];
  }
  if(req.session.cart === undefined) {
    req.session.cart = [];
  }
  console.log(req.session.user)
  res.render('index', { categorie: allCategories, marques: allMarques, user: req.session.user, panier : req.session.cart });


});

// Inscription

router.get('/inscription', (req, res) => {
  if (req.session.user.length === 0) {
    res.render('inscription', { user: req.session.user, panier : req.session.cart })
  } else {
    res.redirect('/');
  }
})

router.post('/sign-up', async (req, res) => {

  let erreurInscription = [];
  let body = req.body;
  let motDePasse = body.motDePasse;
  let salt = await bcrypt.genSalt(10);
  let hashedPassword = await bcrypt.hash(motDePasse, salt);

  let mailAlreadyExists = await Utilisateur.findOne({
    email: body.email
  });

  let phoneAlreadyExists = await Utilisateur.findOne({ telephone: body.telephone });

  console.log(mailAlreadyExists);
  if (mailAlreadyExists != null) {
    erreurInscription.push('L\'email utilisé existe déjà, veuillez en entrer un autre');
    // console.log(erreurInscription);
  }

  if (phoneAlreadyExists != null) {
    erreurInscription.push('Le telephone utilisé existe déjà, veuillez en entrer un autre');
  }

  if (body.prenom === "" || body.email === "" || body.motDePasse === "" || body.telephone === "" || body.adresse === "") {
    erreurInscription.push('Un ou plusieurs champs sont vides, veuillez les remplir')
    console.log("ERREURS : ", erreurInscription);
  }


  if (body.motDePasse != body.motDePasseConfirmation) {
    erreurInscription.push('Les mots de passe ne correspondent pas');
  }

  if (erreurInscription.length === 0) {
    let newUser = new Utilisateur({
      prenom: body.prenom,
      nom: body.nom,
      email: body.email,
      motDePasse: hashedPassword,
      telephone: body.telephone,
      isAdmin: false,
      adresse: body.adresse
    })
    let userSignedUp = await newUser.save();

    req.session.user.push({
      id: userSignedUp.id
    })
    return res.redirect('/');
  } else {
    return res.render('inscription', { erreurs: erreurInscription, body, user: req.session.user, panier : req.session.cart });
  }

})


// Authentification

router.get('/connexion', (req, res) => {
  if (req.session.user.length === 0) {
    res.render('connexion', { user: req.session.user, panier : req.session.cart });
  } else {
    res.redirect('/');
  }
})

router.post('/sign-in', async (req, res) => {
  let erreurAuthentification = [];
  let email = req.body.email;
  let mdp = req.body.motDePasse;
  let validPassword = false;


  let user = await Utilisateur.findOne({
    email: email,
  })

  if (!user) {
    erreurAuthentification.push('Email et/ou mot de passe invalide(s)');
  } else {
    validPassword = await bcrypt.compare(mdp, user.motDePasse);


    if (mdp === "" || email === "") {
      erreurAuthentification.push('Un ou plusieurs champs sont vides, veuillez les remplir')
    }
    if (!validPassword) {
      erreurAuthentification.push('Email et/ou mot de passe invalide(s)');
    }
    if (erreurAuthentification.length === 0) {
      req.session.user.push({
        id: user.id,
      })
      res.redirect('/');
    }
  }
  res.render('connexion', { user: req.session.user, erreurs: erreurAuthentification, panier : req.session.cart });


})

router.get('/search', async (req, res) => {
  const searchResult = req.query.search;
  const products = await Produits.find({$text : { $search : searchResult }}).exec();

  res.render('search', { produits : products, user: req.session.user, search : searchResult, panier : req.session.cart });
})

router.get('/brand/:name', async (req, res) => {
  const name = req.params.name;
  let marque = await Marques.findOne({ nom : name });

  console.log("MARQUE : ", marque)
  let products = await Produits.find({ marque : marque.id }).populate('marque').exec();

  console.log("PRODUITS : ", products);

  res.render('brand', { produits: products, user: req.session.user, name, panier : req.session.cart });
})

// Compte de l'utilisateur

router.get('/account', async (req, res) => {

  if (req.session.user.length === 0 || req.session.user === undefined) {
    return res.redirect('/');
  } else {
    let user = await Utilisateur.findById(req.session.user[0].id);
    res.render('account', { user: user, panier : req.session.cart });
  }
})

router.get('/categories/:name', async (req, res) => {
  const name = req.params.name;
  const categorie = await Categorie.findOne({ nom_url: name });
  if (!categorie) {
    return res.status(404).render('404' , {user: req.session.user, panier : req.session.cart})
  }

  const sousCategorie = await SousCategorie.find({ categorie: categorie.id }).populate('categorie').exec();
  // console.log('Sous catégorie' + sousCategorie);

  const products = await Produits.find({sousCategorie : {$in : sousCategorie}})
                                 .populate({ 
                                  path : 'sousCategorie', 
                                  populate : { 
                                    path : 'categorie'
                                  }
                                  })
                                 .exec();
  console.log("PRODUITS : ", products);
  // console.log("marque : ", marque);

  res.render('categories', { user: req.session.user, produits: products, name : name, panier : req.session.cart});
})

router.get('/sub-categories/:name', async (req, res) => {
  let name = req.params.name;

  let subcategorie = await SousCategorie.findOne({ nom_url: name });
  let products = await Produits.find({ sousCategorie: subcategorie.id }).populate('sousCategorie').exec();
  // console.log("Produits ", products);
  return res.render('sub-category', { produits: products, user: req.session.user, name, panier : req.session.cart });
})

router.get('/account', (req, res) => {
  console.log(req.session.user)
  if (req.session.user.length === 0) {
    res.status(401).redirect('/')
  } else {
    res.status(200).render('account', { user: req.session.user, panier : req.session.cart });
  }
})

router.get('/produit', async (req, res) => {
  const id = req.query.id;
  const produit = await Produits.findById(id);

  console.log(produit);
  
  if (!produit) {
    return res.status(404).render('404', {user: req.session.user, panier : req.session.cart})
  }else {
  res.render('produit', { produit: produit, user: req.session.user, panier : req.session.cart})
  }
})

router.get('/logout', (req, res) => {
  req.session.user = [];
  res.redirect('/');
})


router.get('/admin', (req, res) => {
  req.session.user = [];
  if (req.session.admin === undefined) {
    req.session.admin = [];
  }
  res.render("connexion-admin")
})

router.post('/admin-connexion', async (req, res) => {

  req.session.user = [];

  let erreurAuthentificationAdmin = [];
  const admin = await Utilisateur.findOne({
    email: req.body.email,
    isAdmin: true,
  });

  console.log(admin)

  if (!admin) {
    erreurAuthentificationAdmin.push('Une erreur est survenue, veuillez réessayer');
    return res.status(401).render('connexion-admin', { erreurs: erreurAuthentificationAdmin, panier : req.session.cart })
  }

  let validPassword = await bcrypt.compare(req.body.motDePasse, admin.motDePasse);

  if (validPassword) {
    req.session.admin.push({
      id: admin.id,
    })
    return res.status(200).redirect('/admin/products');
  } else {
    erreurAuthentificationAdmin.push('Une erreur est survenue, veuillez réessayer');
    return res.status(401).render('connexion-admin', { erreurs: erreurAuthentificationAdmin, panier : req.session.cart })
  }
})

router.get('/admin/products', async (req, res) => {
  if (req.session.admin === []) {
    return res.status(401).redirect('/admin')
  }
  const marque = await Marques.find()
  const sousCategorie = await SousCategorie.find()

  res.render('admin-products', { marque, sousCategorie, panier : req.session.cart });
})

router.post('/insert-product', async (req, res) => {
  const marque = await Marques.find()
  const sousCategorie = await SousCategorie.find()

  const newProduct = new Produits({
    nom: req.body.nomProduit,
    description: req.body.description,
    prix: req.body.prix,
    stock: req.body.stock,
    sousCategorie: req.body.souscategorie,
    marque: req.body.marque,
    image: req.body.image
  })
  await newProduct.save();
  res.render('admin-products', { marque, sousCategorie, panier : req.session.cart });
})

// Envoie une erreur 404 si la page n'existe pas
router.get('*', (req, res) => {
  return res.status(404).render('404', {user : req.session.user, panier : req.session.cart});
});

module.exports = router;