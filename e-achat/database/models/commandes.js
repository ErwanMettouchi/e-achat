const mongoose = require('mongoose');

const commandeSchema = mongoose.Schema({
    dateCommande : Date,
    numero : Number,
    suiviCommande : String,
    utilisateur : { type : mongoose.Schema.Types.ObjectId, ref : 'utilisateurs'},
    livraison : { type : mongoose.Schema.Types.ObjectId, ref : 'livraisons' },
    panier : { type : mongoose.Schema.Types.ObjectId, ref : 'paniers'}
});

const Commande = mongoose.model('commandes', commandeSchema);

module.exports = Commande;