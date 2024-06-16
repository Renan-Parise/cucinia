package db

import (
	"context"
	"cucinia/model"
	"errors"
	"log"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type DB interface {
	GetIngredients() ([]*model.Ingredient, error)
	GetIngredientByID(id string) (*model.Ingredient, error)
	CreateIngredient(ingredient *model.Ingredient) error
	UpdateIngredient(id string, ingredient *model.Ingredient) error
	DeleteIngredient(id string) error

	GetRecipes() ([]*model.Recipe, error)
	GetRecipeByID(id string) (*model.Recipe, error)
	GetRecipesByCuisine(cuisine string) ([]*model.Recipe, error)
	GetRecipesByTypeOf(typeOf string) ([]*model.Recipe, error)
	GetRecipesByIngredient(ingredient string) ([]*model.Recipe, error)

	CreateRecipe(recipe *model.Recipe) error
	UpdateRecipe(id string, recipe *model.Recipe) error
	DeleteRecipe(id string) error
	GetRecipesByMultipleCriteria(excludedRestriction []string, ingredient, typeOf, cuisine string) ([]*model.Recipe, error)

	CreateUser(user *model.User) error
	DeleteUser(email string) error
	AddUserIngredient(email string, ingredient string) error
	RemoveUserIngredient(email string, ingredient string) error
	RemoveAllUserIngredients(email string) error

	LikeRecipe(email string, recipeID string) error
	UnlikeRecipe(email string, recipeID string) error

	GetAllUsers() ([]*model.User, error)
	GetUserByEmail(email string) (*model.User, error)
}

type MongoDB struct {
	ingredientCollection *mongo.Collection
	recipeCollection     *mongo.Collection
	userCollection       *mongo.Collection
}

func NewMongo(client *mongo.Client) DB {
	ingredientCollection := client.Database("cucinia").Collection("ingredients")
	recipeCollection := client.Database("cucinia").Collection("recipes")
	userCollection := client.Database("cucinia").Collection("users")

	_, err := userCollection.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		log.Fatal(err)
	}

	return &MongoDB{
		ingredientCollection: ingredientCollection,
		recipeCollection:     recipeCollection,
		userCollection:       userCollection,
	}
}

func (m MongoDB) GetIngredients() ([]*model.Ingredient, error) {
	cursor, err := m.ingredientCollection.Find(context.TODO(), bson.M{})
	if err != nil {
		log.Println("erro no fetch das receitas:", err.Error())
		return nil, err
	}
	defer cursor.Close(context.Background())

	var ingredients []*model.Ingredient
	if err := cursor.All(context.Background(), &ingredients); err != nil {
		log.Println("erro decodificando ingredientes:", err.Error())
		return nil, err
	}

	return ingredients, nil
}

func (m MongoDB) GetIngredientByID(id string) (*model.Ingredient, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var ingredient model.Ingredient
	err = m.ingredientCollection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&ingredient)
	if err != nil {
		return nil, err
	}

	return &ingredient, nil
}

func (m MongoDB) GetIngredientByName(name string) (*model.Ingredient, error) {
	var ingredient model.Ingredient
	err := m.ingredientCollection.FindOne(context.TODO(), bson.M{"name": name}).Decode(&ingredient)
	if err != nil {
		return nil, err
	}

	return &ingredient, nil
}

func (m MongoDB) GetIngredientsByRestriction(restriction string) ([]*model.Ingredient, error) {
	cursor, err := m.ingredientCollection.Find(context.TODO(), bson.M{"restriction": bson.M{"$not": primitive.Regex{Pattern: restriction, Options: "i"}}})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var ingredients []*model.Ingredient
	if err := cursor.All(context.Background(), &ingredients); err != nil {
		return nil, err
	}

	return ingredients, nil
}

