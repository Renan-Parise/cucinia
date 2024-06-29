package web

import (
	ai "cucinia/ai"
	"cucinia/db"
	"cucinia/model"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis"
	"golang.org/x/crypto/bcrypt"
)

type App struct {
	d      db.DB
	rdb    *redis.Client
	router *gin.Engine
}

func NewApp(d db.DB, rdb *redis.Client, cors bool) *App {
	app := &App{
		d:      d,
		rdb:    rdb,
		router: gin.Default(),
	}

	app.setupRoutes(cors)
	return app
}

func (a *App) setupRoutes(cors bool) {
	if cors {
		a.router.Use(func(c *gin.Context) {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
			c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
			c.Writer.Header().Set("ngrok-skip-browser-warning", "true")
			if c.Request.Method == "OPTIONS" {
				c.AbortWithStatus(http.StatusOK)
				return
			}
			c.Next()
		})
	}

	api := a.router.Group("/api/v1")
	{
		api.GET("/ingredients", a.GetIngredients)
		api.GET("/ingredients/:id", a.GetIngredientByID)
		api.POST("/ingredients", a.CreateIngredient)
		api.PATCH("/ingredients/:id", a.UpdateIngredient)
		api.DELETE("/ingredients/:id", a.DeleteIngredient)

		api.GET("/recipes", a.GetRecipes)
		api.GET("/recipes/by-cuisine/:cuisine", a.GetRecipesByCuisine)
		api.GET("/recipes/by-id/:id", a.GetRecipeByID)
		api.GET("/recipes/by-type/:type", a.GetRecipesByTypeOf)
		api.GET("/recipes/by-ingredient/:ingredient", a.GetRecipesByIngredient)
		api.GET("/recipes/by-multiple-criteria", a.GetRecipesByMultipleCriteria)
		api.POST("/recipes", a.CreateRecipe)
		api.PATCH("/recipes/:id", a.UpdateRecipe)
		api.DELETE("/recipes/:id", a.DeleteRecipe)

		api.POST("/register", a.RegisterUser)
		api.POST("/login", a.LoginUser)
		api.DELETE("/users/:email", a.DeleteUser)

		api.GET("/users", a.GetUsers)
		api.GET("/users/:email", a.GetUserByEmail)
		api.GET("/users/liked-recipes", a.GetUserLikedRecipes)

		api.POST("/user-ingredients/add", a.AddUserIngredient)
		api.POST("/user-ingredients/remove", a.RemoveUserIngredient)
		api.DELETE("/user-ingredients/remove/all", a.RemoveAllUserIngredients)

		api.POST("/like-recipe", a.LikeRecipe)
		api.POST("/unlike-recipe", a.UnlikeRecipe)

		api.POST("/upgrade", a.UpgradeToPremium)

		api.POST("/gen", a.Gemini)
	}
}

func (a *App) Serve() error {
	log.Println("Servidor disponível na porta: 8080")
	return a.router.Run(":8080")
}

func (a *App) GetIngredients(c *gin.Context) {
	val, err := a.rdb.Get("ingredients").Result()
	if err == redis.Nil {
		ingredients, err := a.d.GetIngredients()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ingredientsJSON, err := json.Marshal(ingredients)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		a.rdb.Set("ingredients", ingredientsJSON, 0)
		c.JSON(http.StatusOK, ingredients)
	} else {
		var ingredients []*model.Ingredient
		if err := json.Unmarshal([]byte(val), &ingredients); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, ingredients)
	}
}

func (a *App) GetIngredientByID(c *gin.Context) {
	id := c.Param("id")

	val, err := a.rdb.Get("ingredient:" + id).Result()
	if err == nil {
		var ingredient model.Ingredient
		if err := json.Unmarshal([]byte(val), &ingredient); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, ingredient)
		return
	}

	ingredient, err := a.d.GetIngredientByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ingredientJSON, err := json.Marshal(ingredient)
	if err == nil {
		a.rdb.Set("ingredient:"+id, ingredientJSON, 0)
	}

	c.JSON(http.StatusOK, ingredient)
}

func (a *App) CreateIngredient(c *gin.Context) {
	var ingredient model.Ingredient
	if err := c.ShouldBindJSON(&ingredient); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := a.d.CreateIngredient(&ingredient); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	a.rdb.Del("ingredients")

	c.JSON(http.StatusCreated, ingredient)
}

