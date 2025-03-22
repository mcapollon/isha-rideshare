import { useState, useEffect } from 'react';

export function Toast({ message, type = 'success', duration = 3000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md text-white ${bgColor} animate-fade-in`}>
      {message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);
  
  const showToast = ({ title, description, variant }) => {
    const message = description || title;
    const type = variant === 'destructive' ? 'error' : 'success';
    
    setToast({ message, type });
  };
  
  const hideToast = () => setToast(null);
  
  return {
    toast: showToast,
    Toast: toast ? (
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={hideToast} 
      />
    ) : null
  };
}