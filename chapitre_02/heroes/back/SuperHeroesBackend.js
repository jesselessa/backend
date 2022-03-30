const express = require('express');
const req = require('express/lib/request');
const res = require('express/lib/response');
const app = express();
const mongoose = require("mongoose"); //MongoDB
const Hero = require("./models/heroModel"); //MangoDB models
const router = express.Router();
const MONGO_PASSWORD = require('./secret')
//Libraraies
const Joi = require("Joi");
const dotenv = require("dotenv");
dotenv.config({
	path: "./config.env",
});
const { Pool } = require("pg");
const { findOne } = require('./models/heroModel');
const Postgres = new Pool({ ssl: { rejectUnauthorized: false } });

// CONNECTING TO MONGODB 
mongoose
	.connect(
		`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.5sekn.mongodb.net/konexio?retryWrites=true&w=majority`,
		{
			useNewUrlParser: true,
		}
	)
	.then(() => console.log("Connected to MongoDB"));
    

// ---------------------------------- MIDDLEWARES -----------------------------------------
function transformName(req,res,next) {
    //In the body params :
    if(req.body.name) {
        req.body.name = req.body.name.toLowerCase().replace(' ', '-');
    }
    //In the body URL params : 
    if (req.params.name) {
        req.params.name = req.params.name.toLowerCase().replace(' ', '-');
    }
    next();
}

//Checking if the superhero does NOT exist : 
async function checkIfHeroExists(req,res,next) {  

    // ---------------------------POSTGRESQL ---------------------------------------

    // if (req.params.name) {
        
    //     req.params.name = req.params.name.replaceAll('-', ' ');
    //     //Make a case-insensitive query in Postgresql to find the name: 
    //     let nameHero = await Postgres.query("SELECT name FROM superHerosData WHERE LOWER(name)=LOWER($1)",
    //     [req.params.name])
    
    //     nameHero = nameHero.rows[0];
    
    //     if (nameHero === undefined) {
    //             req.params.name = false;
    //             req.heroExists = false;
    //             req.paramNameHeroExists = false;
    //     }
    // }

    // if (req.body.name) {

    //     req.body.name = req.body.name.replaceAll('-', ' ');
    //     //Make a case-insensitive query in Postgresql to find the name: 
    //     let nameHero = await Postgres.query("SELECT name FROM superHerosData WHERE LOWER(name)=LOWER($1)",
    //     [req.body.name])
    
    //     nameHero = nameHero.rows[0];
    
    //     if (nameHero === undefined) {
    //         req.heroExists = false;
    //         req.bodyNameHeroExists = false;

    //     } else if (nameHero !== undefined) {
    //         req.heroExists = true;
    //         req.bodyNameHeroExists = true;
    //     }
        
    // }
// --------------------------- MANGODB ---------------------------------------

    if (req.params.name) {

    //GUARD : CHECKING THE NAME PARAM TO SEE IF THEIR FORMAT IS CORRECT :
    //Creating the scheme validation :
    let name = req.params.name.replace('-', ' ');
    const schema =  Joi.string().max(30).required();
    const validateHeroInfos = schema.validate(name);

    if (validateHeroInfos.error) {
        return res.status(400).json({
            message : validateHeroInfos.error.details[0].message,
        })
    }

        let paramName = req.params.name.replaceAll('-', ' ');
        
        let hero = await Hero.findOne({name : paramName});

        if (hero === null) {
            
           req.paramHeroExists = false;
        } else if (hero) {
            req.paramHeroExists = true;
        }
    }

    //Checking if the hero's image already exists : 
    if (req.body.image) {

        let bodyImage = req.body.image, hero;

        try {
            hero = await Hero.findOne({image : bodyImage});

        } catch(err) {
            console.log(err);
            return res.status(401).json({error : "A problem happened."})
        }
        
        //If no hero was found via the image, it means that the image uri doesn't exist yet : 
        if (hero  === null) {
            req.bodyImageHeroExists = false;

        } else if (hero) {
            req.bodyImageHeroExists = true;
        }

    }

    if (req.body.name) {

        let bodyName = req.body.name;
        
        let hero = await Hero.findOne({name : bodyName});
        if (hero  === null) {
            
            req.bodyHeroExists = false;
        } else if (hero) {
            req.bodyHeroExists = true;
        }
    }
        
    next();
}