func (a *App) UpdateIngredient(c *gin.Context) {
	id := c.Param("id")
	var ingredient model.Ingredient
	if err := c.ShouldBindJSON(&ingredient); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	a.rdb.Del("ingredient:" + id)

	existingIngredient, err := a.d.GetIngredientByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao fazer fetch dos ingredientes."})
		return
	}
	if existingIngredient == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ingrediente não encontrado."})
		return
	}

	if err := a.d.UpdateIngredient(id, &ingredient); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao atualizar os ingredientes."})
		return
	}

	updatedIngredient, err := a.d.GetIngredientByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao fazer fetch dos ingredientes."})
		return
	}

	ingredientJSON, err := json.Marshal(updatedIngredient)
	if err == nil {
		a.rdb.Set("ingredient:"+id, ingredientJSON, 0)
	}

	c.JSON(http.StatusOK, updatedIngredient)
}

func (a *App) DeleteIngredient(c *gin.Context) {
	id := c.Param("id")
	if err := a.d.DeleteIngredient(id); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	a.rdb.Del("ingredient:" + id)
	a.rdb.Del("ingredients")

	c.JSON(http.StatusNoContent, gin.H{})
}

func (a *App) GetRecipes(c *gin.Context) {
	val, err := a.rdb.Get("recipes").Result()
	if err == nil {
		var recipes []*model.Recipe
		if err := json.Unmarshal([]byte(val), &recipes); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, recipes)
		return
	}

	recipes, err := a.d.GetRecipes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	recipesJSON, err := json.Marshal(recipes)
	if err == nil {
		a.rdb.Set("recipes", recipesJSON, 0)
	}

	c.JSON(http.StatusOK, recipes)
}

func (a *App) GetRecipesByCuisine(c *gin.Context) {
	cuisine := c.Param("cuisine")

	val, err := a.rdb.Get("recipes:cuisine:" + cuisine).Result()
	if err == nil {
		var recipes []*model.Recipe
		if err := json.Unmarshal([]byte(val), &recipes); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, recipes)
		return
	}

	recipes, err := a.d.GetRecipesByCuisine(cuisine)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	recipesJSON, err := json.Marshal(recipes)
	if err == nil {
		a.rdb.Set("recipes:cuisine:"+cuisine, recipesJSON, 0)
	}

	c.JSON(http.StatusOK, recipes)
}

func (a *App) GetRecipeByID(c *gin.Context) {
	id := c.Param("id")

	val, err := a.rdb.Get("recipe:" + id).Result()
	if err == nil {
		var recipe *model.Recipe
		if err := json.Unmarshal([]byte(val), &recipe); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, recipe)
		return
	}

	recipe, err := a.d.GetRecipeByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	recipeJSON, err := json.Marshal(recipe)
	if err == nil {
		a.rdb.Set("recipe:"+id, recipeJSON, 0)
	}

	c.JSON(http.StatusOK, recipe)
}

func (a *App) GetRecipesByTypeOf(c *gin.Context) {
	typeOf := c.Param("type")

	val, err := a.rdb.Get("recipes:type:" + typeOf).Result()
	if err == nil {
		var recipes []*model.Recipe
		if err := json.Unmarshal([]byte(val), &recipes); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, recipes)
		return
	}

	recipes, err := a.d.GetRecipesByTypeOf(typeOf)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	recipesJSON, err := json.Marshal(recipes)
	if err == nil {
		a.rdb.Set("recipes:type:"+typeOf, recipesJSON, 0)
	}

	c.JSON(http.StatusOK, recipes)
}

func (a *App) GetRecipesByIngredient(c *gin.Context) {
	ingredient := c.Param("ingredient")

	val, err := a.rdb.Get("recipes:ingredient:" + ingredient).Result()
	if err == nil {
		var recipes []*model.Recipe
		if err := json.Unmarshal([]byte(val), &recipes); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, recipes)
		return
	}

	recipes, err := a.d.GetRecipesByIngredient(ingredient)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	recipesJSON, err := json.Marshal(recipes)
	if err == nil {
		a.rdb.Set("recipes:ingredient:"+ingredient, recipesJSON, 0)
	}

	c.JSON(http.StatusOK, recipes)
}

func (a *App) CreateRecipe(c *gin.Context) {
	var recipe model.Recipe
	if err := c.ShouldBindJSON(&recipe); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := a.d.CreateRecipe(&recipe); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	a.rdb.Del("recipes")

	c.JSON(http.StatusCreated, recipe)
}

func (a *App) UpdateRecipe(c *gin.Context) {
	id := c.Param("id")
	var recipe model.Recipe
	if err := c.ShouldBindJSON(&recipe); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := a.d.UpdateRecipe(id, &recipe); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	a.rdb.Del("recipe:" + id)

	c.JSON(http.StatusOK, recipe)
}

