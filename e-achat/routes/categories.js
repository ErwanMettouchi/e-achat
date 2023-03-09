var express = require('express');
var router = express.Router();
const Categorie = require('../database/models/categories');
const Produits = require('../database/models/produits');
const SousCategorie = require('../database/models/sousCategories');

router.get('/:name', async (req, res) => {
    if(req.session.user === undefined) {
        req.session.user = [];
      }
      if(req.session.cart === undefined) {
        req.session.cart = [];
      }
    const name = req.params.name;

    // Recherche d'une catégorie ayant le même slug que le paramètre
    const categorie = await Categorie.findOne({ nom_url: name });

    // Si la catégorie n'existe pas, l'utilisateur est renvoyée vers la page 404
    if (!categorie) {
        return res.render('404', { user: req.session.user, panier: req.session.cart })
    }

    // Lorsque la catégorie est trouvée, on cherche toutes les sous catégories qui sont reliées à cette catégorie
    const sousCategorie = await SousCategorie.find({ categorie: categorie.id })
                                             .populate('categorie')
                                             .exec();

    // Enfin, on cherche les produits associés aux sous catégories qui viennent d'être trouvées
    const products = await Produits.find({ sousCategorie:  sousCategorie })
                                   .populate('sousCategorie' )
                                   .exec();


    res.render('categories', { user: req.session.user, produits: products, name: name, panier: req.session.cart });
})

module.exports = router;