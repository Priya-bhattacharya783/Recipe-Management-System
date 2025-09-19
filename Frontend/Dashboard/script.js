document.addEventListener('DOMContentLoaded', async () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const contentSections = document.querySelectorAll('.content-section');
    const body = document.body;
    const dashboardUserName = document.getElementById('dashboard-user-name');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    // Virtual Fridge elements
    const addItemBtn = document.getElementById('addItemBtn');
    const addItemFormContainer = document.getElementById('addItemFormContainer');
    const itemNameInput = document.getElementById('itemName');
    const expiryDateInput = document.getElementById('expiryDate');
    const saveItemBtn = document.getElementById('saveItemBtn');
    const cancelAddBtn = document.getElementById('cancelAddBtn');
    const fridgeItemsList = document.getElementById('fridgeItemsList');
    const noItemsMessage = document.getElementById('noItemsMessage');

    // Nutrition Analyzer elements
    const recipeNameInput = document.getElementById('recipeName');
    const analyzeRecipeBtn = document.getElementById('analyzeRecipeBtn');
    const analyzedNutrition = document.getElementById('analyzedNutrition');
    const loadingIndicator = document.getElementById('loading-indicator');


    let editingItemId = null; // To store the ID of the item being edited

    // Set user name in dashboard header
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    
    const token = localStorage.getItem('token');
    if (token && userName) {
        dashboardUserName.textContent = `Welcome, ${userName}!`;
    } else {
        dashboardUserName.textContent = 'Welcome User';
    }

    // Update profile section
    profileName.textContent = userName || 'User';
    profileEmail.textContent = userEmail || 'NA';

    // Toggle sidebar for smaller screens
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            body.classList.toggle('sidebar-open'); // Add class to body for overlay
        });
    }

    // Handle sidebar item clicks to show/hide content
    sidebarItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior

            // Remove 'active' class from all sidebar items and content sections
            sidebarItems.forEach(i => i.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));

            // Add 'active' class to the clicked sidebar item
            item.classList.add('active');

            // Get the data-content attribute to find the corresponding content section
            const targetContentId = item.dataset.content;
            const targetContent = document.getElementById(targetContentId);

            // Add 'active' class to the target content section
            if (targetContent) {
                targetContent.classList.add('active');
            }

            // If on a smaller screen, close the sidebar after clicking an item
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                body.classList.remove('sidebar-open');
            }

            // If Virtual Fridge is clicked, fetch items
            if (targetContentId === 'virtual-fridge-content') {
                fetchAndRenderFridgeItems();
            }
        });
    });

    // Optional: Close sidebar if clicking outside of it on smaller screens
    body.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('active') &&
            !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
            body.classList.remove('sidebar-open');
        }
    });

    document.getElementById('home-link').addEventListener('click', ()=>{ // Changed 'home' to 'home-link' for consistency
        currentURL = window.location.href;
        modifiedURL = currentURL.substring(0,currentURL.lastIndexOf('/'));
        FinalModifiedURL = modifiedURL.substring(0,modifiedURL.lastIndexOf('/'));
        console.log(FinalModifiedURL);
        window.location.href = `${FinalModifiedURL}/index.html`; // Redirect to a protected dashboard
    });

    // Function to get JWT token from localStorage
    function getToken() {
        return localStorage.getItem('token');
    }

    // Function to fetch and render fridge items
    async function fetchAndRenderFridgeItems() {
        try {
            const token = getToken();
            if (!token) {
                console.error('No authentication token found.');
                fridgeItemsList.innerHTML = '<p style="color: red;">Please log in to view your fridge items.</p>';
                return;
            }

            const response = await axios.get(`${BACKEND_URL}/fridge-items`, {
                headers: {
                    'x-auth-token': token
                }
            });
            const items = response.data;

            fridgeItemsList.innerHTML = ''; // Clear existing items
            if (items.length === 0) {
                noItemsMessage.style.display = 'block';
            } else {
                noItemsMessage.style.display = 'none';
                items.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.classList.add('fridge-item');
                    itemElement.dataset.id = item._id; // Store item ID
                    itemElement.innerHTML = `
                        <div class="fridge-item-details">
                            <h4>${item.name}</h4>
                            <p>Expires: ${new Date(item.expiryDate).toLocaleDateString()}</p>
                        </div>
                        <div class="fridge-item-actions">
                            <button class="edit-item-btn" data-id="${item._id}" data-name="${item.name}" data-expiry="${item.expiryDate.split('T')[0]}">Edit</button>
                            <button class="delete-item-btn" data-id="${item._id}">Delete</button>
                        </div>
                    `;
                    fridgeItemsList.appendChild(itemElement);
                });
            }
        } catch (error) {
            console.error('Error fetching fridge items:', error.response?.data?.message || error.message);
            fridgeItemsList.innerHTML = '<p style="color: red;">Failed to load fridge items. Please try again.</p>';
        }
    }

    // Add/Edit Item Form Toggle
    addItemBtn.addEventListener('click', () => {
        addItemFormContainer.style.display = 'block';
        itemNameInput.value = '';
        expiryDateInput.value = '';
        saveItemBtn.textContent = 'Save Item';
        editingItemId = null;
    });

    cancelAddBtn.addEventListener('click', () => {
        addItemFormContainer.style.display = 'none';
    });

    // Save Item (Add/Edit)
    saveItemBtn.addEventListener('click', async () => {
        const name = itemNameInput.value.trim();
        const expiryDate = expiryDateInput.value;

        if (!name || !expiryDate) {
            alert('Please enter both item name and expiry date.');
            return;
        }

        try {
            const token = getToken();
            if (!token) {
                alert('You are not authenticated. Please log in.');
                return;
            }

            let response;
            if (editingItemId) {
                // Edit existing item
                response = await axios.put(`${BACKEND_URL}/fridge-items/${editingItemId}`, { name, expiryDate }, {
                    headers: { 'x-auth-token': token }
                });
                alert('Item updated successfully!');
            } else {
                // Add new item
                response = await axios.post(`${BACKEND_URL}/fridge-items`, { name, expiryDate }, {
                    headers: { 'x-auth-token': token }
                });
                alert('Item added successfully!');
            }

            addItemFormContainer.style.display = 'none';
            fetchAndRenderFridgeItems(); // Re-fetch and render items
        } catch (error) {
            console.error('Error saving item:', error.response?.data?.message || error.message);
            alert('Failed to save item: ' + (error.response?.data?.message || 'Server error.'));
        }
    });

    // Edit and Delete delegation (event listener on parent)
    fridgeItemsList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-item-btn')) {
            editingItemId = e.target.dataset.id;
            itemNameInput.value = e.target.dataset.name;
            expiryDateInput.value = e.target.dataset.expiry;
            saveItemBtn.textContent = 'Update Item';
            addItemFormContainer.style.display = 'block';
        } else if (e.target.classList.contains('delete-item-btn')) {
            if (confirm('Are you sure you want to delete this item?')) {
                const itemIdToDelete = e.target.dataset.id;
                try {
                    const token = getToken();
                    if (!token) {
                        alert('You are not authenticated. Please log in.');
                        return;
                    }
                    await axios.delete(`${BACKEND_URL}/fridge-items/${itemIdToDelete}`, {
                        headers: { 'x-auth-token': token }
                    });
                    alert('Item deleted successfully!');
                    fetchAndRenderFridgeItems(); // Re-fetch and render items
                } catch (error) {
                    console.error('Error deleting item:', error.response?.data?.message || error.message);
                    alert('Failed to delete item: ' + (error.response?.data?.message || 'Server error.'));
                }
            }
        }
    });

    // Nutrition Analyzer LLM Integration
    // if (analyzeRecipeBtn) {
    //     analyzeRecipeBtn.addEventListener('click', async () => {
    //         const recipeName = recipeNameInput.value.trim();
    //         if (!recipeName) {
    //             alert('Please enter a recipe name to analyze.');
    //             return;
    //         }

    //         analyzedNutrition.textContent = '';
    //         loadingIndicator.style.display = 'block';

    //         try {
    //             const response = await fetch('/api/nutrition-analyze', {
    //                 method: 'POST',
    //                 headers: { 'Content-Type': 'application/json' },
    //                 body: JSON.stringify({ recipeName })
    //             });

    //             const result = await response.json();
    //             analyzedNutrition.textContent = result.analysis || 'Could not analyze recipe.';
    //         } catch (error) {
    //             console.error('Error analyzing recipe:', error);
    //             analyzedNutrition.textContent = 'An error occurred during analysis.';
    //         } finally {
    //             loadingIndicator.style.display = 'none';
    //         }
    //     });
    // }
    if (analyzeRecipeBtn) {
        analyzeRecipeBtn.addEventListener('click', async () => {
            const recipeName = recipeNameInput.value.trim();
            if (!recipeName) {
                alert('Please enter a recipe name to analyze.');
                return;
            }

            analyzedNutrition.textContent = '';
            loadingIndicator.style.display = 'block';

            try {
                const response = await axios.post(`${BACKEND_URL}/api/nutrition-analyze`, { recipeName });
                analyzedNutrition.textContent = response.data.analysis || 'Could not analyze recipe.';
            } catch (error) {
                console.error('Error analyzing recipe:', error);
                analyzedNutrition.textContent = 'An error occurred during analysis.';
            } finally {
                loadingIndicator.style.display = 'none';
            }
        });
    }


    // Initial load: Set profile content as active
    document.getElementById('profile-link').click(); // Activates profile section
});
