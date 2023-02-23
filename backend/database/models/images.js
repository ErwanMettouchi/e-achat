const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
    url : { type : String, required : true, unique : true },
    description : String,
    alt : String,
    produit : { type : mongoose.Schema.Types.ObjectId, ref : 'produits' }
});

const Image = mongoose.model('images', imageSchema);

module.exports = Image;