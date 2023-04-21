require("../models/database");
const Category = require("../models/category");
const recipe = require("../models/recipe");
const Recipe = require('../models/recipe');
const User = require('../models/User');
const jwt = require('jsonwebtoken');


//handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  // incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'That email is not registered';
  }

  // incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'That password is incorrect';
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}


/**
 * GET /
 * Homepage
 */
exports.homepage = async (req, res) => {
  try {
    const limitNumber = 5;
    const categories = await Category.find({}).limit(limitNumber);
    const latest = await Recipe.find({}).sort({_id: -1}).limit(limitNumber);
    const thai = await Recipe.find({ 'category': 'Thai' }).limit(limitNumber);
    const american = await Recipe.find({ 'category': 'American' }).limit(limitNumber);
    const chinese = await Recipe.find({ 'category': 'Chinese' }).limit(limitNumber);

    const food = {latest, thai, american, chinese};

    res.render("index", { title: "Cooking Blog - Home", categories, food });
  } catch (error) {
    res.satus(500).send({ message: error.message || "Error Occured" });
  }
};

/**
 * GET /categories
 * Categories 
*/
exports.exploreCategories = async(req, res) => {
  try {
    const limitNumber = 20;
    const categories = await Category.find({}).limit(limitNumber);
    res.render('categories', { title: 'Cooking Blog - Categoreis', categories } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
} 

/**
 * GET /recipe/:id
 * Recipe 
*/
exports.exploreRecipe = async(req, res) => {
  try {
    let recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    res.render('recipe', { title: 'Cooking Blog - Recipe', recipe } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
} 

/**
 * GET /categories/:id
 * Categories By Id
*/
exports.exploreCategoriesById = async(req, res) => { 
  try {
    let categoryId = req.params.id;
    const limitNumber = 20;
    const categoryById = await Recipe.find({ 'category': categoryId }).limit(limitNumber);
    res.render('categories', { title: 'Cooking Blog - Categoreis', categoryById } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
} 

/**
 * POST /search
 * Search 
*/
exports.searchRecipe = async(req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    let recipe = await Recipe.find( { $text: { $search: searchTerm, $diacriticSensitive: true } });
    res.render('search', { title: 'Cooking Blog - Search', recipe } );
    // res.json(recipe);
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
  
}

/**
 * GET /explore-latest
 * Explplore Latest 
*/
exports.exploreLatest = async(req, res) => {
  try {
    const limitNumber = 20;
    const recipe = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    res.render('explore-latest', { title: 'Cooking Blog - Explore Latest', recipe } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
} 

/**
 * GET /explore-random
 * Explore Random as JSON
*/
exports.exploreRandom = async(req, res) => {
  try {
    let count = await Recipe.find().countDocuments();
    let random = Math.floor(Math.random() * count);
    let recipe = await Recipe.findOne().skip(random).exec();
    res.render('recipe', { title: 'Cooking Blog - Explore Latest', recipe } );
    // res.json(recipe)
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }
} 

/**
 * GET /submit-recipe
 * Submit Recipe
*/
exports.submitRecipe = async(req, res) => {
  const infoErrorsObj = req.flash('infoErrors');
  const infoSubmitObj = req.flash('infoSubmit');
  res.render('submit-recipe', { title: 'Cooking Blog - Submit Recipe', infoErrorsObj, infoSubmitObj} );
}

/**
 * POST /submit-recipe
 * Submit Recipe
*/
exports.submitRecipeOnPost = async(req, res) => {
  try {

    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if(!req.files || Object.keys(req.files).length === 0){
      console.log('No Files where uploaded.');
    } else {

      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

      imageUploadFile.mv(uploadPath, function(err){
        if(err) return res.satus(500).send(err);
      })

    }

    const newRecipe = new Recipe({
      name: req.body.name,
      description: req.body.description,
      email: req.body.email,
      ingredients: req.body.ingredients,
      category: req.body.category,
      image: newImageName
    });
    
    await newRecipe.save();

    req.flash('infoSubmit', 'Recipe has been added.')
    res.redirect('/submit-recipe');
  } catch (error) {
    // res.json(error);
    req.flash('infoErrors', error);
    res.redirect('/submit-recipe');
  }
}

/**
 * GET /about
 * About Page
*/
exports.about = async(req, res) => {
  res.render('about', { title: 'Cooking Blog - About'  } );
}

//create jsonwebtoken
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'net ninja secret', {
    expiresIn: maxAge
  });
};

/**
 * GET /login
 * Login page
*/
exports.login = async(req, res) => {
  const infoErrorsObj = req.flash('infoErrors');
  const infoSubmitObj = req.flash('infoSubmit');

  res.render('login', { title: 'Cooking Blog - Login', infoErrorsObj, infoSubmitObj } );
}

exports.login_post = async (req, res) =>{
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000});
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({errors});
  }
}

/**
 * GET /signup
 * Signup page
*/
exports.signup = async(req, res) => {
  const infoErrorsObj = req.flash('infoErrors');
  const infoSubmitObj = req.flash('infoSubmit');
  res.render('signup', { title: 'Cooking Blog - Signup', infoErrorsObj, infoSubmitObj  } );
}

exports.signup_post = async (req, res) =>{
  const{email, password} = req.body;

  try{
    const user = await User.create({email, password});
    const token = createToken(user._id);
    res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000});
    res.status(201).json({user: user._id});
  }
  catch (err) {
    const errors = handdleErrors(err);
    res.status(400).json({errors});
  }
}

exports.logout = async (req, res) =>{
  res.cookie('jwt', '', {maxAge: 1});
  res.redirect('/');
}


/**
 * GET /my-recipes
 * My Recipe Page
*/
exports.myRecipes = async(req, res) => {
  // try {
  //   const limitNumber = 20;
  //   const recipe = await Recipe.find({ email: "abcmyrcp@gmail.com" }).limit(limitNumber);
  //   res.render('my-recipes', { title: 'Cooking Blog - My Recipes', recipe } );
  // } catch (error) {
  //   res.satus(500).send({message: error.message || "Error Occured" });
  // }

  try {
    let userEmail = req.params.email;
    const limitNumber = 20;
    const myRecipesEmail = await Recipe.find({ 'email': userEmail }).limit(limitNumber);
    res.render('my-recipes', { title: 'Cooking Blog - Categoreis', myRecipesEmail } );
  } catch (error) {
    res.satus(500).send({message: error.message || "Error Occured" });
  }

} 

/**
 * POST /my-recipes
 * DELETE RECIPE function
*/
exports.deleteRecipeOnPost = async(req, res) => {
  try {
    let recipeId = req.body.recipeId;
    const recipe = await Recipe.deleteOne({ _id: recipeId });
    res.redirect('/my-recipes');
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occured" });
  }
}

/**
 * GET /edit-my-recipes
 * Edit My Recipe Page
*/
exports.editMyRecipes = async(req, res) => {
  const infoErrorsObj = req.flash('infoErrors');
  const infoSubmitObj = req.flash('infoSubmit');
  try {
    let recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    res.render('edit-my-recipes', { title: 'Cooking Blog - Submit Recipe', infoErrorsObj, infoSubmitObj, recipe} );
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error'); // Handle server error
  }
} 

/**
 * POST /update-my-recipes
 * Update My Recipe Page
*/

exports.updateRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id; // Get the recipe ID from request parameters
    const { name, description, ingredients, category, image } = req.body; // Get updated recipe data from request body

    // Split ingredients string by comma and store as array
    const ingredientsArray = ingredients.split(',').map(ingredient => ingredient.trim());

    if(!req.files || Object.keys(req.files).length === 0){
      console.log('No Files where uploaded.');
    } else {

      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

      imageUploadFile.mv(uploadPath, function(err){
        if(err) return res.satus(500).send(err);
      })

    }


    // Update the recipe in the database
    const updatedRecipe = await Recipe.findByIdAndUpdate(recipeId, {
      name,
      description,
      ingredients: ingredientsArray, // Use the updated ingredients array
      category,
      image: newImageName
    }, { new: true });

    // If recipe is not found
    if (!updatedRecipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    res.redirect('/my-recipes');
    // return res.status(200).json({
    //   success: true,
    //   message: 'Recipe updated successfully',
    //   recipe: updatedRecipe,
    // });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error updating recipe',
      error: err.message
    });
  }
};

/**
 * GET /user-recipes
 * User Recipe Page
*/
exports.exploreUserRecipes = async(req, res) => {
  try {
    let recipeEmail = req.params.email;
    const recipe = await Recipe.find({ 'email': recipeEmail });
    res.render('user-recipe', { title: 'Cooking Blog - My Recipes', recipe } );
  } catch (error) {
    res.status(500).send({message: error.message || "Error Occurred" });
  }
}
