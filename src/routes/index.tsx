import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDrawerContext } from '../shared/contexts';
import {
  BibliotecaDeJogos,
  DetalheDeJogos,
  ListagemDeJogo,
  BibliotecaDeLivros,
  ListagemDeLivro,
  DetalheDeLivros
} from '../pages';

export const AppRoutes = () => {
  const { setDrawerOptions } = useDrawerContext();

  useEffect(() => {
    setDrawerOptions([
      {
        icon: 'sports_esports',
        label: 'Jogos',
        subOptions: [
          { icon: 'book', path: '/biblioteca-jogos', label: 'Biblioteca' },
          { icon: 'settings', path: '/jogos', label: 'Gerenciar' },
        ],
      },
      {
        icon: 'menu_book',
        label: 'Livros',
        subOptions: [
          { icon: 'book', path: '/biblioteca-livros', label: 'Biblioteca' },
          { icon: 'settings', path: '/livros', label: 'Gerenciar' },
        ],
      },
    ]);
  }, []);

  return (
    <Routes>
      <Route path="/biblioteca-jogos" element={<BibliotecaDeJogos />} />
      <Route path="/jogos" element={<ListagemDeJogo />} />
      <Route path="/jogos/detalhe/:id" element={<DetalheDeJogos />} />
      <Route path="/biblioteca-livros" element={<BibliotecaDeLivros />} />
      <Route path="/livros" element={<ListagemDeLivro />} />
      <Route path="/livros/detalhe/:id" element={<DetalheDeLivros />} />

      <Route path="*" element={<Navigate to="/biblioteca-jogos" />} />
    </Routes>
  );
};
