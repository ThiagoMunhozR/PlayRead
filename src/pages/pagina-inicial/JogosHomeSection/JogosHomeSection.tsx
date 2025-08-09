import { useState, useMemo, useEffect } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Icon, Box, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { JogosEstatisticas } from './components/JogosEstatisticas';
import { JogosService } from '../../../shared/services/api/jogos/JogosService';
import { useAuthContext, useAppThemeContext } from '../../../shared/contexts';
import { carregarImagensItens } from '../../../shared/utils/carregarImagensItens';
import { CustomCardRows } from '../../../shared/components/CustomCard/CustomCardRows';
import { useQuery } from '@tanstack/react-query';
import { DirecaoType, OrdemType } from '../../../shared/components/ferramentas-da-listagem/components/OrdenacaoMenu';
import { useNavigate } from 'react-router-dom';

export const JogosHomeSection: React.FC = () => {
    const { user } = useAuthContext();
    const { isMobile, themeName } = useAppThemeContext();
    const navigate = useNavigate();

    const [imagensJogos, setImagensJogos] = useState<{ [key: string]: string }>({});
    const [totalCount, setTotalCount] = useState(0);

    const { data: games = [], isLoading } = useQuery({
        queryKey: ['jogos', user?.CodigoUsuario],
        queryFn: async () => {
            const result = await JogosService.getAll(user?.CodigoUsuario, 0, '', 9999);
            if (result instanceof Error) throw new Error(result.message);
            setTotalCount(result.totalCount ?? 0);
            return result.data;
        },
        enabled: !!user?.CodigoUsuario,
        refetchOnWindowFocus: true,
    });

    const ultimosZerados = useMemo(() => games.slice(0, 10), [games]);

    const melhoresAvaliados = useMemo(() => {
        return games
            .filter(jogo => typeof jogo.avaliacao === 'number' && jogo.avaliacao > 0)
            .sort((a, b) => (b.avaliacao ?? 0) - (a.avaliacao ?? 0))
            .slice(0, 10);
    }, [games]);


    useEffect(() => {
        const jogosParaImagens = [...ultimosZerados, ...melhoresAvaliados]
            .filter((jogo, index, arr) => arr.findIndex(j => j.id === jogo.id) === index);
        if (jogosParaImagens.length > 0) {
            carregarImagensItens(jogosParaImagens, 'jogos', JogosService.buscarCapaDoJogo)
                .then(setImagensJogos);
        }
    }, [ultimosZerados, melhoresAvaliados]);

    const handleVerMais = (ordem: OrdemType, direcao: DirecaoType) => {
        navigate('/biblioteca-jogos', {
            state: {
                ordem,
                direcao,
            },
        });
    };

    return (
        <Accordion defaultExpanded sx={{ width: '100%', marginBottom: 2, bgcolor: themeName === 'dark' ? 'background.default' : 'background.paper', boxShadow: 'none', border: 'none' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                <Box display="flex" alignItems="center">
                    <Icon sx={{ fontSize: 28, mr: 2 }}>sports_esports</Icon>
                    <Typography variant="h5">
                        Jogos
                    </Typography>
                </Box>
            </AccordionSummary>
            <AccordionDetails>
                <Box display="flex" justifyContent="space-between" width="100%" mb={2}>
                    <Button
                        color='primary'
                        disableElevation
                        variant='contained'
                        onClick={() => navigate('/biblioteca-jogos')}
                        startIcon={<Icon>book</Icon>}
                    >Biblioteca</Button>
                    <Button
                        color='primary'
                        disableElevation
                        variant='contained'
                        onClick={() => navigate('/jogos/detalhe/novo', { state: { from: 'biblioteca' } })}
                        endIcon={<Icon>add</Icon>}
                    >Novo</Button>
                </Box>

                <CustomCardRows
                    title="Últimos jogos zerados:"
                    items={ultimosZerados.map((jogo) => ({
                        id: jogo.id,
                        imageSrc: imagensJogos[jogo.nome] || '/imagens/loading.gif',
                        title: jogo.nome,
                        subtitle: jogo.data,
                        rating: jogo.avaliacao || 0,
                        showTrophy: !!jogo.dataCompleto,
                    }))}
                    defaultExpanded={true}
                    isMobile={isMobile}
                    loading={isLoading}
                    onSeeMore={() => handleVerMais('data', 'desc')}
                />
                <CustomCardRows
                    title="Melhores jogos avaliados:"
                    items={melhoresAvaliados.map((jogo) => ({
                        id: jogo.id,
                        imageSrc: imagensJogos[jogo.nome] || '/imagens/loading.gif',
                        title: jogo.nome,
                        subtitle: jogo.data,
                        rating: jogo.avaliacao || 0,
                        showTrophy: !!jogo.dataCompleto,
                    }))}
                    isMobile={isMobile}
                    loading={isLoading}
                    onSeeMore={() => handleVerMais('avaliacao', 'desc')}
                />
                <JogosEstatisticas games={games} totalCount={totalCount} />
            </AccordionDetails>
        </Accordion>
    );
};
