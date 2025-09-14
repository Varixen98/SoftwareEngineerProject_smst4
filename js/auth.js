// Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
  const loginPage = document.getElementById('loginPage');
  const appContainer = document.getElementById('appContainer');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const passwordToggle = document.getElementById('passwordToggle');
  const passwordInput = document.getElementById('password');
  const logoutBtn = document.getElementById('logoutBtn');
  
  // Check if user is already logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (isLoggedIn) {
    showApp();
  }
  
  // Handle login form submission
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = passwordInput.value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation (replace with actual authentication logic)
      if (email === 'demo@example.com' && password === 'password') {
        if (rememberMe) {
          localStorage.setItem('isLoggedIn', 'true');
        }
        showApp();
      } else {
        showError('Invalid email or password. Please try again.');
      }
    } catch (error) {
      showError('An error occurred. Please try again later.');
    }
  });
  
  // Handle logout
  logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('isLoggedIn');
    showLogin();
  });
  
  // Toggle password visibility
  passwordToggle.addEventListener('click', function() {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    
    const icon = this.querySelector('i');
    icon.className = type === 'password' ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
  });
  
  function showApp() {
    loginPage.classList.add('hidden');
    appContainer.classList.remove('hidden');
  }
  
  function showLogin() {
    appContainer.classList.add('hidden');
    loginPage.classList.remove('hidden');
    loginForm.reset();
    loginError.classList.add('hidden');
  }
  
  function showError(message) {
    loginError.querySelector('span').textContent = message;
    loginError.classList.remove('hidden');
  }
});