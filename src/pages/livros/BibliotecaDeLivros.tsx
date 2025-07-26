import { useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Environment } from '../../shared/environment';
import { CustomCardList, FerramentasDaListagem } from '../../shared/components';
import { ILayoutBaseDePaginaHandle, LayoutBaseDePagina } from '../../shared/layouts';
import { useAuthContext } from '../../shared/contexts';
import { LivrosService } from '../../shared/services/api/livros/LivrosService';

// Função para remover caracteres especiais do nome do arquivo
function removerCaracteresEspeciais(nomeArquivo: string) {
  return nomeArquivo
    .replace(/:/g, '') // Remove os dois pontos
    .replace(/[\/\*\?\"<>\|]/g, ''); // Remove outros caracteres inválidos
}

export const BibliotecaDeLivros = () => {
  const [isLoadingLivros, setIsLoadingLivros] = useState(true);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [Livros, setLivros] = useState<any[]>([]);
  const [imagensLivros, setImagensLivros] = useState<{ [key: string]: string }>({}); // Tipando o estado
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
      // Lógica para carregar os Livros
      setIsLoadingLivros(true);

      const pageSize = window.innerWidth <= 600 ? 24 : 25;

      LivrosService.getAll(user?.CodigoUsuario, pagina, busca, pageSize)
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
  }, [user?.CodigoUsuario, pagina, busca]);

  // Detectar tamanho da tela e ajustar isMobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);

    handleResize(); // Configura o estado inicial
    window.addEventListener('resize', handleResize);

    // Cleanup para remover o event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Função para verificar e buscar a capa do Livro
  const verificarCapaDoLivro = async (nomeLivro: string) => {
    const imagePath = `/imagens/livros/${removerCaracteresEspeciais(nomeLivro)}.jpg`;
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
          const imageUrl = await LivrosService.buscarCapaDoLivro(nomeLivro);
          resolve(imageUrl); 
        } catch (error) {
          console.error('Erro ao buscar a capa do Livro:', error);
          resolve(defaultImagePath); 
        }
      };
    });
  };

  // Carregar as imagens dos Livros
  useEffect(() => {
    const carregarImagens = async () => {
      const imagens: { [key: string]: string } = {}; // Tipando a variável temporária
      for (const Livro of Livros) {
        const capa = await verificarCapaDoLivro(Livro.nome);

        imagens[Livro.nome] = capa;
      }
      setImagensLivros(imagens);
    };

    if (Livros.length > 0) {
      carregarImagens(); // Carrega as imagens apenas quando os Livros são carregados
    }
  }, [Livros]); // Dependência para executar sempre que a lista de Livros mudar

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
