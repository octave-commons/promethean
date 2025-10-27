console.log('Duck Web loaded');

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
            <h1>Duck Web</h1>
            <p>Welcome to Duck Web application!</p>
        `;
  }
});