func (m MongoDB) CreateIngredient(ingredient *model.Ingredient) error {
	ingredient.ID = primitive.NewObjectID()

	existingIngredient := m.ingredientCollection.FindOne(context.TODO(), bson.M{"name": ingredient.Name})
	if existingIngredient.Err() == nil {
		_, err := m.ingredientCollection.UpdateOne(context.TODO(), bson.M{"name": ingredient.Name}, bson.M{"$set": ingredient})
		if err != nil {
			return err
		}
		return nil
	} else if existingIngredient.Err() != nil && existingIngredient.Err() != mongo.ErrNoDocuments {
		return existingIngredient.Err()
	}

	_, err := m.ingredientCollection.InsertOne(context.TODO(), ingredient)
	if err != nil {
		return err
	}

	return nil
}

func (m MongoDB) UpdateIngredient(id string, ingredient *model.Ingredient) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID inválido")
	}

	_, err = m.ingredientCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": objID},
		bson.M{"$set": bson.M{"name": ingredient.Name}},
	)
	if err != nil {
		return err
	}

	return nil
}

func (m MongoDB) DeleteIngredient(id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID inválido")
	}

	_, err = m.ingredientCollection.DeleteOne(context.TODO(), bson.M{"_id": objID})
	if err != nil {
		return errors.New("o ingrediente não foi encontrado")
	}

	return nil
}

func (m MongoDB) GetRecipes() ([]*model.Recipe, error) {
	cursor, err := m.recipeCollection.Find(context.TODO(), bson.M{})
	if err != nil {
		log.Println("erro no fetch das receitas:", err.Error())
		return nil, err
	}
	defer cursor.Close(context.Background())

	var recipes []*model.Recipe
	if err := cursor.All(context.Background(), &recipes); err != nil {
		log.Println("erro decodificando as receitas:", err.Error())
		return nil, err
	}

	return recipes, nil
}

func (m MongoDB) GetRecipeByID(id string) (*model.Recipe, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Println("Invalid ID:", err.Error())
		return nil, err
	}

	var recipe model.Recipe
	err = m.recipeCollection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&recipe)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		log.Println("Error while fetching recipe by ID:", err.Error())
		return nil, err
	}

	return &recipe, nil
}

func (m MongoDB) GetRecipesByCuisine(cuisine string) ([]*model.Recipe, error) {
	cursor, err := m.recipeCollection.Find(context.TODO(), bson.M{"cuisine": cuisine})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var recipes []*model.Recipe
	if err := cursor.All(context.Background(), &recipes); err != nil {
		return nil, err
	}

	if len(recipes) == 0 {
		return nil, errors.New("nenhuma receita encontrada com a culinária especificada")
	}

	return recipes, nil
}

func (m MongoDB) GetRecipesByTypeOf(typeOf string) ([]*model.Recipe, error) {
	cursor, err := m.recipeCollection.Find(context.TODO(), bson.M{"type_of": typeOf})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var recipes []*model.Recipe
	if err := cursor.All(context.Background(), &recipes); err != nil {
		return nil, err
	}

	if len(recipes) == 0 {
		return nil, errors.New("nenhuma receita encontrada com o tipo especificado")
	}

	return recipes, nil
}

func (m MongoDB) GetRecipesByIngredient(ingredient string) ([]*model.Recipe, error) {
	cursor, err := m.recipeCollection.Find(context.TODO(), bson.M{"ingredients": bson.M{"$regex": ingredient}})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var recipes []*model.Recipe
	if err := cursor.All(context.Background(), &recipes); err != nil {
		return nil, err
	}

	if len(recipes) == 0 {
		return nil, errors.New("nenhuma receita encontrada com o ingrediente especificado")
	}

	return recipes, nil
}

