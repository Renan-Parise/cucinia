import React, { useState, useEffect } from 'react';
import './Liked.css';

import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import AuthWrapper from '../../AuthWrapper/AuthWrapper'; 
import Recipes from '../../Components/Recipes/Recipes';

import fetchLikedRecipes from '../../Utils/FetchLikedRecipes';

function Liked() {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);

  const [selectedRecipeDescription, setSelectedRecipeDescription] = useState('');
  const [selectedRecipeName, setSelectedRecipeName] = useState('');
  const [selectedRecipeImage, setSelectedRecipeImage] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState("Todos os tipos de receitas");

  const [loadingRecipes, setLoadingRecipes] = useState(true);

  const countAvailableIngredients = (recipeIngredients) => {
    if (!user || !user.ingredients) return 0;
  
    const availableIngredients = recipeIngredients.filter(recipeIngredient =>
      user.ingredients.includes(recipeIngredient)
    );
  
    return availableIngredients.length;
  };

  useEffect(() => {
    if (user && Array.isArray(user.liked_recipes) && user.liked_recipes.length > 0) {
      fetchLikedRecipesWrapper(user, setLoadingRecipes, setRecipes);
    } else {
      setLoadingRecipes(false);
      setRecipes([]);
    }
  }, [user]);

  const mapMealType = (typeNumber) => {
    switch (typeNumber) {
      case 1:
        return 'café da manhã';
      case 2:
        return 'almoço';
      case 3:
        return 'jantar';
      case 4:
        return 'lanche da tarde';
      case 5:
        return 'sobremesa';
    }
  };

  const mealTypeNumber = (mealType) => {
    switch (mealType) {
      case "café da manhã":
        return 1;
      case "almoço":
        return 2;
      case "jantar":
        return 3;
      case "lanche da tarde":
        return 4;
      case "sobremesa":
        return 5;
      default:
        return null;
    }
  };

  const filterRecipes = (recipes) => {
    return recipes.filter(
      (recipe) =>
        (selectedMealType === 'Todos os tipos de receitas' ||
          recipe.type_of === mealTypeNumber(selectedMealType.toLowerCase())) &&
        (recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const filteredRecipes = filterRecipes(recipes);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
  }, []);
  
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  const handleToggleLikeRecipe = async (recipeId) => {
    if (user && user.liked_recipes && user.liked_recipes.includes(recipeId)) {
      await handleUnlikeRecipe(recipeId);
    } else {
      await handleLikeRecipe(recipeId);
    }
  };

  const handleUnlikeRecipe = async (recipeId) => {
    try {
      const response = await fetch('/api/v1/unlike-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          recipe_id: recipeId
        })
      });
  
      if (response.ok) {
        console.log('Recipe unliked successfully');
  
        setUser(prevUser => {
          return {
            ...prevUser,
            liked_recipes: prevUser.liked_recipes.filter(id => id !== recipeId)
          };
        });
  
        localStorage.setItem('user', JSON.stringify({
          ...user,
          liked_recipes: user.liked_recipes.filter(id => id !== recipeId)
        }));
      } else {
        console.error('Failed to unlike recipe:', response.statusText);
      }
    } catch (error) {
      console.error('Error unliking recipe:', error);
    }
  };
  
  const handleLikeRecipe = async (recipeId) => {
    try {
      const response = await fetch('/api/v1/like-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          recipe_id: recipeId
        })
      });
      
      if (response.ok) {
        console.log('Recipe liked successfully');
        
        setUser(prevUser => {
          return {
            ...prevUser,
            liked_recipes: prevUser.liked_recipes ? [...prevUser.liked_recipes, recipeId] : [recipeId]
          };
        });
  
        localStorage.setItem('user', JSON.stringify({
          ...user,
          liked_recipes: user.liked_recipes ? [...user.liked_recipes, recipeId] : [recipeId]
        }));
      } else {
        console.error('Failed to like recipe:', response.statusText);
      }
    } catch (error) {
      console.error('Error liking recipe:', error);
    }
  };
  
  const fetchLikedRecipesWrapper = (user, setLoadingRecipes, setRecipes) => {
    fetchLikedRecipes(user, setLoadingRecipes, setRecipes)
  };

  const openRecipeModal = (name, description, image) => {
    const formattedDescription = description.replace(/<br>/g, '\n');
    setSelectedRecipeDescription(formattedDescription);
    setSelectedRecipeName(name);
    setSelectedRecipeImage(image);
    document.getElementById('recipe_modal').showModal();
  };

  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    fetch('/api/v1/ingredients')
      .then(response => response.json())
      .then(data => setIngredients(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <>
      <Navbar />

      <div className="hero min-h-screen fixed bg-base-300">
        <div className="artboard w-9/12 artboard-horizontal rounded-lg max-h-[80vh] h-[80vh] -mt-32 p-9 bg-base-100 overflow-y-auto overflow-x-hidden">
          <div className="flex">
            <h1 className="flex-grow text-2xl font-bold">Receitas curtidas</h1>

            <select
              className="select select-secondary w-full max-w-xs mr-4"
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value)}
            >
              <option value="Todos os tipos de receitas">Todos os tipos de receitas</option>
              <option value="Café da manhã">Café da manhã</option>
              <option value="Almoço">Almoço</option>
              <option value="Jantar">Jantar</option>
              <option value="Lanche da tarde">Lanche da tarde</option>
              <option value="Sobremesa">Sobremesa</option>
            </select>

            <label className="input input-secondary input-bordered flex items-center">
              <input
                type="text"
                className="grow"
                placeholder="Procurar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="badge badge-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" /></svg>
              </span>
            </label>
          </div>

          <div class="flex">
            <div class="flex-grow">
              {recipes && recipes.length === 1 ? (
                <>
                  <h2 class="text-2xl mt-5 font-bold">{filteredRecipes.length}</h2>
                  <p class="text-lg">receita disponível</p>
                </>
              ) : (
                <>
                  <h2 class="text-2xl mt-5 font-bold">{filteredRecipes.length}</h2>
                  <p class="text-lg">receitas disponíveis</p>
                </>
              )}
            </div>
          </div>

          {/* {Array.isArray(recipes) && recipes.length === 0 ? (
            <div className="block">
                <p className="text-center text-3xl my-64 font-bold">Ainda não tem nada aqui. Comece <a className="text-secondary underline" href="/Liked/add"> adicionando ingredientes</a>.</p>
            </div>
          ) : ( */}
          {loadingRecipes ? (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="skeleton w-full h-64"></div>
              <div className="skeleton w-full h-64"></div>
              <div className="skeleton w-full h-64"></div>
              <div className="skeleton w-full h-64"></div>
            </div>
          ) : (
            <>
              {recipes.length === 0 ? (
                <div className="text-center mt-48">
                  <p className="text-2xl font-semibold">
                    Nenhuma receita aqui ainda. {' '}
                    <a className="underline text-secondary" href="/dashboard">
                      Favorite algumas receitas
                    </a> para que seja mostrado aqui.
                  </p>
                </div>
              ) : (
                <Recipes
                  recipes={recipes}
                  selectedMealType={selectedMealType}
                  searchQuery={searchQuery}
                  countAvailableIngredients={countAvailableIngredients}
                  handleToggleLikeRecipe={handleToggleLikeRecipe}
                  openRecipeModal={openRecipeModal}
                  user={user}
                  mealTypeNumber={mealTypeNumber}
                  mapMealType={mapMealType}
                />
              )}
            </>
          )}
        </div>
      </div>

      <Footer />

      <dialog id="recipe_modal" className="modal">
        <div className="modal-box w-full max-w-5xl flex flex-col">
          <div className="bg-base-100 w-full mt-12">
            <div className="flex justify-center items-center w-full h-full">
              <img src={selectedRecipeImage} className="w-2/4 h-2/4 rounded-lg" alt="Recipe Image" />
            </div>
            <h3 className="font-bold text-center text-4xl mt-3">{selectedRecipeName}</h3>
            <h3 className="font-bold text-center">para o <span className="text-primary">café da manhã</span></h3>
            <div className="w-full flex justify-center mt-3">
              <div className="badges mb-3">
                {recipes
                  .filter(recipe => recipe.name === selectedRecipeName)
                  .map((recipe, index) => (
                    <React.Fragment key={index}>
                      {recipe.restriction.map((restriction, index) => (
                        <div className="badge badge-primary mr-1" key={index}>{restriction}</div>
                      ))}
                      <div className="badge badge-info mr-1">{recipe.cuisine}</div>
                      <div className={`badge ${recipe.difficulty === 'fácil' ? 'badge-success' : recipe.difficulty === 'médio' ? 'badge-warning' : 'badge-error'} mr-1`}>
                        {recipe.difficulty}
                      </div>
                    </React.Fragment>
                  ))}
              </div>
            </div>
          </div>
          <div className="w-full">
            <h1 className="font-bold text-4xl mt-3 mb-3">Receita</h1>
            <p style={{ whiteSpace: 'pre-line' }}>{selectedRecipeDescription}</p>
          </div>
          <div className="modal-action absolute right-6 top-0">
            <form method="dialog">
              <button className="btn btn-ghost">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default AuthWrapper(Liked);