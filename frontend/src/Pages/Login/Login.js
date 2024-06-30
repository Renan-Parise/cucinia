import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import loginPhoto from './photo.jpeg';
import backgroundImg from './5.jpg';

const Container = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url(${backgroundImg});
`;

const LoginBox = styled.div`
  background-color: #f9fafb;
  border-radius: 1rem;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
  padding: 1.25rem;
  max-width: 80rem;
  width: 100%;
  display: flex;
  align-items: center;
`;

const Wrapper = styled.div`
  aspect-ratio: 1.618;
  width: 90vmin;
  position: relative;
`;

const Shape = styled.div`
  height: 30%;
  width: 30%;
  background-color: rgba(255, 255, 255, 0.05);
  position: absolute;
  transition: left 750ms ease-in-out, top 750ms ease-in-out, height 750ms ease-in-out, width 750ms ease-in-out, border-radius 750ms ease-in-out;

  &:nth-child(1) {
    background-color: #ff9f1c;
    z-index: 2;
  }

  &:nth-child(2) {
    background-color: #ff5154;
    z-index: 2;
  }

  &:nth-child(3) {
    background-color: rgb(155, 93, 229);
    z-index: 1;
  }

  &:nth-child(4) {
    background-color: #ff88dc;
    z-index: 2;
  }

  &:nth-child(5) {
    background-color: rgb(254, 228, 64);
    z-index: 1;
  }

  &:nth-child(6) {
    background-color: rgb(0, 206, 237);
    z-index: 1;
  }

  &:nth-child(7) {
    background-color: rgb(17, 138, 178);
    z-index: 1;
  }
`;

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const navigate = useNavigate();
  let intervalId;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/v1/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if (response.ok) {
        return response.json(); // Extract JSON from the response
      } else {
        throw new Error('Login failed');
      }
    })
    .then(data => {
      // Store token and user data in local storage
      localStorage.setItem('token', data.token); // Assuming the server sends a token upon successful login
      localStorage.setItem('user', JSON.stringify(data.user)); // Store user data
      navigate('/dashboard');

      // Clear the interval to stop the shape changes
      clearInterval(intervalId);
    })
    .catch(error => console.error('Error logging in:', error));
  };

  useEffect(() => {
    let configuration = 1;
    let roundness = 1;

    function changeShapes() {
      const wrapper = document.getElementById('wrapper');
      if (wrapper) {
        configuration = (configuration % 3) + 1;
        roundness = (roundness % 4) + 1;
        wrapper.setAttribute('data-configuration', configuration);
        wrapper.setAttribute('data-roundness', roundness);
      }
    }

    intervalId = setInterval(changeShapes, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <Container>
        {/* login container */}
        <LoginBox>
          {/* form */}
          <div className="md:w-1/2 py-8 md:px-16">
            <h2 className="font-bold text-2xl text-secondary">Login</h2>
            <p className="text-xs mt-4 text-secondary">
              Se você já é membro, faça login facilmente
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                className="p-2 mt-8 rounded-xl border"
                type="email"
                name="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <div className="relative">
                <input
                  className="p-2 rounded-xl border w-full"
                  type={showPassword ? 'text' : 'password'} // Toggle input type based on showPassword state
                  name="password"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  fill="gray"
                  className="bi bi-eye absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                  viewBox="0 0 16 16"
                  onClick={togglePasswordVisibility} // Toggle password visibility on click
                >
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8ZM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.07-.122.15-.195.236a13.134 13.134 0 0 1-1.66 2.043C11.879 11.332 10.12 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.133 13.133 0 0 1 1.172 8Z" />
                  <path d="M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM6.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
                </svg>
              </div>
              <button className="bg-secondary rounded-xl text-white py-2 hover:scale-105 duration-300">
                Entrar
              </button>
            </form>

            <div className="text-xs border-b py-4 text-secondary">
              Esqueceu sua senha?
            </div>

            <div className="text-xs flex justify-between mt-3 text-secondary">
              <p>Não tem conta?</p>
              <a href="/register" className="py-2 px-5 bg-white border rounded-xl hover:scale-110 duration-300">
                Registrar
              </a>
            </div>
          </div>
          <div className="md:block mr-8 hidden w-1/2">
            <img src={loginPhoto} className="rounded-lg" alt="login" />
          </div>
        </LoginBox>
      </Container>
    </>
  );
}

export default Login;
