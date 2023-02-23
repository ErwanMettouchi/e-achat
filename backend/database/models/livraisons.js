const mongoose = require('mongoose');

const livraisonSchema = mongoose.Schema({
    modeLivraison : String
})

const Livraisons = mongoose.model('livraisons', livraisonSchema);

module.exports = Livraisons;