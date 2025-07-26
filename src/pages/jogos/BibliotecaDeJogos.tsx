import { useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Environment } from '../../shared/environment';
import { CustomCardList, FerramentasDaListagem } from '../../shared/components';
import { ILayoutBaseDePaginaHandle, LayoutBaseDePagina } from '../../shared/layouts';
import { useAppThemeContext, useAuthContext } from '../../shared/contexts';
import { JogosService } from '../../shared/services/api/jogos/JogosService';

// Função para remover caracteres especiais do nome do arquivo
function removerCaracteresEspeciais(nomeArquivo: string) {
  return nomeArquivo
    .replace(/:/g, '') // Remove os dois pontos
    .replace(/[\/\*\?\"<>\|]/g, ''); // Remove outros caracteres inválidos
}

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

  const [searchParams, setSearchParams] = useSearchParams();
  const pagina = useMemo(() => Number(searchParams.get('pagina') || '1'), [searchParams]);
  const busca = useMemo(() => { return searchParams.get('busca') || ''; }, [searchParams]);

  useEffect(() => {
    consultaRealizada.current = false;
  }, [pagina, busca]);

  useEffect(() => {
    if (!consultaRealizada.current && user?.CodigoUsuario) {
      // Lógica para carregar os jogos
      setIsLoadingJogos(true);
      
      const pageSize = window.innerWidth <= 600 ? 24 : 25;

      JogosService.getAll(user?.CodigoUsuario, pagina, busca, pageSize)
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
  }, [user?.CodigoUsuario, pagina, busca]);

  // Função para verificar e buscar a capa do jogo
  const verificarCapaDoJogo = async (nomeJogo: string) => {
    const imagePath = `/imagens/jogos/${removerCaracteresEspeciais(nomeJogo)}.jpg`;
    const defaultImagePath = '/imagens/SemImagem.jpg';

    // Verificar se a imagem já existe no caminho local
    const image = new Image();
    image.src = imagePath;

    // Usar uma Promise para garantir o carregamento da imagem
    return new Promise<string>((resolve) => {
      image.onload = () => {
        resolve(imagePath);
      };

      image.onerror = async () => {
        // Caso não tenha encontrado a imagem localmente, buscar no cachê ou API
        try {
          const imageUrl = await JogosService.buscarCapaDoJogo(nomeJogo);
          resolve(imageUrl); 
        } catch (error) {
          console.error('Erro ao buscar a capa do jogo:', error);
          resolve(defaultImagePath); 
        }
      };
    });
  };

  // Carregar as imagens dos jogos
  useEffect(() => {
    const carregarImagens = async () => {
      const imagens: { [key: string]: string } = {}; // Tipando a variável temporária
      for (const jogo of jogos) {
        const capa = await verificarCapaDoJogo(jogo.nome);

        imagens[jogo.nome] = capa;
      }
      setImagensJogos(imagens);
    };

    if (jogos.length > 0) {
      carregarImagens(); // Carrega as imagens apenas quando os jogos são carregados
    }
  }, [jogos]); // Dependência para executar sempre que a lista de jogos mudar

  return (
    <LayoutBaseDePagina
      ref={layoutRef}  
      titulo="Biblioteca de Jogos"
      barraDeFerramentas={
        <FerramentasDaListagem
          mostrarInputBusca
          textoDaBusca={busca}
          aoMudarTextoDeBusca={(texto) => setSearchParams({ busca: texto, pagina: '1' }, { replace: true })}
          aoClicarEmNovo={() => navigate('/jogos/detalhe/novo')}
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
        />
      </Box>
    </LayoutBaseDePagina>
  );
};
