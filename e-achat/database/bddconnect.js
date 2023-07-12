var mongoose = require('mongoose');
mongoose.set("strictQuery", false);

var options = {
    connectTimeoutMS: 5000,
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connect(
    'mongodb+srv://Winnb:1XetWtTY96Ywfapd@cluster0.yeijfpb.mongodb.net/ecommerce',
    options
).then(() => {
    console.log('Connexion réussie!');
}).catch((err) => {
    console.log('Impossible de se connecter => ', err)
})
