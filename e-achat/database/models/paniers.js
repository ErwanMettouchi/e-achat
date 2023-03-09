const mongoose = require('mongoose');

const panierSchema = mongoose.Schema({
    prixTotal : Number,
    quantiteProduits: Number,
    produits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'produits' }],
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'utilisateurs' }
});

const Panier = mongoose.model('paniers', panierSchema);

module.exports = Panier;