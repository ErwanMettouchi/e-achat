const mongoose = require('mongoose');

const utilisateurSchema = mongoose.Schema({
    prenom : { type: String, required: true },
    nom : String,
    email : { type : String, required : true, unique : true },
    motDePasse : { type: String, required: true },
    telephone : { type : String, required : true, unique : true },
    isAdmin : {type : Boolean, required : true},
    adresse : { type : String, required : true }
    });

const Utilisateurs = mongoose.model('utilisateurs', utilisateurSchema);

module.exports = Utilisateurs;