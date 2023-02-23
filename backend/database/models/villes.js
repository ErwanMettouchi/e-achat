const mongoose = require('mongoose');

const villeSchema = mongoose.Schema({
    nom : { type : String, unique : true}
});

const Ville = mongoose.model('villes', villeSchema);

module.exports = Ville;