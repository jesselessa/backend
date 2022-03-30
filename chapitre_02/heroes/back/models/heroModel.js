const { array } = require("joi");
const mongoose = require("mongoose");

// créer un schéma
const heroScheme = new mongoose.Schema({

	name : {
		type: String,
		required : true,
		minlength : 1,
		maxlength : 30,
		lowercase : true,
		unique: true,
	},
	power : {
		type : Array,
		required : true,
		minlength : 1,
		maxlength : 30,
	},

	color : {
		type: String,
		required : true,
		minlength : 1,
		maxlength : 30,
		lowercase : true,
	},

	isAlive : {
		type : Boolean,
	},

	age : {
		type: Number,
		required : true,
		min : 1,
		max : 10000,
	}, 

	image : {
		type: String,
		required : true,
		minlength : 1,
		maxlength : 300,
		lowercase : true,
		unique: true,
	}
	
});

// Create a model : 
const Hero = mongoose.model("Hero", heroScheme);

// exporter le modèle
module.exports = Hero;