const handleAddIngredientByAI = async (user, allowedIngredients, setShowAddedToast, setShowErrorToast, setNewIngredient, setUser, ingredient) => {
    if (ingredient.trim() !== '') {
        const ingredientAlreadyAdded = user.ingredients.some(
            (existingIngredient) =>
                existingIngredient.toLowerCase() === ingredient.toLowerCase()
        );

        if (ingredientAlreadyAdded) {
            setShowAddedToast(true);
        } else {
            const ingredientExists = allowedIngredients.some(
                (allowedIngredient) =>
                    allowedIngredient.name.toLowerCase() === ingredient.toLowerCase()
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
                            ingredient: ingredient,
                        }),
                    });
                    const data = await response.json();
                    setUser((prevUser) => ({
                        ...prevUser,
                        ingredients: [...prevUser.ingredients, ingredient],
                    }));
                    setNewIngredient('');
                    setShowAddedToast(true);
                } catch (error) {
                    console.error('Error adding ingredient:', error);
                }
            } else {
                console.error('Error: Ingredient not allowed');
                setShowErrorToast(true);
            }
        }
    }
};

export default handleAddIngredientByAI;
