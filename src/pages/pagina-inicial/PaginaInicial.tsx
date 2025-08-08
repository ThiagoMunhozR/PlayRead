import { LayoutBaseDePagina } from '../../shared/layouts';
import { JogosHomeSection } from './components/JogosHomeSection';

export const PaginaInicial: React.FC = () => {
  return (
    <LayoutBaseDePagina titulo="Página inicial">
      <JogosHomeSection />
    </LayoutBaseDePagina>
  );
};