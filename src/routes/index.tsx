import { useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { useDrawerContext } from "../shared/contexts";
import {
  Dashboard,
  DetalheDeJogos,
  ListagemDeJogo,
} from '../pages';

export const AppRoutes = () => {
  const { setDrawerOptions } = useDrawerContext();

  useEffect(() => {
    setDrawerOptions([
      {
        icon: 'home',
        path: '/pagina-inicial',
        label: 'Página inicial',
      },
      {
        icon: 'sports_esports',
        path: '/jogos',
        label: 'Jogos',
      },
    ]);
  }, []);

  return (
    <Routes>
      <Route path="/pagina-inicial" element={<Dashboard />} />

      <Route path="*" element={<Navigate to="/pagina-inicial" />} />

      <Route path="/jogos" element={<ListagemDeJogo />} />
      <Route path="/jogos/detalhe/:id" element={<DetalheDeJogos />} />
    </Routes>
  );
}