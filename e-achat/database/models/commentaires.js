const mongoose = require('mongoose');

const commentaireSchema = mongoose.Schema({
    contenu: String,
    titre : String,
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'utilisateurs' },
    produit: { type: mongoose.Schema.Types.ObjectId, ref: 'produits' },
    date_commentaire: { type: Date, default: Date.now }
})

const Commentaire = mongoose.model('commentaires', commentaireSchema);

module.exports = Commentaire;