func (m MongoDB) CreateRecipe(recipe *model.Recipe) error {
	recipe.ID = primitive.NewObjectID()

	existingRecipe := m.recipeCollection.FindOne(context.TODO(), bson.M{"name": recipe.Name})
	if existingRecipe.Err() == nil {
		return errors.New("A receita '" + recipe.Name + "' já existe")
	} else if existingRecipe.Err() != nil && existingRecipe.Err() != mongo.ErrNoDocuments {
		return existingRecipe.Err()
	}

	ingredientsString := strings.Join(recipe.Ingredients, ",")
	ingredientsList := strings.Split(ingredientsString, ",")
	for _, ingredientName := range ingredientsList {
		exactIngredient := strings.TrimSpace(ingredientName)
		count, err := m.ingredientCollection.CountDocuments(context.TODO(), bson.M{"name": exactIngredient})
		if err != nil {
			return err
		}
		if count == 0 {
			return errors.New("Ingrediente '" + exactIngredient + "' não existe")
		}
	}

	validRestrictions := map[string]bool{
		"vegano":      true,
		"vegetariano": true,
		"laticinio":   true,
		"gluten":      true,
	}
	for _, restriction := range recipe.Restriction {
		if !validRestrictions[restriction] {
			return errors.New("restrição '" + restriction + "' inválida")
		}
	}

	validCuisines := map[string]bool{"italiana": true, "francesa": true, "brasileira": true}
	if !validCuisines[recipe.Cuisine] {
		return errors.New("culinária '" + recipe.Cuisine + "' não é válida")
	}

	_, err := m.recipeCollection.InsertOne(context.TODO(), recipe)
	if err != nil {
		return err
	}

	return nil
}

func (m MongoDB) UpdateRecipe(id string, recipe *model.Recipe) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID inválido")
	}

	var existingRecipe model.Recipe
	err = m.recipeCollection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&existingRecipe)
	if err != nil {
		return errors.New("receita não encontrada")
	}

	validRestrictions := map[string]bool{
		"vegano":      true,
		"vegetariano": true,
		"laticinio":   true,
		"gluten":      true,
	}
	for _, restriction := range recipe.Restriction {
		if !validRestrictions[restriction] {
			return errors.New("restrição '" + restriction + "' inválida")
		}
	}

	update := bson.M{
		"$set": bson.M{
			"name":        recipe.Name,
			"description": recipe.Description,
			"cuisine":     recipe.Cuisine,
			"type_of":     recipe.TypeOf,
			"image":       recipe.Image,
			"ingredients": recipe.Ingredients,
			"difficulty":  recipe.Difficulty,
			"restriction": recipe.Restriction,
			"percentage":  recipe.Percentage,
		},
	}

	updatedRecipe := m.recipeCollection.FindOneAndUpdate(context.TODO(), bson.M{"_id": objID}, update)
	if updatedRecipe.Err() != nil {
		return errors.New("receita não encontrada")
	}

	return nil
}

func (m MongoDB) DeleteRecipe(id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID inválido")
	}

	_, err = m.recipeCollection.DeleteOne(context.TODO(), bson.M{"_id": objID})
	if err != nil {
		return errors.New("receita não encontrada")
	}

	return nil
}

func (m MongoDB) GetRecipesByMultipleCriteria(excludedRestrictions []string, ingredient, typeOf, cuisine string) ([]*model.Recipe, error) {
	filter := bson.M{}

	if typeOf != "" {
		filter["type_of"] = typeOf
	}

	if cuisine != "" {
		filter["cuisine"] = cuisine
	}

	excludedRestriction := strings.Split(strings.Join(excludedRestrictions, ""), ",")

	if len(excludedRestriction) > 0 {
		validRestrictions := map[string]bool{
			"vegano":      false,
			"vegetariano": false,
			"laticinio":   false,
			"gluten":      false,
		}

		for _, restriction := range excludedRestriction {
			validRestrictions[restriction] = true
		}

		allowedRestrictions := []string{}
		for restriction, allowed := range validRestrictions {
			if allowed {
				allowedRestrictions = append(allowedRestrictions, restriction)
			}
		}

		if len(allowedRestrictions) > 0 {
			filter["restriction"] = bson.M{"$nin": allowedRestrictions}
		}
	}

	var ingredients []string

	if ingredient != "" {
		ingredients = strings.Split(strings.ToLower(ingredient), ",")
		ingredientFilters := []bson.M{}
		for _, ing := range ingredients {
			ingLower := strings.TrimSpace(ing)
			ingredientFilters = append(ingredientFilters, bson.M{"ingredients": bson.M{"$regex": primitive.Regex{Pattern: ingLower, Options: "i"}}})
		}
		filter["$or"] = ingredientFilters
	} else {
		return nil, nil
	}

	cursor, err := m.recipeCollection.Find(context.TODO(), filter)
	if err != nil {
		return nil, errors.New("error fetching recipes")
	}
	defer cursor.Close(context.Background())

	var recipes []*model.Recipe
	if err := cursor.All(context.Background(), &recipes); err != nil {
		return nil, errors.New("internal server error")
	}

	if len(recipes) == 0 {
		return nil, errors.New("no recipes found with the specified criteria")
	}

	for _, recipe := range recipes {
		count := 0
		for _, queryIng := range ingredients {
			for _, ing := range recipe.Ingredients {
				if strings.ToLower(ing) == queryIng {
					count++
					break
				}
			}
		}
		recipe.Percentage = (float64(count) / float64(len(recipe.Ingredients))) * 100
	}

	return recipes, nil
}

