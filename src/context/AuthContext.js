'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    if (token && rol) {
      setUsuario({ token, rol });
    }
    setCargando(false);
  }, []);

  async function login(email, password) {
    const datos = await api.post('/auth/login', { email, password }, { sinRedirect401: true });
    localStorage.setItem('token', datos.token);
    localStorage.setItem('rol', datos.rol);
    setUsuario({ token: datos.token, rol: datos.rol });
    router.push('/dashboard');
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    setUsuario(null);
    router.push('/login');
  }

  function esJefe() {
    return usuario?.rol === 'jefe';
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout, esJefe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
