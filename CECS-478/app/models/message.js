// app/models/message.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MessageSchema   = new Schema({
    sender: String,
    receiver: String,
    text: String,
    RSACipher: String,
    tag: String,
    IV: String
});

module.exports = mongoose.model('Message', MessageSchema);

