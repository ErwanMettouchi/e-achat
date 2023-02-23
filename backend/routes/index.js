var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const Utilisateur = require('../database/models/utilisateurs');
const Categorie = require('../database/models/categories');
const Produits = require('../database/models/produits');


/* GET home page. */
router.get('/', async (req, res) => {
  const allCategories = await Categorie.find()

  res.render('index', { categorie : allCategories });

});

router.get('/inscription', (req, res) => {
  res.render('inscription')
})

router.post('/sign-up', async (req, res) => {

  let erreurInscription = [];
  let result = false;
  let userSignedUp = null;
  let body = req.body;
  let motDePasse = body.motDePasse;
  let salt = await bcrypt.genSalt(10);
  let hashedPassword = await bcrypt.hash(motDePasse, salt);

  let mailAlreadyExists = await Utilisateur.findOne({
    email: body.email
  })

  console.log(mailAlreadyExists);
  if (mailAlreadyExists != null) {
    erreurInscription.length = 0;
    erreurInscription.push('L\'email utilisé existe déjà, veuillez en entrer un autre');
    console.log(erreurInscription);
  }

  if(body.prenom === "" || body.email === "" || body.motDePasse === "" || body.telephone === "" || body.adresse === "") {
    erreurInscription.length = 0;
    erreurInscription.push('Un ou plusieurs champs sont vides, veuillez les remplir')
    console.log(erreurInscription);
  }

  if(erreurInscription.length === 0) {
    let newUser = new Utilisateur({
      prenom : body.prenom,
      nom : body.nom,
      email : body.email,
      motDePasse : hashedPassword,
      telephone : body.telephone,
      role : "user",
      adresse : body.adresse
    })
    userSignedUp = await newUser.save();

  }

  console.log(req.session.user)

  if(userSignedUp) {
    result = true
    req.session.user.push({
      id: userSignedUp.id,
      prenom: userSignedUp.prenom
    })
  }  

  if(result) {
    res.redirect('/')
  }else {
    res.render('inscription', {erreurs : erreurInscription, body})
  }
})


router.get('/search', async (req, res) => {
  const search = req.query.search;
  const products = await Produits.find({nom : search});

    res.render('search', { produits : products });
})

router.get('/brand/:name', async(req, res) => {
  const name = req.params.name;


})
module.exports = router;