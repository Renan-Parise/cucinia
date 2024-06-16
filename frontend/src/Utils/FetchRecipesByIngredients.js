const fetchRecipesByIngredients = async (user, setLoadingRecipes, setRecipes) => {
    setLoadingRecipes(true);
    const userIngredients = user ? user.ingredients.join(',') : '';
    const localStorageKey = `recipes_${userIngredients}`;
    const maxStoredRequests = 5;

    let storedRequests = JSON.parse(localStorage.getItem('storedRequests')) || [];
    const requestIndex = storedRequests.indexOf(localStorageKey);

    if (requestIndex === -1 && storedRequests.length >= maxStoredRequests) {
        const firstStoredRequest = storedRequests.shift();
        localStorage.removeItem(firstStoredRequest);
    }

    storedRequests = storedRequests.filter(req => req !== localStorageKey);
    storedRequests.push(localStorageKey);
    localStorage.setItem('storedRequests', JSON.stringify(storedRequests));

    const storedData = localStorage.getItem(localStorageKey);
    if (storedData) {
        setRecipes(JSON.parse(storedData));
        setLoadingRecipes(false);
        return;
    }

    try {
        const response = await fetch(`/api/v1/recipes/by-multiple-criteria?ingredient=${userIngredients}`);
        const data = await response.json();
        if (Array.isArray(data)) {
            const filteredRecipes = data.filter(recipe => recipe.percentage >= 100);
            setRecipes(filteredRecipes);

            localStorage.setItem(localStorageKey, JSON.stringify(filteredRecipes));
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
