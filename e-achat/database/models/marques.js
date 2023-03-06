const mongoose = require('mongoose');

const marqueSchema = mongoose.Schema({
    nom: String
})

const marqueModel = mongoose.model('marques', marqueSchema);

module.exports = marqueModel;