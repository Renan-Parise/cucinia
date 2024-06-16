import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthWrapper = (WrappedComponent) => {
  const WithAuth = (props) => {
    const navigate = useNavigate();

    useEffect(() => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
      }
    }, [navigate]);

    return <WrappedComponent {...props} />;
  };

  return WithAuth;
};

export default AuthWrapper;