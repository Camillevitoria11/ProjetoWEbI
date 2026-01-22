import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Registro } from './pages/Registro';
import { Dashboard } from './pages/Dashboard';

function App() {
  // CORREÇÃO: Usar a mesma chave que definimos no Login e na API
  const isAuthenticated = !!localStorage.getItem('@App:token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Registro />} />
        
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;