import React, { useState, useEffect } from 'react';

import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import AuthWrapper from '../../AuthWrapper/AuthWrapper'; 

import { ErrorToast, AddedToast, ResponseToast, ImageRequiredToast } from '../../Components/Toasts/Toasts';

import handleRemoveIngredient from '../../Utils/RemoveIngredientAction';
import handleAddIngredient from '../../Utils/AddIngredientAction';
import handleAddIngredientByAI from '../../Utils/AddIngredientByAIAction';

function Ingredients() {
  const [user, setUser] = useState(null);
  const [newIngredient, setNewIngredient] = useState('');
  const [allowedIngredients, setAllowedIngredients] = useState([]);
  const [response, setResponse] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showErrorToast, setShowErrorToast] = useToast();
  const [showAddedToast, setShowAddedToast] = useToast();
  const [showResponseToast, setShowResponseToast] = useToast();
  const [showImageRequiredToast, setShowImageRequiredToast] = useToast();

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setShowImageRequiredToast(true);
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
      
        const uniqueIngredients = [...new Set(ingredients)];

        uniqueIngredients.forEach((ingredient) => {
          handleAddIngredientByAIWrapper(user, allowedIngredients, setShowAddedToast, setShowErrorToast, setNewIngredient, setUser, ingredient);
        });
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (showResponseToast) {
      setTimeout(() => {
        setShowResponseToast(false);
      }, 5000);
    }
  }, [showResponseToast]);

  useEffect(() => {
    const fetchUserData = () => {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);
  
  const handleAddIngredientByAIWrapper = (user, allowedIngredients, setShowAddedToast, setShowErrorToast, setNewIngredient, setUser, ingredient) => {
    handleAddIngredientByAI(user, allowedIngredients, setShowAddedToast, setShowErrorToast, setNewIngredient, setUser, ingredient)
  };

  const handleAddIngredientWrapper = (user, newIngredient, allowedIngredients, setShowAddedToast, setShowErrorToast, setUser) => {
    handleAddIngredient(user, newIngredient, allowedIngredients, setShowAddedToast, setShowErrorToast, setUser)
  };

  const handleRemoveIngredientWrapper = (ingredientToRemove) => {
    handleRemoveIngredient(user, ingredientToRemove, setUser)
  };

  return (
    <>
      <Navbar />

      <div className="hero min-h-screen fixed bg-base-300">
        <div className="artboard artboard-horizontal rounded-lg h-4/5 fixed top-24 w-9/12 mb-32 p-9 bg-base-100 overflow-y-auto">
          <div className="flex">
            <h1 className="flex-grow text-2xl font-bold">Ingredientes</h1>
          </div>

          <div class="flex flex-col w-full lg:flex-row mt-5">
            <div className="grid flex-grow h-32 card rounded-box place-items-center mt-20 mr-40">
            <label className="input input-secondary input-bordered flex items-center w-full -mt-8">
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70">
                    <path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" />
                  </svg>
                </span>
              </label>
              <button onClick={() => handleAddIngredientWrapper(user, newIngredient, allowedIngredients, setShowAddedToast, setShowErrorToast, setUser)} className="btn btn-secondary w-full mb-12">Adicionar manualmente</button>
            </div>

            <div class="divider lg:divider-horizontal divider-secondary">OU</div> 

              <div class="grid flex-grow h-32 card rounded-box place-items-center ml-40">
                <div class="flex items-center justify-center w-full mt-4">
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
                          <span class="bg-secondary loading loading-spinner loading-sm"></span>
                        ) : (
                          "Adicionar com IA"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
          </div>
          <div className="flex">
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
                    <td className="font-bold">{index + 1}</td>
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

      {showErrorToast && <ErrorToast />}
      {showAddedToast && <AddedToast />}
      {showResponseToast && response && <ResponseToast response={response} />}
    </>
  );
}

export default AuthWrapper(Ingredients);