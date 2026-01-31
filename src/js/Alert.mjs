export default class Alert {
  constructor(url) {
    this.url = url;
    this.init();
  }

  async init() {
    try {
      const response = await fetch(this.url);
      const alerts = await response.json();
      this.renderAlerts(alerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  }

  renderAlerts(alerts) {
    const header = document.getElementById('main-header');
    if (!header || !alerts || alerts.length === 0) return;

    alerts.forEach(alert => {
      const alertDiv = document.createElement('div');
      alertDiv.className = 'alert-popup';
      alertDiv.style.backgroundColor = alert.color || '#f0a868';
      alertDiv.innerHTML = `
        <p>${alert.message}</p>
        <button class="close-alert">&times;</button>
      `;
      
      header.insertAdjacentElement('afterend', alertDiv);
      
      // Add close functionality
      const closeBtn = alertDiv.querySelector('.close-alert');
      closeBtn.addEventListener('click', () => {
        alertDiv.remove();
      });
      
      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (alertDiv.parentNode) {
          alertDiv.remove();
        }
      }, 10000);
    });
  }
}