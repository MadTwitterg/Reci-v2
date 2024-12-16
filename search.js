import { recipeService } from './recipe-service.js';

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');

    searchButton.addEventListener('click', () => {
        searchButton.classList.add('spinning');
        setTimeout(() => {
            searchButton.classList.remove('spinning');
        }, 500);

        performSearch();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    async function getNutritionDetails(recipeId) {
        try {
            const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/nutritionWidget.json?apiKey=${API_KEY}`);
            const nutritionData = await response.json();
            return nutritionData;
        } catch (error) {
            console.error('Error fetching nutrition data:', error);
            return null;
        }
    }
    
    async function performSearch() {
        const query = searchInput.value.trim();
        if (!query) return;
    
        try {
            searchResults.innerHTML = `
                <div class="message-container">
                    <img src="https://media.giphy.com/media/3o7bu8sRnYpTOG1p8k/giphy.gif" alt="Cooking" class="message-gif">
                    <h3>Cooking up your results... 🍳</h3>
                    <p>Our chefs are working their magic!</p>
                </div>
            `;
    
            const recipes = await recipeService.searchRecipes(query);
    
            if (!recipes || recipes.length === 0) {
                searchResults.innerHTML = `
                    <div class="message-container">
                        <img src="https://media.giphy.com/media/26n6WywJyh39n1pBu/giphy.gif" alt="Empty plate" class="message-gif">
                        <h3>Oops! No recipes found</h3>
                        <p>Even our chef couldn't find what you're looking for! 👨‍🍳</p>
                        <p>Try something like "pasta" or "chicken"</p>
                    </div>
                `;
                return;
            }
    
            searchResults.innerHTML = '';
    
            for (const recipe of recipes) {
                // Fetch detailed nutrition for each recipe
                const nutrition = await getNutritionDetails(recipe.id);
                const calories = nutrition?.calories || 'No data';
    
                searchResults.innerHTML += `
                    <div class="recipe-card" onclick="window.location.href='recipe.html?id=${recipe.id}'">
                        <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image"
                             onerror="this.src='recipe_placeholder.jpg'">
                        <div class="recipe-content">
                            <h3 class="recipe-title">${recipe.title}</h3>
                            <div class="recipe-meta">
                                <div class="meta-item">
                                    <i class="fas fa-clock"></i>
                                    <span class="meta-label">Time</span>
                                    <span class="meta-value">${recipe.readyInMinutes} min</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-user"></i>
                                    <span class="meta-label">Servings</span>
                                    <span class="meta-value">${recipe.servings}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-heart"></i>
                                    <span class="meta-label">Health</span>
                                    <span class="meta-value">${recipe.healthScore || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
    
        } catch (error) {
            console.error('Search error:', error);
            searchResults.innerHTML = `
                <div class="error-message">
                    <p>Error searching recipes: ${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">Try Again</button>
                </div>`;
        }
    }
} );    