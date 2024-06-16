const handleAddIngredient = async (user, newIngredient, allowedIngredients, setShowAddedToast, setShowErrorToast, setUser) => {
    if (newIngredient.trim() !== '') {
      const ingredientAlreadyAdded = user.ingredients.some(
        (ingredient) => ingredient.toLowerCase() === newIngredient.toLowerCase()
      );
  
      if (ingredientAlreadyAdded) {
        setShowAddedToast(true);
      } else {
        const ingredientExists = allowedIngredients.some(
          (ingredient) => ingredient.name.toLowerCase() === newIngredient.toLowerCase()
        );
        if (ingredientExists) {
          try {
            const response = await fetch('/api/v1/user-ingredients/add', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user.email,
                ingredient: newIngredient,
              }),
            });
            const data = await response.json();
            setUser((prevUser) => ({
              ...prevUser,
              ingredients: [...prevUser.ingredients, newIngredient],
            }));
            return data;
          } catch (error) {
            console.error('Error adding ingredient:', error);
            throw error;
          }
        } else {
          console.error('Error: Ingredient not allowed');
          setShowErrorToast(true);
        }
      }
    }
};
  
export default handleAddIngredient;