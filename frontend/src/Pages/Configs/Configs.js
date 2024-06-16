import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import AuthWrapper from '../../AuthWrapper/AuthWrapper'; 

function Configs() {
  return (
    <>
      <Navbar />

      <div className="hero min-h-screen fixed bg-base-300">
        <div className="artboard artboard-horizontal rounded-lg h-4/5 w-8/12 mb-32 mr-auto ml-8 p-9 bg-base-100 overflow-y-auto">
          <div className="flex">
            <h1 className="flex-grow text-2xl font-bold">Configurações de restrição e de ingredientes</h1>
          </div>

          <div className="flex flex-col mt-10">
            <div className="form-control w-full">
              <label className="cursor-pointer label">
                <span className="label-text text-2xl mr-5">Receber sugestões de refeições com derivados de laticínios</span>  
                <input type="checkbox" className="toggle toggle-secondary mt-9" />
              </label>
            </div>
            <span className="label-text text-sm ml-1 w-4/5">Alimentos derivados de laticínios são produtos feitos a partir do leite de vaca, cabra, ovelha ou outros mamíferos. Eles incluem uma variedade de produtos como queijo, iogurte, manteiga, creme de leite, leite condensado, entre outros.</span>
            
            <div className="form-control w-full mt-9">
              <label className="cursor-pointer label">
                <span className="label-text text-2xl mr-5">Receber sugestões de refeições com derivados de glúten</span>  
                <input type="checkbox" className="toggle toggle-secondary mt-9" />
              </label>
            </div>
            <span className="label-text text-sm ml-1 w-4/5">Alimentos derivados de glúten são aqueles que contêm a proteína glúten, encontrada em grãos como trigo, cevada, centeio e seus derivados. Exemplos comuns incluem pão, massas, bolos, biscoitos e cerveja.</span>

            <div className="form-control w-full mt-9">
              <label className="cursor-pointer label">
                <span className="label-text text-2xl mr-5">Receber sugestões de refeições não veganas</span>  
                <input type="checkbox" className="toggle toggle-secondary mt-9" />
              </label>
            </div>
            <span className="label-text text-sm ml-1 w-4/5">Refeições não veganas incluem pratos que contêm produtos de origem animal, como carne, peixe, aves, laticínios e ovos. Exemplos comuns são bife grelhado com legumes assados, frango assado com salada verde, salmão ao molho de limão com arroz integral e brócolis, massa com molho à bolonhesa e queijo ralado, entre outros.</span>
            
            <div className="form-control w-full mt-9">
              <label className="cursor-pointer label">
                <span className="label-text text-2xl mr-5">Receber sugestões de refeições não vegetarianas</span>  
                <input type="checkbox" className="toggle toggle-secondary mt-9" />
              </label>
            </div>
            <span className="label-text text-sm ml-1 w-4/5">Refeições não vegetarianas incluem pratos que contêm carne, peixe ou aves, mas podem incluir outros alimentos de origem animal, como laticínios e ovos. Exemplos típicos são hambúrgueres de carne com queijo e salada, filé de peixe grelhado com purê de batata, frango à parmegiana com espaguete, sopa de frango com legumes, entre outros.</span>
          </div>

        </div>
        <div className="artboard artboard-horizontal rounded-lg h-4/5 w-[29%] mb-32 ml-auto mr-8 p-9 bg-base-100">
          <div className="flex">
            <h1 className="flex-grow text-2xl font-bold">Configurações de usuário</h1>
          </div>



          
        </div>
      </div>

      <Footer />
    </>
  );
}

export default AuthWrapper(Configs);