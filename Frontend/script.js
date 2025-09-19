
document.addEventListener('DOMContentLoaded', () => {
    const profileIcon = document.getElementById('profile-icon');
    const profileDropdown = document.getElementById('profile-dropdown');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutLink = document.getElementById('logout-link');
    const menuIcon = document.getElementById('menu-icon');
    const navList = document.getElementById('nav-list');

    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName'); // Assuming you store email during login

    if (token && userName) {
        // Display welcome message
        welcomeMessage.textContent = `Hello, ${userName}!`; // Use part before @ as username
        profileIcon.style.display = 'inline-block'; // Ensure profile icon is visible
        logoutLink.style.display = 'block';
        document.getElementById('Dashboard-anchor').style.display = 'block';
        document.getElementById('Login-anchor').style.display = 'none';
    } else {

    }
    
    document.getElementById('Dashboard-anchor').addEventListener('click',()=>{
        currentLink = window.location.href;
        //console.log(`${currentLink.substring(0, currentLink.lastIndexOf('/'))}/Dashboard/dashboard.html`)
        window.location.href = `${currentLink.substring(0, currentLink.lastIndexOf('/'))}/Dashboard/dashboard.html`;
    });

    document.getElementById('Login-anchor').addEventListener('click',()=>{
        currentLink = window.location.href;
        //console.log(`${currentLink.substring(0, currentLink.lastIndexOf('/'))}/login.html`)
        window.location.href = `${currentLink.substring(0, currentLink.lastIndexOf('/'))}/login.html`;
    })
    // Toggle profile dropdown visibility
    profileIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent click from propagating to document
        profileDropdown.classList.toggle('hidden-dropdown');
        profileDropdown.classList.toggle('show-dropdown');
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!profileDropdown.contains(event.target) && !profileIcon.contains(event.target)) {
            profileDropdown.classList.add('hidden-dropdown');
            profileDropdown.classList.remove('show-dropdown');
        }
    });

    // Logout functionality
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        // Redirect to login page or home page
        window.location.href = '/';
    });

    // Toggle mobile navigation menu
    menuIcon.addEventListener('click', () => {
        navList.classList.toggle('active');
    });

       document.getElementById('search-recipe-btn').addEventListener('click', (e) => {
        e.preventDefault(); // stop form submit
            const currentLink = window.location.href;
            const basePath = currentLink.substring(0, currentLink.lastIndexOf('/'));

            query = document.getElementById('search-recipe-input').value;

            // console.log(query)
            const targetUrl = `${basePath}/recipe-search.html?query=${query}`;
            
            console.log('Redirecting to:', targetUrl);
            window.location.href = targetUrl;
        });

       document.getElementById('search-recipe-by-ingredients-btn').addEventListener('click', (e) => {
        e.preventDefault(); // stop form submit
            const currentLink = window.location.href;
            const basePath = currentLink.substring(0, currentLink.lastIndexOf('/'));

            const targetUrl = `${basePath}/recipe-search-by-ingredients.html`;
            
            console.log('Redirecting to:', targetUrl);
            window.location.href = targetUrl;
        });


    });