import * as Navigation from 'expo-router';

export const navigateToDeletedOrders = () => {
  try {
    // Try direct navigation first
    Navigation.router.replace('/deleted-orders');
    alert('Navigating to deleted orders (direct)'); // Temporary for debugging
  } catch (error) {
    console.warn('Direct navigation failed, using event system:', error);
    alert(`Direct navigation failed: ${error.message}. Trying event system...`); // Temporary for debugging
    // Fallback to event-based navigation
    Navigation.dispatch({
      type: 'NAVIGATE',
      payload: { name: 'deleted-orders' },
    });
  }
};
