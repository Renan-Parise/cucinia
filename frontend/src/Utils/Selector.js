import React, { useState, useEffect } from 'react';
import Select from 'react-select';

function IngredientSelector({ allowedIngredients, onAddIngredients }) {
  const ingredientOptions = allowedIngredients.map((ingredient) => ({
    value: ingredient.name,
    label: ingredient.name,
  }));

  const [selectedIngredients, setSelectedIngredients] = useState([]);

  const handleChange = (selectedOptions) => {
    setSelectedIngredients(selectedOptions);
  };

  const handleAddIngredients = () => {
    const ingredientNames = selectedIngredients.map((option) => option.value);
    onAddIngredients(ingredientNames);
    setSelectedIngredients([]);
  };

  return (
    <div>
      <Select
        isMulti
        options={ingredientOptions}
        value={selectedIngredients}
        onChange={handleChange}
        placeholder="Select ingredients..."
        closeMenuOnSelect={false}
      />

      <button
        onClick={handleAddIngredients}
        className="btn btn-secondary mt-2"
      >
        Add Ingredients
      </button>
    </div>
  );
}

export default IngredientSelector;