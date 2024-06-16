package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type Ingredient struct {
	ID   primitive.ObjectID `json:"id" bson:"_id"`
	Name string             `json:"name" bson:"name"`
}

type Recipe struct {
	ID          primitive.ObjectID `json:"id" bson:"_id"`
	Name        string             `json:"name" bson:"name"`
	Description string             `json:"description" bson:"description"`
	Cuisine     string             `json:"cuisine" bson:"cuisine"`
	TypeOf      int                `json:"type_of" bson:"type_of"`
	Image       string             `json:"image" bson:"image"`
	Ingredients []string           `json:"ingredients" bson:"ingredients"`
	Difficulty  string             `json:"difficulty" bson:"difficulty"`
	Restriction []string           `json:"restriction" bson:"restriction"`
	Premium     bool               `json:"premium" bson:"premium"`
	Percentage  float64            `json:"percentage" bson:"percentage"`
}

type User struct {
	Name         string   `json:"name" bson:"name"`
	Email        string   `json:"email" bson:"email"`
	Password     string   `json:"password" bson:"password"`
	Ingredients  []string `json:"ingredients" bson:"ingredients"`
	Restriction  []string `json:"restriction" bson:"restriction"`
	LikedRecipes []string `json:"liked_recipes" bson:"liked_recipes"`
	Premium      bool     `json:"premium" bson:"premium"`
}