async function checkIfPowerExists (req,res,next) {

    // ---------------------------POSTGRESQL ---------------------------------------
    // if (req.params.power !== false && req.params.name !== false) {

    //     req.params.power = req.params.power.replaceAll('-', ' ');
    //     //Find the power : 
    //     //Make a case-insensitive query in Postgresql to find the hero's power: 
    //     let heroPowers = await Postgres.query("SELECT power FROM superHerosData WHERE LOWER(name)=LOWER($1)",
    //     [req.params.name])
        
    //     heroPowers = heroPowers.rows[0].power;
    //     req.heroPowers = heroPowers;

    //     //Checking if the heroPowers array contains the power in the req.params :
    //     //If the power doesn't exist, it returns false : 
    //     if (heroPowers.filter(power => power.toLowerCase() === req.params.power.toLowerCase()).length <= 0) {
    //         req.powerExists = false;
    //     } 

    // }
    // --------------------------- MANGODB ---------------------------------------
    
    if (req.params.power) {

        //Making sure the power param is valid : 
        let power = req.params.power, powerHero;
        const schema = Joi.string().min(1).max(30).required();

        const validatePowerHero = schema.validate(power);

        if (validatePowerHero.error) {
            return res.status(400).json({
                message : validatePowerHero.error.details[0].message,
            })
        }

        req.params.power = req.params.power.replaceAll('-', ' ').toLowerCase();
        
        //Find the power : 
        try {

            powerHero = await Hero.findOne({name : req.params.name}).find({
                power : {
                    $all : [req.params.power]
                }
            })
            console.log("POWER HERO: ",powerHero);

        }catch(err) {
            console.log(err);
            return res.json({message : "An error happened."})
        }
        //If powerHero returns nothing, it means that the given power doesn't exist : 
        if (powerHero.length === 0) {
            req.paramPowerExists = false;

        } 
    }

    next();
}

function transformPowerToLowerCase(req,res,next) {

    if (req.params.power) {
        req.params.power = req.params.power.toLowerCase();
    }
    next();
}

function validateHero (req,res,next) {
    const newHero = req.body;

    //CHECKING EVERY VALUE TO SEE IF THEIR FORMAT IS CORRECT :
      //Creating the scheme validation :
      const schema = Joi.object({
        name : Joi.string().min(1).max(30).required(),
        power : Joi.array().items(Joi.string()).required(),
        color : Joi.string().min(1).required(),
        isAlive : Joi.boolean().required(),
        age : Joi.number().integer().min(1).strict().required(),
        image : Joi.string().uri().required(),
    })
    
    const validateHeroInfos = schema.validate(newHero);

    if (validateHeroInfos.error) {
        return res.status(400).json({
            message : validateHeroInfos.error.details[0].message,
        })
    }

    next();
    }

    function validateHeroOptions (req,res,next) {
    const newHero = req.body;

    //CHECKING EVERY VALUE TO SEE IF THEIR FORMAT IS CORRECT :
    //Creating the scheme validation :
    const schema = Joi.object({
    name : Joi.string().min(1).max(30),
    // power : Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).required(),
    power : Joi.array().items(Joi.string()),
    color : Joi.string().min(1),
    isAlive : Joi.boolean().required(),
    age : Joi.number().integer().min(1).strict(),
    image : Joi.string().uri(),
    })
    
    const validateHeroInfos = schema.validate(newHero);

    if (validateHeroInfos.error) {
        return res.status(400).json({
            message : validateHeroInfos.error.details[0].message,
        })
    }

    next();

    }

//VALIDATE PATCH POWERS ROUTE :
function validatePowerHero (req,res,next) {

    if (req.params.power) {

        //Making sure the power param is valid : 
        const schema = Joi.string().min(1).max(30).required();
        const validateHeroInfos = schema.validate(req.params.power);
        
        if (validateHeroInfos.error) {
            return res.status(400).json({
                message : validateHeroInfos.error.details[0].message,
            })
        }
        
    }
    else if (req.body) {
    
        const newHero = req.body;
        const schema = Joi.object({
            power : Joi.string().min(1).max(30).required(),
            })
            
        const validateHeroInfos = schema.validate(newHero);
        
        if (validateHeroInfos.error) {
            return res.status(400).json({
                message : validateHeroInfos.error.details[0].message,
            })
        }
    }

    next();
}

// ----------------------------------------- ROUTES -----------------------------------------
//--------------------------- WE ARE IN : localhost:8000/heroes/ ----------------------------

