import { useEffect, useMemo, useRef, useState } from 'react';
import { OrdemType, DirecaoType } from '../../shared/components/ferramentas-da-listagem/components/OrdenacaoMenu';
import { Box } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Environment } from '../../shared/environment';
import { CustomCardList, FerramentasDaListagem } from '../../shared/components';
import { ILayoutBaseDePaginaHandle, LayoutBaseDePagina } from '../../shared/layouts';
import { useAuthContext } from '../../shared/contexts';
import { LivrosService } from '../../shared/services/api/livros/LivrosService';
import { carregarImagensItens } from '../../shared/utils/carregarImagensItens';

export const BibliotecaDeLivros = () => {
  const [isLoadingLivros, setIsLoadingLivros] = useState(true);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [Livros, setLivros] = useState<any[]>([]);
  const [imagensLivros, setImagensLivros] = useState<{ [key: string]: string }>({}); // Tipando o estado
  // Estados de ordenação
  const [ordem, setOrdem] = useState<OrdemType>('data');
  const [direcao, setDirecao] = useState<DirecaoType>('desc');
  const { user } = useAuthContext();
  const [totalCount, setTotalCount] = useState(0);
  const consultaRealizada = useRef(true);
  const layoutRef = useRef<ILayoutBaseDePaginaHandle>(null); 

  const [searchParams, setSearchParams] = useSearchParams();
  const pagina = useMemo(() => Number(searchParams.get('pagina') || '1'), [searchParams]);
  const busca = useMemo(() => { return searchParams.get('busca') || ''; }, [searchParams]);

  useEffect(() => {
    consultaRealizada.current = false;
  }, [pagina, busca, ordem, direcao]);

  useEffect(() => {
    if (!consultaRealizada.current && user?.CodigoUsuario) {
      setIsLoadingLivros(true);
      const pageSize = window.innerWidth <= 600 ? 24 : 25;
      LivrosService.getAll(user?.CodigoUsuario, pagina, busca, pageSize, ordem, direcao)
        .then((result) => {
          setIsLoadingLivros(false);
          if (result instanceof Error) {
            alert(result.message);
          } else {
            setTotalCount(result.totalCount);
            setLivros(result.data);
          }
        });
      consultaRealizada.current = true;
    }
  }, [user?.CodigoUsuario, pagina, busca, ordem, direcao]);

  // Detectar tamanho da tela e ajustar isMobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);

    handleResize(); // Configura o estado inicial
    window.addEventListener('resize', handleResize);

    // Cleanup para remover o event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Carregar as imagens dos Livros (utilitário genérico)
  useEffect(() => {
    if (Livros.length > 0) {
      carregarImagensItens(Livros, 'livros', LivrosService.buscarCapaDoLivro)
        .then(setImagensLivros);
    }
  }, [Livros]);

  return (
    <LayoutBaseDePagina
      ref={layoutRef}  
      titulo="Biblioteca de Livros"
      barraDeFerramentas={
        <FerramentasDaListagem
          mostrarInputBusca
          textoDaBusca={busca}
          aoMudarTextoDeBusca={(texto) => setSearchParams({ busca: texto, pagina: '1' }, { replace: true })}
          aoClicarEmNovo={() => navigate('/livros/detalhe/novo')}
          ordem={ordem}
          direcao={direcao}
          aoMudarOrdenacao={(novaOrdem, novaDirecao) => {
            setOrdem(novaOrdem);
            setDirecao(novaDirecao);
            setSearchParams({ busca, pagina: '1' }, { replace: true });
          }}
        />
      }
    >
      <Box
        width="100%"
        display="flex"
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }} // Permite rolagem no contêiner
      >
        <CustomCardList
          items={Livros.map((Livro) => ({
            id: Livro.id,
            imageSrc: imagensLivros[Livro.nome] || '/imagens/loading.gif',
            title: Livro.nome,
            subtitle: Livro.data,
            rating: Livro.avaliacao || 0,
          }))}
          isMobile={isMobile}
          showPagination={true}
          page={pagina}
          totalCount={totalCount}
          limitPerPage={Environment.LIMITE_DE_LINHAS}
          isLoading={isLoadingLivros}
          onPageChange={(newPage) => {
            setSearchParams({ busca, pagina: newPage.toString() }, { replace: true });
            layoutRef.current?.scrollToTop();
          }}
        />
      </Box>
    </LayoutBaseDePagina>
  );
};
