import { useEffect, useMemo, useRef, useState } from 'react';
import { OrdemType, DirecaoType } from '../../shared/components/ferramentas-da-listagem/components/OrdenacaoMenu';
import { Box } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Environment } from '../../shared/environment';
import { CustomCardList, FerramentasDaListagem } from '../../shared/components';
import { ILayoutBaseDePaginaHandle, LayoutBaseDePagina } from '../../shared/layouts';
import { useAppThemeContext, useAuthContext } from '../../shared/contexts';
import { JogosService } from '../../shared/services/api/jogos/JogosService';
import { carregarImagensItens } from '../../shared/utils/carregarImagensItens';

export const BibliotecaDeJogos = () => {
  const [isLoadingJogos, setIsLoadingJogos] = useState(true);
  const { isMobile } = useAppThemeContext();
  const navigate = useNavigate();
  const [jogos, setJogos] = useState<any[]>([]);
  const [imagensJogos, setImagensJogos] = useState<{ [key: string]: string }>({}); // Tipando o estado
  const { user } = useAuthContext();
  const [totalCount, setTotalCount] = useState(0);
  const consultaRealizada = useRef(true);
  const layoutRef = useRef<ILayoutBaseDePaginaHandle>(null);
  const [ordem, setOrdem] = useState<OrdemType>(() => localStorage.getItem('biblioteca-jogos-ordem') as OrdemType || 'data');
  const [direcao, setDirecao] = useState<DirecaoType>(() => localStorage.getItem('biblioteca-jogos-direcao') as DirecaoType || 'desc');
  const [reloadFlag, setReloadFlag] = useState(0);

  const recarregarJogos = () => setReloadFlag(flag => flag + 1);

  const [searchParams, setSearchParams] = useSearchParams();
  const pagina = useMemo(() => Number(searchParams.get('pagina') || '1'), [searchParams]);
  const busca = useMemo(() => { return searchParams.get('busca') || ''; }, [searchParams]);

  useEffect(() => {
    consultaRealizada.current = false;
  }, [pagina, busca, ordem, direcao, reloadFlag]);

  useEffect(() => {
    if (!consultaRealizada.current && user?.CodigoUsuario) {
      setIsLoadingJogos(true);
      const pageSize = window.innerWidth <= 600 ? 24 : 25;

      // Consulta customizada conforme ordenação
      JogosService.getAll(user?.CodigoUsuario, pagina, busca, pageSize, ordem, direcao)
        .then((result) => {
          setIsLoadingJogos(false);
          if (result instanceof Error) {
            alert(result.message);
          } else {
            setTotalCount(result.totalCount);
            setJogos(result.data);
          }
        });
      consultaRealizada.current = true;
    }
  }, [user?.CodigoUsuario, pagina, busca, ordem, direcao, reloadFlag]);

  // Carregar as imagens dos jogos
  useEffect(() => {
    if (jogos.length > 0) {
      carregarImagensItens(jogos, 'jogos', JogosService.buscarCapaDoJogo)
        .then(setImagensJogos);
    }
  }, [jogos]);

  return (
    <LayoutBaseDePagina
      ref={layoutRef}
      titulo="Biblioteca de Jogos"
      barraDeFerramentas={
        <FerramentasDaListagem
          mostrarInputBusca
          textoDaBusca={busca}
          aoMudarTextoDeBusca={(texto) => setSearchParams({ busca: texto, pagina: '1' }, { replace: true })}
          aoClicarEmNovo={() => navigate('/jogos/detalhe/novo', { state: { from: 'biblioteca' } })}
          ordem={ordem}
          direcao={direcao}
          aoMudarOrdenacao={(novaOrdem, novaDirecao) => {
            setOrdem(novaOrdem);
            setDirecao(novaDirecao);
            localStorage.setItem('biblioteca-jogos-ordem', novaOrdem);
            localStorage.setItem('biblioteca-jogos-direcao', novaDirecao);
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
          items={jogos.map((jogo) => ({
            id: jogo.id,
            imageSrc: imagensJogos[jogo.nome] || '/imagens/loading.gif',
            title: jogo.nome,
            subtitle: jogo.data,
            rating: jogo.avaliacao || 0,
            showTrophy: !!jogo.dataCompleto,
          }))}
          isMobile={isMobile}
          showPagination={true}
          page={pagina}
          totalCount={totalCount}
          limitPerPage={Environment.LIMITE_DE_LINHAS}
          isLoading={isLoadingJogos}
          onPageChange={(newPage) => {
            setSearchParams({ busca, pagina: newPage.toString() }, { replace: true });
            layoutRef.current?.scrollToTop();
          }}
          onDeleted={recarregarJogos}
        />
      </Box>
    </LayoutBaseDePagina>
  );
};
