const mongoose = require('mongoose');

const categorieSchema = mongoose.Schema({
    nom: { type: String, unique: true },
    nom_url: { type: String, unique: true },
})

const Categorie = mongoose.model('categories', categorieSchema);

module.exports = Categorie;