func (a *App) DeleteRecipe(c *gin.Context) {
	id := c.Param("id")
	if err := a.d.DeleteRecipe(id); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	a.rdb.Del("recipe:" + id)
	a.rdb.Del("recipes")

	c.JSON(http.StatusNoContent, gin.H{})
}

func (a *App) GetRecipesByMultipleCriteria(c *gin.Context) {
	excludedRestriction := c.Query("excluded_restriction")
	ingredient := c.Query("ingredient")
	typeOf := c.Query("type_of")
	cuisine := c.Query("cuisine")
	userPremium := c.Query("premium") == "true"

	cacheKey := buildRecipesCacheKey(excludedRestriction, ingredient, typeOf, cuisine, userPremium)

	val, err := a.rdb.Get(cacheKey).Result()
	if err == nil {
		var recipes []*model.Recipe
		if err := json.Unmarshal([]byte(val), &recipes); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, recipes)
		return
	}

	var excludedRestrictions []string
	if excludedRestriction != "" {
		excludedRestrictions = append(excludedRestrictions, excludedRestriction)
	}

	recipes, err := a.d.GetRecipesByMultipleCriteria(excludedRestrictions, ingredient, typeOf, cuisine, userPremium)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	filteredRecipes := filterRecipesByPremiumStatus(recipes, userPremium)

	recipesJSON, err := json.Marshal(filteredRecipes)
	if err == nil {
		a.rdb.Set(cacheKey, recipesJSON, 0)
	}

	c.JSON(http.StatusOK, filteredRecipes)
}

func filterRecipesByPremiumStatus(recipes []*model.Recipe, userPremium bool) []*model.Recipe {
	filteredRecipes := make([]*model.Recipe, 0)

	for _, recipe := range recipes {
		if userPremium || !recipe.Premium {
			filteredRecipes = append(filteredRecipes, recipe)
		}
	}

	return filteredRecipes
}

func buildRecipesCacheKey(excludedRestriction, ingredient, typeOf, cuisine string, userPremium bool) string {
	return fmt.Sprintf("recipes:excluded:%s:ingredient:%s:type:%s:cuisine:%s:premium:%t",
		excludedRestriction, ingredient, typeOf, cuisine, userPremium)
}

func (a *App) RegisterUser(c *gin.Context) {
	var user model.User

	if err := c.BindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payload inválido."})
		return
	}

	existingUser, err := a.d.GetUserByEmail(user.Email)
	if err == nil && existingUser != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Usuário já existe."})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao fazer o hashing."})
		return
	}
	user.Password = string(hashedPassword)

	if err := a.d.CreateUser(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao criar usuário."})
		return
	}

	err = a.invalidateUsersCache()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao limpar cache."})
		return
	}

	user.Password = ""

	c.JSON(http.StatusCreated, user)
}

func (a *App) LoginUser(c *gin.Context) {
	var credentials struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.BindJSON(&credentials); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := a.d.GetUserByEmail(credentials.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciais inválidas"})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(credentials.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciais inválidas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Login bem sucedido!", "user": user})
}

func (a *App) DeleteUser(c *gin.Context) {
	email := c.Param("email")

	err := a.d.DeleteUser(email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao apagar o usuário."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usuário apagado com sucesso."})
}

func (a *App) GetUsers(c *gin.Context) {
	val, err := a.rdb.Get("users").Result()
	if err == nil {
		var users []*model.User
		if err := json.Unmarshal([]byte(val), &users); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user data"})
			return
		}
		c.JSON(http.StatusOK, users)
		return
	}

	users, err := a.d.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	usersJSON, err := json.Marshal(users)
	if err == nil {
		a.rdb.Set("users", usersJSON, 0)
	}

	c.JSON(http.StatusOK, users)
}

func (a *App) GetUserByEmail(c *gin.Context) {
	email := c.Param("email")

	val, err := a.rdb.Get("user:" + email).Result()
	if err == nil {
		var user *model.User
		if err := json.Unmarshal([]byte(val), &user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user data"})
			return
		}

		user.Password = ""

		c.JSON(http.StatusOK, user)
		return
	}

	user, err := a.d.GetUserByEmail(email)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found."})
		return
	}

	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found."})
		return
	}

	userJSON, err := json.Marshal(user)
	if err == nil {
		a.rdb.Set("user:"+email, userJSON, 0)
	}

	user.Password = ""

	c.JSON(http.StatusOK, user)
}

