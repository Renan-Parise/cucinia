import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import loginPhoto from './photo.jpeg';
import backgroundImg from './5.jpg';

const Container = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url(${backgroundImg});
`;

const RegisterBox = styled.div`
  background-color: #f9fafb;
  border-radius: 1rem;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
  padding: 1.25rem;
  max-width: 80rem;
  width: 100%;
  display: flex;
  align-items: center;
`;

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    ingredients: ['Alface']
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/v1/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if (response.ok) {
        setFormData({
          name: '',
          email: '',
          password: '',
          ingredients: ['Alface']
        });

        setRegistrationSuccess(true);

        navigate('/login');
      } else {
        throw new Error('Network response was not ok');
      }
    })
    .catch(error => console.error('Error registering:', error));
  };

  return (
    <>
      <Container>
        <RegisterBox>
          <div className="md:w-1/2 py-8 md:px-16">
            <h2 className="font-bold text-2xl text-secondary">Registrar</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                className="p-2 mt-8 rounded-xl border"
                type="text"
                name="name"
                placeholder="Nome"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                className="p-2 rounded-xl border w-full"
                type="email"
                name="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                className="p-2 rounded-xl border w-full"
                type="password"
                name="password"
                placeholder="Senha"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button className="bg-secondary rounded-xl text-white py-2 hover:scale-105 duration-300">
                Register
              </button>
            </form>
            
            <div className="text-xs border-b py-4 text-secondary">
              Esqueceu sua senha?
            </div>

            <div className="text-xs flex justify-between mt-3 text-secondary">
              <p>Já tem conta?</p>
              <a href="/login" className="py-2 px-5 bg-white border rounded-xl hover:scale-110 duration-300">
                Login
              </a>
            </div>
          </div>
          <div className="md:block mr-8 hidden w-1/2">
            <img src={loginPhoto} className="rounded-lg" alt="login" />
          </div>
        </RegisterBox>
      </Container>
    </>
  );
}

export default Register;