//Displays the whole list of superheroes:
router.get('/', async (req,res)=> {

    //-----------------------POSTGRESQL -----------------------------
    // let superHerosData;

    // try{
    //     superHerosData = await Postgres.query("SELECT * FROM superHerosData"); 

    // } catch(error) {
    //     console.log(err);
    //     return res.status(400).json({message : "A problem occured."})
    // }

    // superHerosData = superHerosData.rows;
    // return res.status(201).json({superHerosData});

     //----------------------- MONGODB -----------------------------
    let heroes ;

    try {
        let listhero = await Hero.find();

        if (listhero.length <= 0){
            return res.send("No hero added yet.")
        }

        heroes = await Hero.find();

    } catch(err) {
        console.log(err);
        res.status(401).json({error : "An error happened."})
    }

     res.json(heroes);

})

//Add a new superhero:
router.post('/', validateHero, checkIfHeroExists, async (req,res)=> {

    //-----------------------POSTGRESQL -----------------------------

    // const hero = req.body;
    // const heroExists = req.heroExists;

    // let superHerosData;
    
    // //GUARD : If the name of the superhero already exists in the superHeros's list, an error message gets displayed : 
    // if (heroExists === true) {
    //     return res.status(401).json({message : "This hero already exists. Please choose another name"})
    // }

    // try {

    //     if (heroExists === false) {
    //         //Write the first letter in uppercase:
    //         hero.name = hero.name[0].toUpperCase() + hero.name.slice(1);
    //         //Adding the new superhero:
    //         await Postgres.query("INSERT INTO superHerosData(name, power, color, isAlive, age, image)VALUES($1, $2, $3, $4, $5, $6)", 
    //         [hero.name, hero.power, hero.color, hero.isAlive, hero.age, hero.image])
    //     }
    //     superHerosData = await Postgres.query("SELECT * FROM superHerosData");
        
    // } catch (err) {
    //     console.log(err);
    //     return res.status(400).json({message : "A problem occured."})
    // }
    // superHerosData = superHerosData.rows;

    // return res.status(201).json({message : "Ok, hero added !",
    // superHerosData });

     //----------------------- MONGODB -----------------------------

     let hero = req.body,
            superHerosData;
            
    //Guards :  
    if (req.bodyHeroExists === true) {
        return res.json ({message : "This hero already exists. Please choose another name."})
    }

    if (req.bodyImageHeroExists === true) {
        return res.json ({message : "This image illustrates annother hero. Please choose another one."})
    }

     try {
        hero = await Hero.create(hero);

     } catch(err) {
        console.log(err);
        res.status(401).json({error : "An error happened."})
     }

     superHerosData = await Hero.find();

    return res.status(201).json({message : "Ok, hero added !", superHerosData });
})

//Delete a superhero:
//If the name of the superhero is in the superHeros's list,he gets deleted : 
router.delete('/:name',checkIfHeroExists, async (req,res) => {
    
    //-----------------------POSTGRESQL -----------------------------
    // const heroExists  = req.params.name;
    // let superHerosData;

    //     if (heroExists === false) {
    //         return res.status(404).json({message : `This hero doesn't exist.` });
    //     }

    //     try {
    //     //Delete function : 
    //     await Postgres.query("DELETE FROM superHerosData WHERE LOWER(name)=LOWER($1)", [heroExists])
    //     superHerosData = await Postgres.query("SELECT * FROM superHerosData");

    //     } catch(error) {
    //         console.log(error);
    //         return res.status(400).json({message : "A problem occured."})
    //     }

    //     superHerosData = superHerosData.rows;
    //     return res.status(201).json({message : `${req.params.name} successfully deleted !`, superHerosData});

    //----------------------- MONGODB -----------------------------

    let hero, deleteHero, superHerosData;

    //Guards : 

    if (req.paramHeroExists === false) {
        res.status(404).json({message : "This hero doesn't exist."});
    }

    try {
        hero = req.params.name.replaceAll('-', ' ') ;
        deleteHero = await Hero.findOneAndDelete({name : hero});

    }catch(error) {
            console.log(error);
            return res.status(400).json({message : "A problem occured."})
    }

    superHerosData = await Hero.find();
    return res.status(201).json({message : `${hero} successfully deleted !`, superHerosData});
})


//GET the superhero's infos -------------- 

