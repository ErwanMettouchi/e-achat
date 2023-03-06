const mongoose = require('mongoose');

const panierSchema = mongoose.Schema({
    prixTotal : Number,
    quantiteProduits: Number,
    produits: [
        {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'produits' },
            prix: Number,
            quantite: Number,
            nom: String,
            image: String
        }],
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'utilisateurs' }
});

const Panier = mongoose.model('paniers', panierSchema);

module.exports = Panier;