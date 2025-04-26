import React from 'react';
import { Alert as BootstrapAlert } from 'react-bootstrap';
import { useAlert } from '../../contexts/AlertContext';

const Alert = () => {
  const { alerts, removeAlert } = useAlert();

  if (!alerts.length) {
    return null;
  }

  return (
    <div className="alert-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
      {alerts.map((alert) => (
        <BootstrapAlert
          key={alert.id}
          variant={alert.type}
          dismissible
          onClose={() => removeAlert(alert.id)}
          className="mb-2 shadow-sm"
        >
          {alert.message}
        </BootstrapAlert>
      ))}
    </div>
  );
};

export default Alert;