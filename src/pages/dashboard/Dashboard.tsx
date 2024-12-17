import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Grid, LinearProgress, Typography } from '@mui/material';

import { FerramentasDaListagem } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';
import { JogosService } from '../../shared/services/api/jogos/JogosService';

// Função para remover caracteres especiais do nome do arquivo
function removerCaracteresEspeciais(nomeArquivo: string) {
  return nomeArquivo
    .replace(/:/g, '') // Remove os dois pontos
    .replace(/[\/\*\?\"<>\|]/g, '') // Remove outros caracteres inválidos
}

// Função para estilos dinâmicos dos cards
const getCardStyles = (isMobile: boolean) => ({
  height: isMobile ? 300 : 455, // Altura menor para celulares
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
  maxHeight: isMobile ? 250 : 350, // Limita a altura máxima para imagens grandes
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

export const Dashboard = () => {
  const [isLoadingJogos, setIsLoadingJogos] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [jogos, setJogos] = useState<any[]>([]);

  useEffect(() => {
    // Lógica para carregar os jogos
    setIsLoadingJogos(true);
    JogosService.getAll(0)
      .then((result) => {
        setIsLoadingJogos(false);
        if (result instanceof Error) {
          alert(result.message);
        } else {
          setJogos(result.data);
        }
      });
  }, []);

  // Detectar tamanho da tela e ajustar isMobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);

    handleResize(); // Configura o estado inicial
    window.addEventListener('resize', handleResize);

    // Cleanup para remover o event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <LayoutBaseDePagina
      titulo="Página inicial"
      barraDeFerramentas={
        < FerramentasDaListagem
          mostrarInputBusca
          //textoDaBusca={busca} 
          mostrarBotaoNovo={false}
        />
      }
    >
      <Box width="100%" display="flex">
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
        <Grid container spacing={2} margin={2}>
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
                  src={`/imagens/jogos/${removerCaracteresEspeciais(
                    jogo.nome
                  )}.jpg`}
                  alt={jogo.nome}
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
      </Box>
    </LayoutBaseDePagina>
  );
};