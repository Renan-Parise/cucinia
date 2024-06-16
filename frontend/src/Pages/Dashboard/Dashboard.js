import React, { useState, useEffect } from 'react';
import './Dashboard.css';

import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import AuthWrapper from '../../AuthWrapper/AuthWrapper'; 
import Recipes from '../../Components/Recipes/Recipes';

import { ErrorToast, AddedToast, ResponseToast, ImageRequiredToast, showUnsupportedFormatToast, UnsupportedFormatToast } from '../../Components/Toasts/Toasts';

import handleRemoveIngredient from '../../Utils/RemoveIngredientAction';
import handleAddIngredient from '../../Utils/AddIngredientAction';
import handleAddIngredientByAI from '../../Utils/AddIngredientByAIAction';
import fetchRecipesByIngredients from '../../Utils/FetchRecipesByIngredients';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [newIngredient, setNewIngredient] = useState('');
  const [allowedIngredients, setAllowedIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);

  const [selectedRecipeDescription, setSelectedRecipeDescription] = useState('');
  const [selectedRecipeName, setSelectedRecipeName] = useState('');
  const [selectedRecipeImage, setSelectedRecipeImage] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState("Todos os tipos de receitas");

  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [showErrorToast, setShowErrorToast] = useToast();
  const [showAddedToast, setShowAddedToast] = useToast();
  const [showResponseToast, setShowResponseToast] = useToast();
  const [showImageRequiredToast, setShowImageRequiredToast] = useToast();
  const [showUnsupportedFormatToast, setShowUnsupportedFormatToast] = useToast();

  function useToast(duration = 5000) {
    const [showToast, setShowToast] = useState(false);
  
    useEffect(() => {
      if (showToast) {
        const timeout = setTimeout(() => {
          setShowToast(false);
        }, duration);
  
        return () => clearTimeout(timeout);
      }
    }, [showToast, duration]);
  
    return [showToast, setShowToast];
  }

  useEffect(() => {
    const fetchAllowedIngredients = async () => {
      let storedAllowedIngredients = localStorage.getItem('allowedIngredients');

      if (!storedAllowedIngredients) {
        try {
          const response = await fetch('/api/v1/ingredients');
          const data = await response.json();
          storedAllowedIngredients = JSON.stringify(data);
          localStorage.setItem('allowedIngredients', storedAllowedIngredients);
        } catch (error) {
          console.error('Error fetching allowed ingredients:', error);
        }
      }

      setAllowedIngredients(JSON.parse(storedAllowedIngredients));
    };

    fetchAllowedIngredients();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setShowImageRequiredToast(true);
      return;
    }

    const allowedExtensions = ["jpg", "jpeg"];
    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setShowUnsupportedFormatToast(true);
      return;
    }

    setLoading(true);
    const formData = new FormData(event.target);
    formData.append('image', selectedFile); 
  
    try {
      const response = await fetch('/api/v1/gen', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      const partsArray = data?.Candidates?.[0]?.Content?.Parts || [];
      setResponse(partsArray);
      setShowResponseToast(true);
  
      partsArray.forEach(async (part) => {
        const ingredients = part
          .split(',')
          .map((ingredient) => ingredient.trim().charAt(0).toUpperCase() + ingredient.trim().slice(1));
      
        console.log(ingredients);
        
        ingredients.forEach((ingredient) => {
          handleAddIngredientByAIWrapper(user, allowedIngredients, setShowAddedToast, setShowErrorToast, setNewIngredient, setUser, ingredient);
        });
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const countAvailableIngredients = (recipeIngredients) => {
    if (!user || !user.ingredients) return 0;
  
    const availableIngredients = recipeIngredients.filter(recipeIngredient =>
      user.ingredients.includes(recipeIngredient)
    );
  
    return availableIngredients.length;
  };

  useEffect(() => {
    fetchRecipesByIngredientsWrapper(user, setLoadingRecipes, setRecipes);
  }, [user]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
  }, []);
  
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
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

  const sortedRecipes = [...recipes].sort((recipeA, recipeB) => {
    const recipeALiked = user && user.liked_recipes && user.liked_recipes.includes(recipeA.id);
    const recipeBLiked = user && user.liked_recipes && user.liked_recipes.includes(recipeB.id);
  
    if (recipeALiked && !recipeBLiked) {
      return -1;
    } else if (!recipeALiked && recipeBLiked) {
      return 1;
    } else {
      return 0;
    }
  });

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
  
      console.log(user.email);
      console.log(recipeId);
      
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
  
  const fetchRecipesByIngredientsWrapper = (user, setLoadingRecipes, setRecipes) => {
    fetchRecipesByIngredients(user, setLoadingRecipes, setRecipes)
  };

  const handleAddIngredientByAIWrapper = (user, allowedIngredients, setShowAddedToast, setShowErrorToast, setNewIngredient, setUser, ingredient) => {
    handleAddIngredientByAI(user, allowedIngredients, setShowAddedToast, setShowErrorToast, setNewIngredient, setUser, ingredient)
  };
  
  const handleAddIngredientWrapper = (user, newIngredient, allowedIngredients, setShowAddedToast, setShowErrorToast, setUser) => {
    handleAddIngredient(user, newIngredient, allowedIngredients, setShowAddedToast, setShowErrorToast, setUser)
    setNewIngredient('');
  };

  const handleRemoveIngredientWrapper = (ingredientToRemove) => {
    handleRemoveIngredient(user, ingredientToRemove, setUser)
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
        <div className="w-10/12 md:w-8/12 artboard artboard-horizontal rounded-lg max-h-[80vh] h-[80vh] fixed left-4 top-24 mr-auto p-9 bg-base-100 overflow-y-auto overflow-x-hidden">
          <div className="flex">
            <h1 className="flex-grow text-2xl font-bold">Receitas</h1>

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
              {recipes.length === 1 ? (
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
                  <p className="text-2xl font-semibold">Nenhuma receita aqui ainda. Comece <a className="underline text-secondary" href="/dashboard/add">adicionando novos ingredientes</a>.</p>
                </div>
              ) : (
                <Recipes
                  recipes={sortedRecipes}
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
        <div className="hidden md:block artboard artboard-horizontal rounded-lg h-4/5 w-[29%] fixed right-4 top-24 ml-auto mr-8 p-9 bg-base-100 overflow-y-auto">
          <div className="flex">
            <h1 className="flex-grow text-2xl mb-2 font-bold">Ingredientes</h1>
          </div>

          <form id="uploadForm" className="w-full" onSubmit={handleSubmit}>
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-base-200 dark:hover:bg-base-100 dark:bg-base-200 hover:bg-base-100 dark:bg-base-200">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {selectedFile ? (
                  <div className="flex flex-col items-center justify-center">
                    <p className="mt-1 mb-2 text-sm text-gray-500 text-center dark:text-gray-400 font-semibold">Selected file:</p>
                    <p className="mb-2 text-sm text-gray-500 text-center dark:text-gray-400">{selectedFile.name}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-8 h-8 mb-4 text-gray-500 text-center dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                  </div>
                )}
              </div>
              <input
                id="dropzone-file" 
                type="file" 
                name="image" 
                className="hidden" 
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
            </label>
            <div className="flex flex-col items-center justify-center">
              <button type="submit" className="btn btn-secondary text-center w-full mt-2" disabled={loading}>
                {loading ? (
                  <span className="bg-secondary loading loading-spinner loading-sm"></span>
                ) : (
                  "Adicionar com IA"
                )}
              </button>
            </div>
          </form>
          
          <div className="divider divider-secondary mt-5 mb-5">OU</div>

          <div className="flex">  
            <label className="input input-secondary input-bordered flex items-center w-3/5">
              <input 
                type="text" 
                className="grow" 
                placeholder="Adicionar novos..." 
                value={newIngredient} 
                onChange={(e) => setNewIngredient(e.target.value)} 
                list="suggestions"
              />
              <datalist id="suggestions">
                {allowedIngredients.map((ingredient, index) => (
                  <option key={index} value={ingredient.name} />
                ))}
              </datalist>
              <span className="badge badge-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" /></svg>
              </span>
            </label>
            <button onClick={() => handleAddIngredientWrapper(user, newIngredient, allowedIngredients, setShowAddedToast, setShowErrorToast, setUser)} className="btn btn-secondary w-[39%] ml-2">Adicionar</button>
          </div>

          <div className="overflow-x-auto mt-9">
            <h2 className="flex-grow text-xl font-bold -mb-5">Recentemente adicionados</h2>

            <table className="table mt-9">
            <thead>
              <tr>
                <th>#</th>
                <th>Ingrediente</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {user && user.ingredients.map((ingredient, index) => (
                <tr className="hover" key={index}>
                  <th>{index + 1}</th>
                  <td>{ingredient}</td>
                  <td className="flex justify-end">
                    <button onClick={() => handleRemoveIngredientWrapper(ingredient)} className="btn btn-error btn-xs">remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
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


      {showErrorToast && <ErrorToast />}
      {showAddedToast && <AddedToast />}
      {showImageRequiredToast && <ImageRequiredToast />}
      {showUnsupportedFormatToast && <UnsupportedFormatToast />}
      {showResponseToast && response && <ResponseToast response={response} />}
    </>
  );
}

export default AuthWrapper(Dashboard);