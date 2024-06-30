# 2Chefs API Documentation

## Table of Contents

- [Tema, Resumo e Conclusão](#tema-reumo-conclusao)
- [Regras de negócio e Histórias de usuário](#negocio-usuario)
- [Matriz de rastreabilidade de requisitos](#matriz-uc)
- [UML](#uml)
- [Diagrama de classes](#diagrama-de-classes)
- [Wireframe](#wireframe)
- [Environment Setup](#environment-setup)
- [Development Mode](#start-in-development-mode)
- [Production Mode](#start-in-production-mode)
- [API Routes Documentation](#api-routes-documentation)
  - [Ingredients](#ingredients)
    - [GET /api/v1/ingredients](#get-apiv1ingredients)
    - [GET /api/v1/ingredients/](#get-apiv1ingredients-1)
    - [POST /api/v1/ingredients](#post-apiv1ingredients)
    - [PATCH /api/v1/ingredients/](#patch-apiv1ingredients)
    - [DELETE /api/v1/ingredients/](#delete-apiv1ingredients)
  - [Recipes](#recipes)
    - [GET /api/v1/recipes](#get-apiv1recipes)
    - [GET /api/v1/recipes/by-cuisine/](#get-apiv1recipes-by-cuisine)
    - [GET /api/v1/recipes/by-id/](#get-apiv1recipes-by-id)
    - [GET /api/v1/recipes/by-type/](#get-apiv1recipes-by-type)
    - [GET /api/v1/recipes/by-ingredient/](#get-apiv1recipes-by-ingredient)
    - [GET /api/v1/recipes/by-multiple-criteria](#get-apiv1recipes-by-multiple-criteria)
    - [POST /api/v1/recipes](#post-apiv1recipes)
    - [PATCH /api/v1/recipes/](#patch-apiv1recipes)
    - [DELETE /api/v1/recipes/](#delete-apiv1recipes)
  - [Users](#users)
    - [POST /api/v1/register](#post-apiv1register)
    - [POST /api/v1/login](#post-apiv1login)
    - [DELETE /api/v1/users/](#delete-apiv1users)
    - [GET /api/v1/users](#get-apiv1users)
    - [GET /api/v1/users/](#get-apiv1users-1)
    - [GET /api/v1/users/liked-recipes](#get-apiv1users-liked-recipes)
  - [User Ingredients](#user-ingredients)
    - [POST /api/v1/user-ingredients/add](#post-apiv1user-ingredients-add)
    - [POST /api/v1/user-ingredients/remove](#post-apiv1user-ingredients-remove)
    - [DELETE /api/v1/user-ingredients/remove/all](#delete-apiv1user-ingredients-remove-all)
  - [Recipe Actions](#recipe-actions)
    - [POST /api/v1/like-recipe](#post-apiv1like-recipe)
    - [POST /api/v1/unlike-recipe](#post-apiv1unlike-recipe)
  - [Premium Upgrade](#premium-upgrade)
    - [POST /api/v1/upgrade](#post-apiv1upgrade)
  - [AI Integration](#ai-integration)
    - [POST /api/v1/gen](#post-apiv1gen)

## Tema, Resumo e Conclusão

Tema: 2chefs, software de recomendação de receitas
Resumo: Considerando a dificuldade diária para possuir tempo, criatividade e habilidades especializadas ao cozinhar, o 2chefs utiliza essa problemática para oferecer uma eficiente solução para a tarefa de preparação de refeições: os usuários não sabem o que cozinhar com ingredientes limitados em casa. Em outras palavras, o objetivo principal é prover software prático e acessível possibilitando que usuários, independente de idade ou experiência culinária, preparem deliciosas refeições a partir de ingredientes disponíveis em casa. O Software oferece uma vasta gama de receitas, categorizadas por dificuldade e tipo de cozinha, o que diminui o desperdício de alimentos e incentiva as pessoas a comer melhor. As metodologias envolveram o levantamento de requisitos do sistema, a definição de cronograma, a escolha dos softwares, linguagens de programação, e escolha da inteligência artificial e, por fim, a realização de testes. Em geral, este estudo demonstra que o 2chefs é uma ferramenta importante e eficaz para ajudar os usuários a cozinhar com os alimentos disponíveis. O software é conveniente de usar, oferece muitas receitas e, assim, pode ser personalizado. Portanto, jovens ou apenas os que começam a cozinhar sentirão facilidade ​​ao usá-lo. Em resumo, devido ao sucesso desta etapa, o 2chefs tem um futuro brilhante na indústria. No final, será possível dizer que o 2chefs tornou-se indispensável nas cozinhas domésticas.
Conclusão: Com tudo isso, o software 2chefs prova que é possível oferecer uma solução prática e eficiente para um problema comum entre muitas pessoas. Não é apenas útil para pessoas sem habilidades e com pouco tempo disponível, mas também ajuda a evitar o desperdício de alimentos e incentiva o ato de cozinhar como algo acessível e não estressante. Os resultados com base no feedback dos usuários revelaram que eles estavam satisfeitos com a facilidade de uso juntamente à variabilidade de receitas. Embora o programa tenha sido projetado para jovens que começam suas vidas independentes, a ferramenta também se revelou útil para cozinheiros amadores e profissionais de todas as idades, o que destaca sua versatilidade e relevância.
Em versões futuras, o 2chefs poderia conter mais funcionalidades, como a lista de compras integrada, substituição de sugestão de receita e modos de receita mais detalhados. Além disso, a expansão contínua do banco de dados de receitas manterá o software atualizado. Em suma, 2chefs provou ser uma ferramenta inovadora que muda a culinária de muitas pessoas, promovendo hábitos saudáveis ​​e sustentáveis, práticos e criativos.

## Regras de negócio e Histórias de usuário

Link: https://docs.google.com/document/d/1juVeQnhg9aY4ck-DvhZLoUm1NzayuJhkpp8WUfNbVSI/edit?usp=sharing

## Matriz de rastreabilidade de requisitos

Link: https://docs.google.com/spreadsheets/d/10C2Ntn1VEuH-RwxZjihrsML1-38haWXQ5grszJFyVW8/edit?usp=drive_link

## UML

Link: https://lucid.app/lucidchart/invitations/accept/inv_27b8470d-31f6-4e42-9605-5c3f98f1abfd

## Diagrama de classes

Link: https://lucid.app/lucidchart/invitations/accept/inv_edbb30d0-2153-418c-9f4a-7940cd0e81bc

## Wireframe

![image](https://github.com/Renan-Parise/cucinia/assets/124601530/3e9265d3-fcc7-4aae-bc7c-56e8d59d93a9)


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
