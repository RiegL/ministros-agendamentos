
import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-primary text-primary-foreground py-2 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold">Ministros da Eucaristia</h2>
            <p className="text-sm opacity-75">
              Sistema de agendamentos para ministros
            </p>
          </div>
          <div className="text-sm opacity-75">
            &copy; {year} CodeL. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
