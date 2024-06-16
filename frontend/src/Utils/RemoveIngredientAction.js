const handleRemoveIngredient = async (user, ingredientToRemove, setUser) => {
    try {
      const response = await fetch('/api/v1/user-ingredients/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          ingredient: ingredientToRemove,
        }),
      });
      const data = await response.json();
      setUser(prevUser => ({
        ...prevUser,
        ingredients: prevUser.ingredients.filter(ingredient => ingredient !== ingredientToRemove)
      }));
      return data;
    } catch (error) {
      console.error('Error removing ingredient:', error);
      throw error;
    }
};

export default handleRemoveIngredient;