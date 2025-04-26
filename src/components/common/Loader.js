import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loader = ({ variant = 'primary', size = 'md', text = 'Loading...', fullPage = false }) => {
  if (fullPage) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999,
        }}
      >
        <Spinner animation="border" variant={variant} size={size} />
        {text && <p className="mt-3 text-center">{text}</p>}
      </div>
    );
  }

  return (
    <div className="d-flex flex-column align-items-center my-4">
      <Spinner animation="border" variant={variant} size={size} />
      {text && <p className="mt-3 text-center">{text}</p>}
    </div>
  );
};

export default Loader;