const express = require('express');
const req = require('express/lib/request');
const res = require('express/lib/response');
const app = express();
const router = express.Router();
//Import SuperHerosData
// const superHerosData = require('./SuperHerosData')
//Libraraies
const Joi = require("Joi");
const dotenv = require("dotenv");
dotenv.config({
	path: "./config.env",
});
const { Pool } = require("pg");
const Postgres = new Pool({ ssl: { rejectUnauthorized: false } });

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
function checkIfHeroExists(req,res,next) {  
    if (superHerosData.filter(superhero => superhero.name.toLowerCase().replace(' ', '-') === req.params.name).length <= 0) {

        req.params.name = false;
    }
    next();
}

function checkIfPowerExists (req,res,next) {

    if (req.params.name !== false) {

        //Find the hero
        const hero = superHerosData.find(hero => {
            return hero.name.toLowerCase().replace(' ', '-') === req.params.name.toLowerCase().replace(' ', '-');
        })

        //Checking if the selected power does NOT exist. If not, the params "power" equals false : 
        if (hero.power.filter(power => power === req.params.power).length <= 0) {
            req.params.power = false;
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
        name : Joi.string().min(1).required(),
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
    name : Joi.string().min(1),
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
        const newHero = req.body;
        const schema = Joi.object({
            power : Joi.string().min(1).required(),
            })
            
        const validateHeroInfos = schema.validate(newHero);
        
        if (validateHeroInfos.error) {
            return res.status(400).json({
                message : validateHeroInfos.error.details[0].message,
            })
        }

        next();
    }

// ----------------------------------------- ROUTES -----------------------------------------
//------- WE ARE IN : localhost:8000/heroes/ -------

//Displays the whole list of superheroes:
router.get('/', async (req,res)=> {

    let superHerosData = await Postgres.query("SELECT * FROM superHerosData"); 
    superHerosData = superHerosData.rows;
    return res.status(201).json({superHerosData});
})

//Add a new superhero:
router.post('/', validateHero, transformName, (req,res)=> {
    const hero = req.body;

    let superHerosData;

    try {

    } catch (err) {
        console.log(err);
        res.status(401).json({error: "A problem happened."})
    }

    //GUARD : If the name of the superhero already exists in the superHeros's list, an error message gets displayed : 
    if (superHerosData.filter(superhero => superhero.name.toLowerCase().replace(' ', '-') === req.body.name).length > 0) {
        return res.status(401).json({message : "This hero already exists. Please add another one."});
    }
    //Write the first letter in uppercase:
    hero.name = hero.name[0].toUpperCase() + hero.name.slice(1);

    //Adding the new superhero:
    superHerosData.push(hero);

    return res.status(201).json({message : "Ok, hero added !",
    superHerosData });
})

//Delete a superhero:
//If the name of the superhero is in the superHeros's list,he gets deleted : 
router.delete('/:name',transformName, checkIfHeroExists, (req,res) => {
        
    const heroExists  = req.params.name;

        if (heroExists === false) {
            return res.status(404).json({message : `This hero doesn't exist.` });
        }

        //Delete function : 
        for( let i = 0; i < superHerosData.length; i++){ 
    
            if ( superHerosData[i].name.toLowerCase() === req.params.name ) { 
                superHerosData.splice(i, 1); 
            }
        }
        return res.status(201).json({message : `${req.params.name} successfully deleted !`, superHerosData});
})


//GET the superhero's infos -------------- 
router.get('/:name',transformName,checkIfHeroExists, (req,res) => {
    const heroExists  = req.params.name;

     //Guard 
     if (heroExists === false) {
        return res.status(404).json({message : `This hero doesn't exist.` });
    }
     //Find hero : 
    const hero = superHerosData.find(hero => {
        return hero.name.toLowerCase().replace(' ', '-') === req.params.name;
    })

    return res.status(201).json({hero});
})

//PUT the superhero's infos -------------- 
router.put('/:name',validateHero, transformName, checkIfHeroExists,transformName, (req,res) => {
    const heroExists  = req.params.name;
    let newHero = req.body;
    //Removing the '-' in the official name in the object : 
    newHero.name = newHero.name.toLowerCase().replace('-', ' ')

    //Guard 
    if (heroExists === false) {
        return res.status(404).json({message : `This hero doesn't exist.` });
    }
    //Find hero : 
    let hero = superHerosData.find(hero => {
        return hero.name.toLowerCase().replace(' ', '-') === req.params.name;
    })

    //Modify function : 
    for( let i = 0; i < superHerosData.length; i++){ 
        if ( superHerosData[i].name.toLowerCase().replace(' ', '-') === req.params.name ) { 
            superHerosData[i] = newHero; //New data from user's request 
        }
    }

    hero = newHero;
    hero.name.toLowerCase().replace('-', ' ');

    return res.status(201).json({
        message : `${heroExists.replace('-', ' ')} successfully modified ! `,
        hero});
})

//GET a superhero's superpowers  -------------- 
router.get('/:name/powers',transformName, checkIfHeroExists, (req,res) => {

            const heroExists  = req.params.name;
            const powerExists = req.params.power;
        
            //Guards : 
            if (heroExists === false) {
                console.log("heroExist === false");
                return res.status(404).json({message : `This hero doesn't exist.` });
            }
    
            if (powerExists === false) {
                return res.status(404).json({message : `This power doesn't exist.` });
            }

            const hero = superHerosData.find(hero => {
                return hero.name.toLowerCase().replace(' ', '-') === req.params.name;
            })
            return res.status(201).json({powers : hero.power});
})

//PATCH (MODIFY) A SUPERHERO'S SUPERPOWERS  -------------- 
router.patch('/:name/powers',validatePowerHero,transformName, checkIfHeroExists, (req,res) => {
    const heroExists  = req.params.name;
    
    //Guards : 
    if (heroExists === false) {
        console.log("heroExist === false");
        return res.status(404).json({message : `This hero doesn't exist.` });
    }

    const hero = superHerosData.find(hero => {
        return hero.name.toLowerCase().replace(' ', '-') === req.params.name;
    })

    hero.power.push(req.body.power);

    return res.status(201).json({
        message : "Pouvoir ajouté !",
       hero});
})


//DELETE A POWER  -------------- 
//If the name of the superhero is in the superHeros's list,its selected power gets deleted : 
router.delete('/:name/power/:power',
    transformName, 
    checkIfHeroExists,
    transformPowerToLowerCase, 
    checkIfPowerExists, (req,res) => {
        
    let heroExists  = req.params.name;
    let powerExists = req.params.power;

    //Guards : 
    if (heroExists === false) {
        return res.status(404).json({message : `This hero doesn't exist.` });
    }

    if (powerExists === false) {
        return res.status(404).json({message : `This power doesn't exist.` });
    }

    //Find hero:
    const hero = superHerosData.find(hero => {
        return hero.name.toLowerCase().replace(" ", "-")  === req.params.name ;
    } )

    //Delete function : 
    for( let i = 0; i < hero.power.length; i++){ 
        if ( hero.power[i] === req.params.power ) { 
            hero.power.splice(i, 1); 
        }
    }

    return res.status(201).json({
        message : `${powerExists} power successfully deleted from ${heroExists.replace('-', ' ')} !`, 
        hero});
})


// Exporting the router
module.exports = router;