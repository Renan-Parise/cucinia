import React, { useEffect, useState } from 'react';

const Recipes = ({
  recipes,
  selectedMealType,
  searchQuery,
  countAvailableIngredients,
  handleToggleLikeRecipe,
  openRecipeModal,
  user,
  mealTypeNumber,
  mapMealType
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {recipes
        .filter((recipe) =>
          (selectedMealType === 'Todos os tipos de receitas' ||
            recipe.type_of === mealTypeNumber(selectedMealType.toLowerCase())) &&
          (recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipe.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .map((recipe) => (
          <div className="card card-side bg-base-200 shadow-xl" key={recipe._id}>
            <figure className="w-96 h-full">
              <img
                className="h-full w-full aspect-w-4 aspect-h-3 object-cover"
                src={recipe.image}
                alt={recipe.name}
              />
            </figure>
            <div className="card-body -mt-1">
              <div className="flex justify-between justify-end">
                <h2 className="font-bold w-3/4 text-lg card-title">
                  {recipe.name}
                  {user && recipe.premium && (
                    <div className="badge text-neutral bg-yellow-400">
                      PRO
                    </div>
                  )}
                </h2>
                <div className="tooltip flex tooltip-secondary tooltip-bottom" data-tip={`Nesta receita, você tem ${countAvailableIngredients(recipe.ingredients)} ingredientes necessários para fazer a receita, e precisa de ${recipe.ingredients.length} para fazê-la.`}>
                  <button
                    className="btn btn-sm btn-secondary"
                  >
                    <div className="right-0">
                      {countAvailableIngredients(recipe.ingredients)} de {recipe.ingredients.length}
                    </div>
                  </button>
                </div>
              </div>
              <div className="badge font-semibold badge-secondary mr-1">{mapMealType(recipe.type_of)}</div>
              
              <p className="mt-2">{recipe.description.length > 115 ? `${recipe.description.slice(0, 115)}...` : recipe.description}</p>
              
              <div className="badges font-medium">
                {recipe.restriction.map((restriction, index) => (
                  <div className="badge badge-accent mr-1" key={index}>
                    {restriction}
                  </div>
                ))}
                <div className="badge badge-info mr-1">{recipe.cuisine}</div>
                <div className={`badge ${recipe.difficulty === 'fácil' ? 'badge-success' : recipe.difficulty === 'médio' ? 'badge-warning' : 'badge-error'} mr-1`}>
                  {recipe.difficulty}
                </div>
              </div>

              <div className="flex gap-1 justify-between mt-3 -mb-2">
                <button
                  onClick={() => handleToggleLikeRecipe(recipe.id)}
                  className={`btn btn-md btn-secondary hover:bg-yellow-100 border-none ${user && user.liked_recipes && user.liked_recipes.includes(recipe.id) ? 'bg-yellow-400 text-neutral hover:text-base-300' : ''}`}
                >
                  {user && user.liked_recipes && user.liked_recipes.includes(recipe.id) ? '' : ''}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </button>
                <button
                  className="btn w-[89%] btn-md btn-secondary"
                  onClick={() => openRecipeModal(recipe.name, recipe.description, recipe.image)}
                >
                  Ver receita
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Recipes;