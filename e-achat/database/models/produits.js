const mongoose = require('mongoose');

const produitSchema = mongoose.Schema({
    nom: String,
    prix: Number,
    description: { type: String, minLength: 30, maxLength: 500 },
    stock: Number,
    sousCategorie: { type: mongoose.Schema.Types.ObjectId, ref: 'sous-categories' },
    paniers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'paniers' }],
    marque: { type: mongoose.Schema.Types.ObjectId, ref: 'marques' },
    image: String
})

produitSchema.index({
    nom: 'text',
    description: "text"
});

const produitModel = mongoose.model('produits', produitSchema);


module.exports = produitModel;