# 2Chefs

## Environment setup

You need to have [Go](https://golang.org/),
[Node.js](https://nodejs.org/),
[Docker](https://www.docker.com/), and
[Docker Compose](https://docs.docker.com/compose/)
(comes pre-installed with Docker on Mac and Windows)
installed on your computer.

Verify the tools by running the following commands:

```sh
go version
npm --version
docker --version
docker-compose --version
```

If you are using Windows you will also need
[gcc](https://gcc.gnu.org/). It comes installed
on Mac and almost all Linux distributions.

## Start in development mode

In the project directory run the command (you might
need to prepend it with `sudo` depending on your setup):
```sh
docker-compose -f docker-compose-dev.yml up
```

This starts a local MongoDB on `localhost:27017`.
The database will be populated with test records
from the [init-db.js](init-db.js) file.

Navigate to the `backend` folder and start the back end:

```sh
cd backend
go run backend.go
```
The back end will serve on http://localhost:8080.

Navigate to the `frontend` folder, install dependencies,
and start the front end development backend by running:

```sh
cd frontend
npm install
npm start
```
The application will be available on http://localhost:3000.
 
## Start in production mode

Perform:
```sh
docker-compose up
```
This will build the application and start it together with
its database. Access the application on http://localhost:8080.

## API Routes Documentation

### Ingredients

#### GET /api/v1/ingredients

Method: GET

Description: Retrieve all ingredients.
Expected Response: JSON array of Ingredient objects.

#### GET /api/v1/ingredients/

Method: GET

Description: Retrieve an ingredient by ID.
URL Parameters:
id (string): ID of the ingredient.
Expected Response: JSON object of Ingredient.

#### POST /api/v1/ingredients

Method: POST

Description: Create a new ingredient.
Expected Payload:
```sh
{
  "name": "string",
  "description": "string"
}
```
Expected Response: JSON object of created Ingredient.

#### PATCH /api/v1/ingredients/

Method: PATCH

Description: Update an existing ingredient by ID.
URL Parameters:
id (string): ID of the ingredient to update.
Expected Payload: Same as POST /api/v1/ingredients
Expected Response: JSON object of updated Ingredient.

#### DELETE /api/v1/ingredients/

Method: DELETE

Description: Delete an ingredient by ID.
URL Parameters:
id (string): ID of the ingredient to delete.
Expected Response: No content (204).

## Recipes

#### GET /api/v1/recipes

Method: GET

Description: Retrieve all recipes.
Expected Response: JSON array of Recipe objects.

#### GET /api/v1/recipes/by-cuisine/

Method: GET

Description: Retrieve recipes by cuisine.
URL Parameters:
cuisine (string): Cuisine type.
Expected Response: JSON array of Recipe objects.

#### GET /api/v1/recipes/by-id/

Method: GET

Description: Retrieve a recipe by ID.
URL Parameters:
id (string): ID of the recipe.
Expected Response: JSON object of Recipe.

#### GET /api/v1/recipes/by-type/

Method: GET

Description: Retrieve recipes by type.
URL Parameters:
type (string): Type of recipe.
Expected Response: JSON array of Recipe objects.

#### GET /api/v1/recipes/by-ingredient/

Method: GET

Description: Retrieve recipes by ingredient.
URL Parameters:
ingredient (string): Ingredient name.
Expected Response: JSON array of Recipe objects.

#### GET /api/v1/recipes/by-multiple-criteria

Method: GET

Description: Retrieve recipes by multiple criteria.
Query Parameters:
excluded_restriction (string, optional): Excluded restriction.
ingredient (string, optional): Ingredient name.
type_of (string, optional): Type of recipe.
cuisine (string, optional): Cuisine type.
premium (boolean, optional): User premium status (true/false).
Expected Response: JSON array of filtered Recipe objects.

#### POST /api/v1/recipes

Method: POST

Description: Create a new recipe.
Expected Payload:
```sh
{
  "name": "string",
  "description": "string",
  "ingredients": ["string"],
  "type_of": "string",
  "cuisine": "string",
  "premium": bool
}
```
Expected Response: JSON object of created Recipe.

#### PATCH /api/v1/recipes/

Method: PATCH

Description: Update an existing recipe by ID.
URL Parameters:
id (string): ID of the recipe to update.
Expected Payload: Same as POST /api/v1/recipes
Expected Response: JSON object of updated Recipe.

#### DELETE /api/v1/recipes/

Method: DELETE

Description: Delete a recipe by ID.
URL Parameters:
id (string): ID of the recipe to delete.
Expected Response: No content (204).

## Users

#### POST /api/v1/register

Method: POST

Description: Register a new user.
Expected Payload:
```sh
{
  "email": "string",
  "password": "string"
}
```
Expected Response: JSON object of created User.

#### POST /api/v1/login

Method: POST

Description: Authenticate a user.
Expected Payload:
```sh
{
  "email": "string",
  "password": "string"
}
```
Expected Response: JSON object with login message and User details on success.

#### DELETE /api/v1/users/

Method: DELETE

Description: Delete a user by email.
URL Parameters:
email (string): Email of the user to delete.
Expected Response: No content (204).

#### GET /api/v1/users

Method: GET

Description: Retrieve all users.
Expected Response: JSON array of User objects.

#### GET /api/v1/users/

Method: GET

Description: Retrieve a user by email.
URL Parameters:
email (string): Email of the user to retrieve.
Expected Response: JSON object of User.

#### GET /api/v1/users/liked-recipes

Method: GET

Description: Retrieve liked recipes of a user.
Query Parameters:
email (string, required): Email of the user.
Expected Response: JSON array of Recipe objects.

## User Ingredients

#### POST /api/v1/user-ingredients/add

Method: POST

Description: Add an ingredient to a user's profile.
Expected Payload:
```sh
{
  "email": "string",
  "ingredient": "string"
}
```
Expected Response: JSON object with success message and updated User.

#### POST /api/v1/user-ingredients/remove

Method: POST

Description: Remove an ingredient from a user's profile.
Expected Payload:
```sh
{
  "email": "string",
  "ingredient": "string"
}
```
Expected Response: JSON object with success message and updated User.

#### DELETE /api/v1/user-ingredients/remove/all

Method: DELETE

Description: Remove all ingredients from a user's profile.
Expected Payload:
```sh
{
  "email": "string"
}
```
Expected Response: JSON object with success message.


## Recipe Actions

#### POST /api/v1/like-recipe

Method: POST

Description: Like a recipe for a user.
Expected Payload:
```sh
{
  "email": "string",
  "recipe_id": "string"
}
```
Expected Response: JSON object with success message and updated User.

#### POST /api/v1/unlike-recipe

Method: POST

Description: Unlike a recipe for a user.
Expected Payload:
```sh
{
  "email": "string",
  "recipe_id": "string"
}
```
Expected Response: JSON object with success message and updated User.

## Premium Upgrade

#### POST /api/v1/upgrade
Method: POST

Description: Upgrade a user to premium.
Expected Payload:
```sh
{
  "email": "string"
}
```
Expected Response: JSON object with success message and updated User.

## AI Integration

#### POST /api/v1/gen

Method: POST

Description: Perform an AI operation (Gemini) with an image.
Expected Payload: Form-data with image file.
Expected Response: JSON response from the AI service.