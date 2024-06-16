const fetchLikedRecipes = async (user, setLoadingRecipes, setRecipes) => {
    setLoadingRecipes(true);

    try {
        const response = await fetch(`/api/v1/users/liked-recipes?email=${user.email}`);
        const data = await response.json();
        
        console.log(data);
        setRecipes(data.liked_recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
    } finally {
        setLoadingRecipes(false);
    }
};

export default fetchLikedRecipes;
