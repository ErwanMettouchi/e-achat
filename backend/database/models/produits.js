const mongoose = require('mongoose');

const produitSchema = mongoose.Schema({
    nom : String,
    prix : Number, 
    description : String,
    stock : Number,
    categorie : { type : mongoose.Schema.Types.ObjectId, ref : 'categories' },
    paniers : [{ type : mongoose.Schema.Types.ObjectId, ref : 'paniers' }]
})

const produitModel = mongoose.model('produits', produitSchema);

module.exports = produitModel;