func (m MongoDB) CreateUser(user *model.User) error {
	_, err := m.userCollection.InsertOne(context.Background(), user)
	if err != nil {
		log.Println("Failed to create user:", err)
		return errors.New("Failed to create user")
	}
	return nil
}

func (m MongoDB) DeleteUser(email string) error {
	_, err := m.userCollection.DeleteOne(context.Background(), bson.M{"email": email})
	if err != nil {
		log.Println("Failed to delete user:", err)
		return errors.New("Failed to delete user")
	}
	return nil
}

func (m MongoDB) GetAllUsers() ([]*model.User, error) {
	cursor, err := m.userCollection.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var users []*model.User
	if err := cursor.All(context.Background(), &users); err != nil {
		return nil, err
	}

	return users, nil
}

func (m MongoDB) GetUserByEmail(email string) (*model.User, error) {
	var user model.User
	err := m.userCollection.FindOne(context.Background(), bson.M{"email": email}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (m MongoDB) AddUserIngredient(email string, ingredient string) error {
	user, err := m.GetUserByEmail(email)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("User not found")
	}

	for _, ing := range user.Ingredients {
		if strings.EqualFold(ing, ingredient) {
			return errors.New("Ingredient already exists for the user")
		}
	}

	user.Ingredients = append(user.Ingredients, ingredient)

	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{"ingredients": user.Ingredients}}
	_, err = m.userCollection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return err
	}

	return nil
}

func (m MongoDB) RemoveUserIngredient(email string, ingredient string) error {
	user, err := m.GetUserByEmail(email)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("User not found")
	}

	updatedIngredients := make([]string, 0)
	for _, ing := range user.Ingredients {
		if ing != ingredient {
			updatedIngredients = append(updatedIngredients, ing)
		}
	}

	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{"ingredients": updatedIngredients}}
	_, err = m.userCollection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return err
	}

	return nil
}

func (m MongoDB) RemoveAllUserIngredients(email string) error {
	user, err := m.GetUserByEmail(email)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("User not found")
	}

	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{"ingredients": []string{}}}

	_, err = m.userCollection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return err
	}

	return nil
}

func (m MongoDB) LikeRecipe(email string, recipeID string) error {
	user, err := m.GetUserByEmail(email)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("User not found")
	}

	for _, likedRecipeID := range user.LikedRecipes {
		if likedRecipeID == recipeID {
			return errors.New("Recipe already liked by the user")
		}
	}

	user.LikedRecipes = append(user.LikedRecipes, recipeID)

	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{"liked_recipes": user.LikedRecipes}}
	_, err = m.userCollection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return err
	}

	return nil
}

func (m MongoDB) UnlikeRecipe(email string, recipeID string) error {
	user, err := m.GetUserByEmail(email)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("User not found")
	}

	updatedLikedRecipes := make([]string, 0)
	for _, likedRecipeID := range user.LikedRecipes {
		if likedRecipeID != recipeID {
			updatedLikedRecipes = append(updatedLikedRecipes, likedRecipeID)
		}
	}

	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{"liked_recipes": updatedLikedRecipes}}
	_, err = m.userCollection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return err
	}

	return nil
}
