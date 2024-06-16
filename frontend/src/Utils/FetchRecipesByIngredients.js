const fetchRecipesByIngredients = async (user, setLoadingRecipes, setRecipes) => {
    setLoadingRecipes(true);
    const userIngredients = user ? user.ingredients.join(',') : '';
    const localStorageKey = 'storedRecipes';
    const userPremium = user ? user.premium : false;

    let storedRecipes = JSON.parse(localStorage.getItem(localStorageKey)) || {};

    if (storedRecipes[userIngredients]) {
        setRecipes(storedRecipes[userIngredients]);
        setLoadingRecipes(false);
        return;
    }

    const maxStoredRequests = 15;
    let storedRequests = JSON.parse(localStorage.getItem('storedRequests')) || [];
    const requestIndex = storedRequests.indexOf(userIngredients);

    if (requestIndex === -1 && storedRequests.length >= maxStoredRequests) {
        const firstStoredRequest = storedRequests.shift();
        delete storedRecipes[firstStoredRequest];
    }

    storedRequests = storedRequests.filter(req => req !== userIngredients);
    storedRequests.push(userIngredients);
    localStorage.setItem('storedRequests', JSON.stringify(storedRequests));

    try {
        const response = await fetch(`/api/v1/recipes/by-multiple-criteria?ingredient=${userIngredients}&premium=${userPremium}`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
            const filteredRecipes = data.filter(recipe => recipe.percentage >= 100);
            storedRecipes[userIngredients] = filteredRecipes;
            localStorage.setItem(localStorageKey, JSON.stringify(storedRecipes));
            setRecipes(filteredRecipes);
        } else {
            console.error('Error: Data is not an array');
        }
    } catch (error) {
        console.error('Error fetching recipes:', error);
    } finally {
        setLoadingRecipes(false);
    }
};

export default fetchRecipesByIngredients;