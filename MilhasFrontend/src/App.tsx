import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Login } from './pages/Login';
import { Registro } from './pages/Registro';
import { Dashboard } from './pages/Dashboard';
import { RegistrarCompra } from './pages/RegistrarCompra';
import { MeusCartoes } from './pages/MeusCartoes';

interface RouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: RouteProps) {
  const token = localStorage.getItem('@App:token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: RouteProps) {
  const token = localStorage.getItem('@App:token');

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROTAS PÚBLICAS */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/registrar"
          element={
            <PublicRoute>
              <Registro />
            </PublicRoute>
          }
        />

        {/* ROTAS PRIVADAS (PROTEGIDAS) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/registrar-compra"
          element={
            <PrivateRoute>
              <RegistrarCompra />
            </PrivateRoute>
          }
        />

        <Route
          path="/cartoes"
          element={
            <PrivateRoute>
              <MeusCartoes />
            </PrivateRoute>
          }
        />

        {/* REDIRECIONAMENTOS PADRÃO */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}