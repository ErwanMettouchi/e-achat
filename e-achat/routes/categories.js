var express = require('express');
var router = express.Router();
const Categorie = require('../database/models/categories');
const Produits = require('../database/models/produits');
const SousCategorie = require('../database/models/sousCategories');

router.get('/:name', async (req, res) => {
    if(req.session.user === undefined) {
        req.session.user = [];
      }
    const name = req.params.name;
    const categorie = await Categorie.findOne({ nom_url: name });
    if (!categorie) {
        return res.status(404).render('404', { user: req.session.user, panier: req.session.cart })
    }

    const sousCategorie = await SousCategorie.find({ categorie: categorie.id }).populate('categorie').exec();
    // console.log('Sous catégorie' + sousCategorie);

    const products = await Produits.find({ sousCategorie: { $in: sousCategorie } })
        .populate({
            path: 'sousCategorie',
            populate: {
                path: 'categorie'
            }
        })
        .exec();
    console.log("PRODUITS : ", products);
    // console.log("marque : ", marque);

    res.render('categories', { user: req.session.user, produits: products, name: name, panier: req.session.cart });
})

module.exports = router;