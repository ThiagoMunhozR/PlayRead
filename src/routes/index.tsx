import { useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { useDrawerContext } from "../shared/contexts";
import {
  BibliotecaDeJogos,
  DetalheDeJogos,
  ListagemDeJogo,
} from '../pages';

export const AppRoutes = () => {
  const { setDrawerOptions } = useDrawerContext();

  useEffect(() => {
    setDrawerOptions([
      {
        icon: 'sports_esports',
        path: '/biblioteca-jogos',
        label: 'Biblioteca',
      },
      {
        icon: 'settings',
        path: '/jogos',
        label: 'Gerenciar',
      },
    ]);
  }, []);

  return (
    <Routes>
      <Route path="/biblioteca-jogos" element={<BibliotecaDeJogos />} />

      <Route path="*" element={<Navigate to="/biblioteca-jogos" />} />

      <Route path="/jogos" element={<ListagemDeJogo />} />
      <Route path="/jogos/detalhe/:id" element={<DetalheDeJogos />} />
    </Routes>
  );
}