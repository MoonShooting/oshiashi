import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RouterList } from '@/router/RouterList';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {RouterList.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
