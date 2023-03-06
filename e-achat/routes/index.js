var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Utilisateur = require('../database/models/utilisateurs');
const Categorie = require('../database/models/categories');
const Produits = require('../database/models/produits');
const Marques = require('../database/models/marques');
const Commentaires = require('../database/models/commentaires');
const Panier = require('../database/models/paniers')
const Commande = require('../database/models/commandes')
const stripe = require('stripe')('sk_test_51Mi7CWB4WDlWyEMwXbFuxxazynUV9JJKREchAEg53DPMjjONrD3Y5O1RK9OF8BgwTLLtX823Gu4jvde7F2uqbBv600gQu4a4Iu');



const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'erwanmettouchi@gmail.com',
    pass: 'rvljqcqtufyqyeok',
  },
});

/* ------------------------------------------------ PAGE D'ACCUEIL -----------------------------------*/

router.get('/', async (req, res) => {
  const allCategories = await Categorie.find();
  const allMarques = await Marques.find();

  if (req.session.user === undefined) {
    req.session.user = [];
  }
  if (req.session.cart === undefined) {
    req.session.cart = [];
  }
  console.log(req.session.user)
  res.render('index', { categorie: allCategories, marques: allMarques, user: req.session.user, panier: req.session.cart });
});

/* ------------------------------------------------ PAGE D'INSCRIPTION -----------------------------------*/


router.get('/signup', (req, res) => {
  if (req.session.user === undefined) {
    req.session.user = [];
  }
  if (req.session.cart === undefined) {
    req.session.cart = [];
  }

  if (req.session.user.length === 0) {
    res.render('inscription', { user: req.session.user, panier: req.session.cart })
  } else {
    res.redirect('/');
  }
})

/* ------------------------------------------------ INSCRIPTION D'UN UTILISATEUR DANS LA BASE DE DONNÉES -----------------------------------*/

router.post('/signup', async (req, res) => {
  if (req.session.user === undefined) {
    req.session.user = [];
  }

  if (req.session.cart === undefined) {
    req.session.cart = [];
  }
  let erreurInscription = [];
  const { nom, prenom, email, motDePasse, motDePasseConfirmation, telephone, adresse } = req.body;
  let body = req.body;
  let salt = await bcrypt.genSalt(10);
  let hashedPassword = await bcrypt.hash(motDePasse, salt);
  const regex = /[<\/>]/g;
  const regexMdp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,20}$/
  const regexPhone = /^0[1-9](\d{2}){4}$/;
  const regexMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let mailAlreadyExists = await Utilisateur.findOne({email});

  let phoneAlreadyExists = await Utilisateur.findOne({ telephone });

  // Tous les if pour gérer les erreurs à l'inscription de l'utilisateur
  if (mailAlreadyExists != null) {
      erreurInscription.push('L\'email utilisé existe déjà, veuillez en entrer un autre');
  } else if (phoneAlreadyExists != null) {
      erreurInscription.push('Le telephone utilisé existe déjà, veuillez en entrer un autre');
  } else if (prenom.trim() === "" || body.email.trim() === "" || body.motDePasse.trim() === "" || body.telephone.trim() === "" || body.adresse.trim() === "") {
      erreurInscription.push('Un ou plusieurs champs sont vide');
  } else if (prenom.search(regex) !== -1 || body.nom.search(regex) !== -1 || body.email.search(regex) !== -1 || body.telephone.search(regex) !== -1 || body.adresse.search(regex) !== -1) {
      erreurInscription.push('Les caractères spéciaux ne sont pas autorisés');
  } else if (regexMdp.test(motDePasse) === false) {
      erreurInscription.push('Le mot de passe doit contenir entre 8 et 20 caractères, dont 1 majuscule, 1 minuscule et 1 chiffre');
  } else if (regexPhone.test(telephone) === false) {
      erreurInscription.push('Le numéro de téléphone n\'est pas valide');
  } else if (regexMail.test(email) === false) {
      erreurInscription.push('Le mail n\'est pas valide');
  } else if(motDePasse !== motDePasseConfirmation) {
      erreurInscription.push('Les mots de passe ne sont pas identiques');
  }
  // S'il n'y a pas d'erreur, on ajoute le nouveau utilisateur à la base de données
  else {
    const newUser = new Utilisateur({
      prenom : prenom,
      nom : nom,
      email : email,
      motDePasse: hashedPassword,
      telephone : telephone,
      adresse : adresse,
    })
    const userSaved = await newUser.save();
    const mailOptions = {
      from: 'erwanmettouchi@gmail.com',
      to: userSaved.email,
      subject: 'Inscription réussie',
      text: `Bienvenue ${userSaved.prenom} ${userSaved.nom} ! Votre inscription au site E-Achat été effectuée avec succès.`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('E-mail envoyé : ' + info.response);
      }
    });
    req.session.user.push({
      id: userSaved.id,
    })
    return res.redirect('/');
  }
  res.render('inscription', { erreurs: erreurInscription, nom, prenom, email, adresse, telephone, user: req.session.user, panier: req.session.cart });
  });



