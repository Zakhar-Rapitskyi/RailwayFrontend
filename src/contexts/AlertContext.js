import React, { createContext, useState } from 'react';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (message, type = 'info', timeout = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newAlert = { id, message, type };
    
    setAlerts((prevAlerts) => [...prevAlerts, newAlert]);
    
    if (timeout > 0) {
      setTimeout(() => removeAlert(id), timeout);
    }
    
    return id;
  };

  const removeAlert = (id) => {
    setAlerts((prevAlerts) => prevAlerts.filter(alert => alert.id !== id));
  };

  const success = (message, timeout) => addAlert(message, 'success', timeout);
  const error = (message, timeout) => addAlert(message, 'danger', timeout);
  const warning = (message, timeout) => addAlert(message, 'warning', timeout);
  const info = (message, timeout) => addAlert(message, 'info', timeout);

  const value = {
    alerts,
    addAlert,
    removeAlert,
    success,
    error,
    warning,
    info
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = React.useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};