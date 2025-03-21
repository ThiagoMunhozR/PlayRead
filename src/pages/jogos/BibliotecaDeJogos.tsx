import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Card, CardContent, Grid, LinearProgress, Pagination, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Environment } from '../../shared/environment';
import { FerramentasDaListagem } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';
import { useAuthContext } from '../../shared/contexts';
import { JogosService } from '../../shared/services/api/jogos/JogosService';

// Função para remover caracteres especiais do nome do arquivo
function removerCaracteresEspeciais(nomeArquivo: string) {
  return nomeArquivo
    .replace(/:/g, '') // Remove os dois pontos
    .replace(/[\/\*\?\"<>\|]/g, ''); // Remove outros caracteres inválidos
}

// Função para estilos dinâmicos dos cards
const getCardStyles = (isMobile: boolean) => ({
  height: isMobile ? 320 : 455, // Altura menor para celulares
  width: isMobile ? '90%' : '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  flexGrow: 1, // Permite que o card cresça e ocupe o espaço disponível
});

// Função para estilos dinâmicos das imagens
const getImageStyles = (isMobile: boolean) => ({
  width: '100%', // A largura será 100% do card
  height: '100%', // A altura será 100% do card
  objectFit: 'cover', // A imagem preencherá o espaço do contêiner sem distorção
  maxHeight: isMobile ? 240 : 350, // Limita a altura máxima para imagens grandes
  borderRadius: '4px 4px 0 0', // Arredondar os cantos superiores
});

// Função para estilos dinâmicos do texto
const getTextStyles = (isMobile: boolean) => ({
  title: {
    fontSize: isMobile ? '0.92rem' : '1.25rem', // Tamanho reduzido para celulares
    fontWeight: 600,
  },
  subtitle: {
    fontSize: isMobile ? '0.75rem' : '1rem', // Texto secundário menor para celulares
    marginTop: isMobile ? 0.5 : 1,
  },
});

export const BibliotecaDeJogos = () => {
  const [isLoadingJogos, setIsLoadingJogos] = useState(true);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [jogos, setJogos] = useState<any[]>([]);
  const [imagensJogos, setImagensJogos] = useState<{ [key: string]: string }>({}); // Tipando o estado
  const { user } = useAuthContext();
  const [totalCount, setTotalCount] = useState(0);
  const consultaRealizada = useRef(true);

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
      console.log('Realizado consulta');
      JogosService.getAll(user?.CodigoUsuario, pagina, busca)
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

  // Detectar tamanho da tela e ajustar isMobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);

    handleResize(); // Configura o estado inicial
    window.addEventListener('resize', handleResize);

    // Cleanup para remover o event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      <Box width="100%" display="flex" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {isLoadingJogos && (
          <Box
            sx={{
              width: '90%', // Faz o LinearProgress ocupar 90% da largura
              margin: '0 auto', // Centraliza na tela
              position: 'absolute',
              top: '50%', // Fica na vertical centralizada
              left: '50%', // Fica na horizontal centralizada
              transform: 'translate(-50%, -50%)', // Ajuste para o centro exato
            }}
          >
            <LinearProgress variant="indeterminate" />
          </Box>
        )}
        <Grid container spacing={isMobile ? 1 : 2} margin={0}>
          {jogos.map((jogo) => (
            <Grid
              item
              key={jogo.id}
              xs={6} // 2 cards por linha em celulares
              sm={4} // 3 cards por linha em tablets
              md={4} // 3 cards por linha em telas médias
              lg={2.4} // 5 cards por linha em desktops
              xl={2.4} // 5 cards por linha em telas grandes
            >
              <Card sx={getCardStyles(isMobile)}>
                {/* Imagem da capa do jogo */}
                <Box
                  component="img"
                  src={imagensJogos[jogo.nome] || '/imagens/loading.gif'}
                  alt=''
                  sx={getImageStyles(isMobile)}
                />

                {/* Conteúdo do card */}
                <CardContent
                  sx={{
                    padding: isMobile ? '4px' : '12px', // Menos padding em celulares
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={getTextStyles(isMobile).title}
                  >
                    {jogo.nome}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={getTextStyles(isMobile).subtitle}
                  >
                    {jogo.data}
                    <br></br>
                    {jogo.dataCompleto && (
                      <Typography component="span" color="text.secondary" sx={{ ...getTextStyles(isMobile).subtitle, marginRight: 3 }}>
                        🏆 {jogo.dataCompleto}
                      </Typography>
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {(totalCount > 0 && totalCount > Environment.LIMITE_DE_LINHAS) && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 2, // Espaçamento acima da paginação
              marginBottom: 2, // Espaçamento abaixo da paginação
            }}
          >
            <Pagination
              page={pagina}
              count={Math.ceil(totalCount / Environment.LIMITE_DE_LINHAS)}
              onChange={(_, newPage) => setSearchParams({ busca, pagina: newPage.toString() }, { replace: true })}
            />
          </Box>
        )}
      </Box>
    </LayoutBaseDePagina>
  );
};