router.get('/:name',checkIfHeroExists, async (req,res) => {

    //-----------------------POSTGRESQL -----------------------------

    // let heroExists  = req.params.name;

    // let hero;

    //  //Guard 
    //  if (heroExists === false) {
    //     return res.status(404).json({message : `This hero doesn't exist.` });
    // }

    // try {
    //     //Find hero : 
    //     hero = await Postgres.query("SELECT * FROM superHerosData WHERE LOWER(name)=LOWER($1)",
    //     [heroExists])

    // } catch (error) {
    //     console.log(error);
    //     return res.status(400).json({message : "A problem occured."})
    // }

    // hero = hero.rows[0];

    // return res.json({hero});


 //----------------------- MONGODB -----------------------------

    let name = req.params.name.replaceAll('-', ' ');
    let hero;

    //Guard : 
    if (req.paramHeroExists === false) {
        return res.status(404).json({error : "This hero does not exist."})
    }

    try {
        hero = await Hero.findOne({name});

    } catch (err) {

        console.log(err);
        res.status(400).json({error : "An error happened"})
    }

     return res.json({hero});

})

//PUT the superhero's infos -------------- 

router.put('/:name',validateHero, checkIfHeroExists, async (req,res) => {

    //-----------------------POSTGRESQL -----------------------------

    // let heroExists  = req.params.name;
    // let bodyNameHeroExists = req.bodyNameHeroExists;
    // let paramNameExists = req.paramNameHeroExists;
    // let updatedHero;

    //  //Guard 
    //  if (paramNameExists === false) {
    //     return res.status(404).json({message : `This hero doesn't exist.` });
    // }
    // //If the updated name already exists and is different from the URL's name, then it means that it is already used by another superhero => an error mesage gets displayed : 
    // if (bodyNameHeroExists === true && req.body.name.toLocaleLowerCase().replaceAll('-', ' ') !== req.params.name.toLocaleLowerCase().replaceAll('-', ' ')) {
    //     return res.status(404).json({message : `This hero's name already exists. Please choose another name.` });
    // } 
    
    // try {
    //     //Updating the superhero:
    //     let hero = await Postgres.query("UPDATE superHerosData SET name = $1, power=$2, color=$3, isAlive=$4, age=$5, image=$6 WHERE LOWER(name)=LOWER($7) ", [req.body.name, req.body.power, req.body.color, req.body.isAlive, req.body.age, req.body.image, req.params.name])
    //     // hero = hero.rows[0];
    //     updatedHero = await Postgres.query("SELECT * FROM superHerosData WHERE LOWER(name)=LOWER($1)", [req.body.name]);
        
    // } catch (error) {
    //     console.log(error);
    //     return res.status(400).json({message : "A problem occured."})
    // }
    
    // updatedHero = updatedHero.rows[0];

    // return res.status(201).json({
    //     message : `hero successfully modified ! `,
    //     updatedHero});

    //----------------------- MONGODB -----------------------------

    let nameHero = req.params.namereplaceAll('-', ' '), updatedHero;

    //Guard : 
    if (req.paramHeroExists === false) {
        return res.status(404).json({error : "This hero does not exist."})
    }

    try {

         await Hero.findOneAndUpdate(
            {name : nameHero}, req.body
            )

    }catch (error) {
        console.log(error);
        return res.status(400).json({message : "A problem occured.."})
    }

    updatedHero = await Hero.findOne({name : req.body.name});

    return res.status(201).json({
    message : `hero successfully modified ! `,
    updatedHero});
})

//GET a superhero's superpowers  -------------- 

router.get('/:name/powers',checkIfHeroExists, async (req,res) => {

//-----------------------POSTGRESQL -----------------------------

            // const heroExists  = req.params.name;
            // let hero;
        
            // //Guards : 
            // if (heroExists === false) {
            //     console.log("heroExist === false");
            //     return res.status(404).json({message : `This hero doesn't exist.` });
            // }

            // try {
            //     //Find hero : 
            //     hero = await Postgres.query("SELECT * FROM superHerosData WHERE LOWER(name)=LOWER($1)",
            //     [heroExists])
                
            // } catch (error) {
            //     console.log(error);
            //     return res.status(400).json({message : "A problem occured."})
            // }
            
            // hero = hero.rows[0];
            // return res.status(201).json({powers : hero.power});

    //----------------------- MONGODB -----------------------------
    let nameHero = req.params.name.replaceAll('-', ' '), updatedHero;

    //Guard : 
    if (req.paramHeroExists === false) {
        return res.status(404).json({error : "This hero does not exist."})
    }

    try {
        updatedHero = await Hero.findOne({name : nameHero}).select("power");

    }catch (error) {
        console.log(error);
        return res.status(400).json({message : "A problem occured.."})
    }

    return res.json({updatedHero});
})

