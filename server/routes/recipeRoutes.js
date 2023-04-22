const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");
const { requireAuth, checkUser } = require("../middleware/authMiddleware.js");

/* 
    app routes
*/
//router.get("*",recipeController.checkUser)
router.get("/", checkUser, recipeController.homepage);
router.get("/categories", checkUser, recipeController.exploreCategories);
router.get('/recipe/:id', checkUser, recipeController.exploreRecipe );
router.get('/categories/:id', checkUser, recipeController.exploreCategoriesById);
router.post('/search', checkUser, recipeController.searchRecipe);
router.get('/explore-latest', checkUser, recipeController.exploreLatest);
router.get('/explore-random', checkUser, recipeController.exploreRandom);
router.get('/submit-recipe', checkUser, recipeController.submitRecipe);
router.get('/about', checkUser, recipeController.about);
router.get('/login', checkUser, recipeController.login);
router.post('/login', checkUser, recipeController.login_post);
router.get('/signup', checkUser, recipeController.signup);
router.post('/signup', checkUser, recipeController.signup_post);
router.get('/logout', checkUser, recipeController.logout);
router.post('/submit-recipe', checkUser, recipeController.submitRecipeOnPost);
router.get('/my-recipes/:email', checkUser, recipeController.myRecipes);
router.get('/user-recipes/:email', checkUser, recipeController.exploreUserRecipes);



router.get('/edit-my-recipes/:id', checkUser, recipeController.editMyRecipes);
router.post('/update-recipes/:id', checkUser, recipeController.updateRecipe);
router.post('/delete-recipes/:id', checkUser, recipeController.deleteRecipeOnPost);


module.exports = router;