/* ------------------------------------------------ PAGE DE CONNEXION -----------------------------------*/

router.get('/login', (req, res) => {
  if (req.session.user === undefined) {
    req.session.user = [];
  }

  if (req.session.cart === undefined) {
    req.session.cart = [];
  }

  if (req.session.user.length === 0) {
    res.render('connexion', { user: req.session.user, panier: req.session.cart });
  } else {
    res.redirect('/');
  }
})

/* ------------------------------------------------ AUTHENTIFICATION DE L'UTILISATEUR -----------------------------------*/

router.post('/login', async (req, res) => {
  let erreurAuthentification = [];
  let email = req.body.email;
  let mdp = req.body.motDePasse;
  let validPassword = false;


  let user = await Utilisateur.findOne({
    email: email,
  })

  if (!mdp || !email) {
    erreurAuthentification.push('Une erreur est survenue, veuillez réessayer');
  }

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
  res.render('connexion', { user: req.session.user, erreurs: erreurAuthentification, panier: req.session.cart });
})

/* ------------------------------------------------ PAGE RECHERCHE DE PRODUIT -----------------------------------*/


router.get('/search', async (req, res) => {
  if (req.session.user === undefined) {
    req.session.user = [];
  }
  const searchResult = req.query.query;
  const products = await Produits.find({ $text: { $search: searchResult } }).exec();

  res.render('search', { produits: products, user: req.session.user, search: searchResult, panier: req.session.cart });
})


/* ------------------------------------------------ RÉCUPÉRATION DU PRODUIT GRÂCE À SON ID -----------------------------------*/

router.get('/produit', async (req, res) => {
  if (req.session.user === undefined) {
    req.session.user = [];
  }

  const id = req.query.id;
  const userComment = await Commentaires.find({ produit: id }).populate('utilisateur').exec();
  console.log("COMMENTAIRE : ", userComment);

  const produit = await Produits.findById(id);

  console.log(produit);

  res.render('produit', { produit: produit, user: req.session.user, panier: req.session.cart, commentaire: userComment })
})

/* ------------------------------------------------ Déconnexion -----------------------------------*/


router.get('/logout', (req, res) => {
  if (req.session.user === undefined) {
    req.session.user = [];
  }
  req.session.user = [];
  res.redirect('/');
})

/* ------------------------------------------------ AJOUT DE PRODUITS DANS LE PANIER -----------------------------------*/

router.post('/add-to-cart', async (req, res) => {
  const id = req.body.produit;
  let produit = await Produits.findById(id);

  let alreadyExists = false;


  for (let i = 0; i < req.session.cart.length; i++) {
    if (req.session.cart[i].id === id) {
      req.session.cart[i].quantite += 1;
      alreadyExists = true;
    }
  }


  if (!alreadyExists) {
    req.session.cart.push({
      id: id,
      prix: produit.prix,
      quantite: 1,
      nom: produit.nom,
      image: produit.image,
    });
  }

  res.redirect('/produit?id=' + id);
})

/* ------------------------------------------------ PAGE POUR VOIR LE PANIER -----------------------------------*/

router.get('/cart', async (req, res) => {
  if (req.session.user === undefined) {
    req.session.user = [];
  }
  if (req.session.cart === undefined) {
    req.session.cart = [];
  }
  res.render('cart', { user: req.session.user, panier: req.session.cart })
})


/* ------------------------------------------------ SUPPRESSION D'UN PRODUIT DU PANIER ----------------------------*/

router.get('/delete-product', (req, res) => {
  if (req.session.user === undefined) {
    req.session.user = [];
  }
  const position = req.query.position;
  req.session.cart.splice(position, 1)
  res.redirect('/cart');
})

/* ------------------------------------------------ ACHAT DU PANIER GRÂCE À STRIPE ----------------------------*/

router.get('/checkout', async (req, res) => {
  if (req.session.user === undefined) {
    req.session.user = [];
  }
  if (req.session.cart === undefined) {
    req.session.cart = [];
  }

  if (req.session.cart.length === 0) {
    res.redirect('/')
  }else  if (req.session.user.length === 0) {
    res.redirect('/login');
  }else if(req.session.user.length === 0 && req.session.cart.length === 0 ){
    res.redirect('/')
  } else {
    let stripeItems = [];
    for (let i = 0; i < req.session.cart.length; i++) {
      stripeItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: req.session.cart[i].nom,
          },
          unit_amount: req.session.cart[i].prix * 100,
        },
        quantity: req.session.cart[i].quantite,
      });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: stripeItems,
      mode: "payment",
      success_url: "http://localhost:3000/confirm",
      cancel_url: "http://localhost:3000/",
    });
    res.redirect(303, session.url);
  }
})

/* ----------------------------------------------- CONFIRMATION DE L'ACHAT ------------------------------------------*/


