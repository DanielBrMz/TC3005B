import { useContext } from 'react';
import { SavedItemsContext } from '../contexts/SavedItemsContext';

export const useSavedItems = () => {
  const context = useContext(SavedItemsContext);
  if (context === undefined) {
    throw new Error('useSavedItems must be used within a SavedItemsProvider');
  }
  return context;
};

// Re-export the context for consistency
export { SavedItemsProvider } from '../contexts/SavedItemsContext';