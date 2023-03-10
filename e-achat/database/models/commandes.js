const mongoose = require('mongoose');

const commandeSchema = mongoose.Schema({
    dateCommande: {type : Date, default : Date.now()},
    numero: {type : String, default : Date.now() + '-' + Math.floor(Math.random() * 100000000) },
    suiviCommande: { type : String, default: 'En cours' },
    livraison: { type: mongoose.Schema.Types.ObjectId, ref: 'livraisons', default : '6404050be7abacf9226a44a4'},
    panier: { type: mongoose.Schema.Types.ObjectId, ref: 'paniers' }
});

const Commande = mongoose.model('commandes', commandeSchema);

module.exports = Commande;


