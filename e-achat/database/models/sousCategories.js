const mongoose = require('mongoose');

const sousCategorieSchema = mongoose.Schema({
    nom : { type : String, unique : true},
    nom_url : { type : String, unique : true},
    categorie : {type : mongoose.Schema.Types.ObjectId, ref : 'categories' }
});

const SousCategorie = mongoose.model('sous-categories', sousCategorieSchema);

module.exports = SousCategorie;