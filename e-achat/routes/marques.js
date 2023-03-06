var express = require('express');
var router = express.Router();
const Produits = require('../database/models/produits');
const Marques = require('../database/models/marques');

router.get('/:name', async (req, res) => {
    if(req.session.user === undefined) {
        req.session.user = [];
      }
    const name = req.params.name;
    let marque = await Marques.findOne({ nom : name });
  
    console.log("MARQUE : ", marque)
    let products = await Produits.find({ marque : marque.id }).populate('marque').exec();
  
    console.log("PRODUITS : ", products);
  
    res.render('brand', { produits: products, user: req.session.user, name, panier : req.session.cart });
})
  
module.exports = router;