//PATCH (MODIFY) A SUPERHERO'S SUPERPOWERS  -------------- 

router.patch('/:name/powers',validatePowerHero, checkIfHeroExists, async (req,res) => {

    //-----------------------POSTGRESQL -----------------------------

    // let paramNameExists = req.paramNameHeroExists;
    
    // //Guards : 
    // if (paramNameExists === false) {
    //     return res.status(404).json({message : `This hero doesn't exist.` });
    // }

    // try {
    //     //Adding a power to the superhero's array of powers : 
    //     await Postgres.query("UPDATE superHerosData SET power = array_append(power, $1) WHERE LOWER(name)=LOWER($2)", [req.body.power, req.params.name])
    
    //     let updatedHero = await Postgres.query("SELECT * FROM superHerosData WHERE LOWER(name)=LOWER($1)", [req.params.name]);
    //     updatedHero = updatedHero.rows[0];
    
    //     return res.status(201).json({
    //         message : "Pouvoir ajouté !",
    //         updatedHero});

    // } catch(error) {
    //     console.log(error);
    //     return res.status(400).json({message : "A problem occured."})
    // }
 //----------------------- MONGODB -----------------------------

    let hero = req.params.name.replaceAll('-', ' '), power, updatedHero;

    //Guard : 
    if (req.paramHeroExists === false) {
        return res.status(404).json({error : "This hero does not exist."})
    }

    try {

        hero = await Hero.findOneAndUpdate(
            {name : hero},
            {
                $push : {
                    power : req.body.power
                }
            }
            );

    } catch(error) {
            console.log(error);
            return res.status(400).json({message : "A problem occured."})
    }

    updatedHero = await Hero.findOne({name : req.params.name});

    return res.json({
            message : `Power added to ${updatedHero.name} ! `,
            updatedHero});
})

//DELETE A POWER  -------------- 
//If the name of the superhero is in the superHeros's list,its selected power gets deleted : 

router.delete('/:name/power/:power',
checkIfHeroExists,
validatePowerHero,
transformPowerToLowerCase, 
checkIfPowerExists,
async (req,res) => {
     //-----------------------POSTGRESQL -----------------------------
        
//     let powerExists = req.powerExists;
//     let paramNameExists = req.paramNameHeroExists;
    
//     //Guards : 
//     if (paramNameExists === false) {
//         return res.status(404).json({message : `This hero doesn't exist.` });
//     }

//     if (powerExists === false) {
//         return res.status(404).json({message : `This power doesn't exist.` });
//     }

//     try{  
//         //Delete function in array : 
//         await Postgres.query("UPDATE superHerosData SET power = array_remove(power, $1) WHERE LOWER(name)=LOWER($2)", [req.params.power, req.params.name])

//         //Find hero : 
//         let hero = await Postgres.query("SELECT * FROM superHerosData WHERE LOWER(name)=LOWER($1)",
//         [req.params.name])
        
//         hero = hero.rows[0];

//         return res.status(201).json({
//             message : `${req.params.power} power successfully deleted from ${hero.name} !`, 
//             hero});

//     } catch(error) {
//         console.log(error);
//         return res.status(400).json({message : "A problem occured."})
//     }

     //----------------------- MONGODB -----------------------------
     let hero = req.params.name.replaceAll('-', ' '), power = req.params.power.replaceAll('-', ' '), updatedHero;

    //Guards : 
    if (req.paramHeroExists === false) {
        return res.status(404).json({error : "This hero does not exist."})
    }

    if (req.paramPowerExists === false ) {
        return res.status(404).json({error : "This power does not exist."})
    }

     try {
 
         hero = await Hero.findOneAndUpdate(
             {name : hero},
             {
                 $pull : {
                     power
                 }
             }
             );
 
     } catch(error) {
             console.log(error);
             return res.status(400).json({message : "A problem occured."})
     }
 
     updatedHero = await Hero.findOne({name : req.params.name});
 
     return res.json({
             message : ` ${req.params.power} power deleted from ${updatedHero.name} ! `,
             updatedHero});
})

// Exporting the router
module.exports = router;