router.get('/confirm', async (req, res) => {
  const user = await Utilisateur.findById(req.session.user[0].id);

  if (req.session.user === undefined) {
    req.session.user = [];
  }
  else if (req.session.cart === undefined) {
    req.session.cart = [];
  }
  else if (req.session.cart.length === 0 || req.session.user.length === 0) {
    res.redirect('/');
  } 
  else {
    let quantite = 0;
    let prixTotal = 0
    for (prod of req.session.cart) {
      quantite += prod.quantite;
      prixTotal += prod.prix * prod.quantite;
    }
    const newCart = new Panier({
      prixTotal: prixTotal,
      quantiteProduits: quantite,
      produits: req.session.cart,
      utilisateur: req.session.user[0].id,
    })
    const cartCreated = await newCart.save();
    const newCommande = new Commande({
      panier: cartCreated.id
    })
    await newCommande.save();
    const mailOptions = {
      from: 'erwanmettouchi@gmail.com',
      to: user.email,
      subject: 'Commande validée!',
      text: `Bonjour ${user.prenom} ${user.nom}, votre commande de ${newCart.prixTotal}€ a bien été validée. Votre numéro de commande est : ${newCommande.numero}`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('E-mail envoyé : ' + info.response);
      }
    });
    req.session.cart = [];
    res.redirect('/')
  }
})

/* ----------------------------------------------- AJOUT DE COMMENTAIRES ------------------------------------------*/

router.post('/add-comment', async (req, res) => {
  const id = req.body.produit;
  const comment = req.body.commentaire
  const titre = req.body.titre
  const regex = /[<\/>]/g;
  let erreurCommentaire = [];

  if (req.session.user === []) {
    res.redirect('/login')
  }

  if(comment.search(regex)!== -1 || titre.search(regex) !== -1){
    erreurCommentaire.push("Les caractères spéciaux sont autorisés")
  }else if(comment.trim().length === 0 || titre.trim().length === 0){
    erreurCommentaire.push("Veuillez remplir tous les champs")
  }else {
    const newComment = new Commentaires({
      contenu: comment,
      utilisateur: req.session.user[0].id,
      produit: id,
      titre: titre
    });
    await newComment.save();
    res.redirect('/produit?id=' + id);
  }
})

/* ------------------------------------------------ PAGE COMPTE DE L'UTILISATEUR -----------------------------------*/

router.get('/account', async (req, res) => {
  if (req.session.user === undefined) {
    req.session.user = [];
  }
  if (req.session.user.length === 0) {
    res.redirect('/')
  } 

  const user = await Utilisateur.findById(req.session.user[0].id);
  res.render('account', { user: req.session.user, panier: req.session.cart, utilisateur : user });
})

/* ----------------------------------------------- MODIFIER LES INFORMATIONS DU COMPTE DE L'UTILISATEUR CONNECTÉ ------------------------------------------*/

router.post('/update-user', async (req, res) => {
  let erreurModification = [];
  let body = req.body;
  let motDePasse = body.motDePasse;
  let salt = await bcrypt.genSalt(10);
  let hashedPassword = await bcrypt.hash(motDePasse, salt);
  const regex = /[<\/>]/g;
  const regexMdp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,20}$/
  const user = await Utilisateur.findById(req.session.user[0].id);

  // Tous les if pour gérer les erreurs à pour la modification des informations de l'utilisateur
  if (body.prenom.trim() === "" || body.email.trim() === "" || body.motDePasse.trim() === "" || body.telephone.trim() === "" || body.adresse.trim() === "") {
    console.log("ERREURS : ", erreurInscription);
  } else if (body.prenom.search(regex) !== -1 || body.nom.search(regex) !== -1 || body.adresse.search(regex) !== -1) {
    erreurModification.push('Les caractères spéciaux ne sont pas autorisés');
  } else if (regexMdp.test(body.motDePasse) === false) {
    erreurModification.push('Le mot de passe doit contenir entre 8 et 20 caractères, dont 1 majuscule, 1 minuscule et 1 chiffre');
  }
  // S'il n'y a pas d'erreur, on modifie les informations de l'utilisateur dans la base de données
  else {
    await Utilisateur.findByIdAndUpdate(req.session.user[0].id, {
      prenom : body.prenom,
      nom: body.nom,
      motDePasse: hashedPassword,
      adresse: body.adresse
    })
    return res.redirect('/');
  }
  res.render('account', { erreurs: erreurModification, body, user: req.session.user, panier: req.session.cart, utilisateur : user });
})

router.get('/delete-account', async (req, res) => {
  if (req.session.user === undefined) {
    req.session.user = [];
  }
  if (req.session.user.length === 0) {
    res.redirect('/')
  }
  await Utilisateur.findByIdAndDelete(req.session.user[0].id);
  await Commentaires.deleteMany({ utilisateur: req.session.user[0].id });
  req.session.user = [];

  res.redirect('/')
})

/* ----------------------------------------------- PAGE À PROPOS ------------------------------------------*/

router.get('/a-propos', (req,res) => {
  if (req.session.user === undefined) {
    req.session.user = [];
  }
  if (req.session.cart === undefined) {
    req.session.cart = []
  }
  res.render('a-propos', {user: req.session.user, panier: req.session.cart});
})

module.exports = router;