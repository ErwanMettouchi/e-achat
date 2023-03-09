var express = require('express');
var router = express.Router();
const Produits = require('../database/models/produits');
const SousCategorie = require('../database/models/sousCategories');

router.get('/:name', async (req, res) => {
    if(req.session.user === undefined) {
        req.session.user = [];
      }
    if(req.session.cart === undefined) {
      req.session.cart = [];
    }
    let name = req.params.name;

    let subcategorie = await SousCategorie.findOne({ nom_url: name });
    let products = await Produits.find({ sousCategorie: subcategorie.id }).populate('sousCategorie').exec();
    return res.render('sub-category', { produits: products, user: req.session.user, name, panier: req.session.cart });
})

module.exports = router;