func (a *App) AddUserIngredient(c *gin.Context) {
	var userIngredient struct {
		UserId     string `json:"email"`
		Ingredient string `json:"ingredient"`
	}

	if err := c.ShouldBindJSON(&userIngredient); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := a.d.AddUserIngredient(userIngredient.UserId, userIngredient.Ingredient)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	user, err := a.d.GetUserByEmail(userIngredient.UserId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated user"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ingredient added successfully", "user": user})
}

func (a *App) RemoveUserIngredient(c *gin.Context) {
	var userIngredient struct {
		UserId     string `json:"email"`
		Ingredient string `json:"ingredient"`
	}

	if err := c.ShouldBindJSON(&userIngredient); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := a.d.RemoveUserIngredient(userIngredient.UserId, userIngredient.Ingredient)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	user, err := a.d.GetUserByEmail(userIngredient.UserId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated user"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ingredient removed successfully", "user": user})
}

func (a *App) RemoveAllUserIngredients(c *gin.Context) {
	var request struct {
		Email string `json:"email"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if request.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email field is required"})
		return
	}

	err := a.d.RemoveAllUserIngredients(request.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear user ingredients"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All ingredients cleared successfully"})
}

func (a *App) LikeRecipe(c *gin.Context) {
	var likeRequest struct {
		UserId   string `json:"email"`
		RecipeID string `json:"recipe_id"`
	}

	if err := c.ShouldBindJSON(&likeRequest); err != nil {
		log.Println("Error binding JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := a.d.LikeRecipe(likeRequest.UserId, likeRequest.RecipeID)
	if err != nil {
		log.Println("Error liking recipe:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	user, err := a.d.GetUserByEmail(likeRequest.UserId)
	if err != nil {
		log.Println("Error fetching updated user:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated user"})
		return
	}
	if user == nil {
		log.Println("User not found")
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Recipe liked successfully", "user": user})
}

func (a *App) UnlikeRecipe(c *gin.Context) {
	var unlikeRequest struct {
		UserId   string `json:"email"`
		RecipeID string `json:"recipe_id"`
	}

	if err := c.ShouldBindJSON(&unlikeRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := a.d.UnlikeRecipe(unlikeRequest.UserId, unlikeRequest.RecipeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	user, err := a.d.GetUserByEmail(unlikeRequest.UserId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated user"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Recipe unliked successfully", "user": user})
}

func (a *App) GetUserLikedRecipes(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email parameter is required"})
		return
	}

	user, err := a.d.GetUserByEmail(email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}

	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var detailedRecipes []model.Recipe

	for _, recipeID := range user.LikedRecipes {
		recipe, err := a.d.GetRecipeByID(recipeID)
		if err != nil {
			log.Println("Error fetching recipe by ID:", err)
			continue
		}
		if recipe != nil {
			detailedRecipes = append(detailedRecipes, *recipe)
		}
	}

	c.JSON(http.StatusOK, gin.H{"liked_recipes": detailedRecipes})
}

func (a *App) getRecipeByIDWithCache(id string) (*model.Recipe, error) {
	val, err := a.rdb.Get("recipe:" + id).Result()
	if err == nil {
		var recipe model.Recipe
		if err := json.Unmarshal([]byte(val), &recipe); err != nil {
			return nil, err
		}
		return &recipe, nil
	}

	recipe, err := a.d.GetRecipeByID(id)
	if err != nil {
		return nil, err
	}

	recipeJSON, err := json.Marshal(recipe)
	if err == nil {
		a.rdb.Set("recipe:"+id, recipeJSON, 0)
	}

	return recipe, nil
}

func (a *App) UpgradeToPremium(c *gin.Context) {
	var upgradeRequest struct {
		Email string `json:"email"`
	}

	if err := c.ShouldBindJSON(&upgradeRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err := a.d.SetUserPremium(upgradeRequest.Email, true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := a.invalidateUserCache(upgradeRequest.Email); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cache"})
		return
	}

	user, err := a.d.GetUserByEmail(upgradeRequest.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated user"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User upgraded to premium", "user": user})
}

func (a *App) Gemini(c *gin.Context) {
	file, _, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	defer file.Close()

	out, err := os.CreateTemp("", "image-*.jpg")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer os.Remove(out.Name())
	defer out.Close()

	_, err = io.Copy(out, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	res := ai.SendImageFromFile(out.Name())
	ai.PrintResponse(res)
	c.JSON(http.StatusOK, res)
}

func (a *App) invalidateUsersCache() error {
	err := a.rdb.Del("users").Err()
	if err != nil {
		return err
	}
	return nil
}

func (a *App) invalidateUserCache(email string) error {
	key := "user:" + email
	err := a.rdb.Del(key).Err()
	if err != nil {
		return err
	}
	return nil
}
