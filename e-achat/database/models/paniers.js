const mongoose = require('mongoose');

const panierSchema = mongoose.Schema({
    prix : Number,
    quantiteProduits : Number,
    produits : [ { type : mongoose.Schema.Types.ObjectId, ref : 'produits' } ]
});

const Panier = mongoose.model('paniers', panierSchema);

module.exports = Panier;