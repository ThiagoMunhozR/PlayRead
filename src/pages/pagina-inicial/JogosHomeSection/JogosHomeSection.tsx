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

    const { data: games = { totalCount: 0, data: [] }, isLoading: IsLoadingGames } = useQuery({
        queryKey: ['jogos', user?.CodigoUsuario],
        queryFn: async () => {
            const result = await JogosService.getAll(user?.CodigoUsuario, 0, '', 9999);
            if (result instanceof Error) throw new Error(result.message);
            return result;
        },
        enabled: !!user?.CodigoUsuario,
        refetchOnWindowFocus: false, // impede refetch automático ao focar a janela
    });

    const isLoading = IsLoadingGames;
    const totalCount = games?.totalCount ?? 0;
    const gamesList = games?.data ?? [];

    const ultimosZerados = useMemo(() => gamesList.slice(0, 10), [gamesList]);

    const melhoresAvaliados = useMemo(() => {
        return gamesList
            .filter(jogo => typeof jogo.avaliacao === 'number' && jogo.avaliacao > 0)
            .sort((a, b) => (b.avaliacao ?? 0) - (a.avaliacao ?? 0))
            .slice(0, 10);
    }, [gamesList]);

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

    // Estado reativo para os últimos jogos jogados e horário de atualização
    const [ultimosJogosJogados, setUltimosJogosJogados] = useState<any[]>([]);
    const [horarioUltimaAtualizacao, setHorarioUltimaAtualizacao] = useState<string | null>(null);

    // Função para ler do localStorage e horário
    const carregarUltimosJogosJogadosEHorario = () => {
        let jogos: any[] = [];
        let horario: string | null = null;
        try {
            const userStr = localStorage.getItem('APP_USER') || localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            if (user?.Xuid) {
                const titleHistoryStr = localStorage.getItem(`titleHistory_${user.Xuid}`);
                if (titleHistoryStr) {
                    const titleHistory = JSON.parse(titleHistoryStr);
                    if (Array.isArray(titleHistory.titles)) {
                        jogos = titleHistory.titles.slice(0, 10);
                    }
                }
                // Busca o horário de atualização
                const lastFetchStr = localStorage.getItem(`titleHistory_lastFetch_${user.Xuid}`);
                if (lastFetchStr) {
                    const date = new Date(Number(lastFetchStr));
                    const horas = date.getHours().toString().padStart(2, '0');
                    const minutos = date.getMinutes().toString().padStart(2, '0');
                    horario = `${horas}:${minutos}`;
                }
            }
        } catch { }
        return { jogos, horario };
    };

    // Atualiza ao montar e ao receber evento customizado
    useEffect(() => {
        const atualizar = () => {
            const { jogos, horario } = carregarUltimosJogosJogadosEHorario();
            setUltimosJogosJogados(jogos);
            setHorarioUltimaAtualizacao(horario);
        };
        atualizar();

        // Evento customizado para atualização imediata
        const onTitleHistoryUpdated = () => {
            atualizar();
        };
        window.addEventListener('titleHistoryUpdated', onTitleHistoryUpdated);

        // Listener para mudanças em outras abas
        const onStorage = (e: StorageEvent) => {
            if (e.key && e.key.startsWith('titleHistory_')) {
                atualizar();
            }
        };
        window.addEventListener('storage', onStorage);

        return () => {
            window.removeEventListener('titleHistoryUpdated', onTitleHistoryUpdated);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

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
                    title="Últimos jogos jogados:"
                    items={ultimosJogosJogados.map((jogo) => {
                        // Procura o jogo correspondente no gamesList pelo nome
                        const jogoLocal = gamesList.find(g => g.nome === jogo.name);
                        return {
                            id: jogo.titleId || jogo.name,
                            imageSrc:
                                imagensJogos[jogo.name]
                                || jogo.displayImage
                                || '/imagens/loading.gif',
                            title: jogo.name,
                            subtitle: jogoLocal?.data,
                            rating: jogoLocal?.avaliacao,
                            showTrophy: !!jogoLocal?.dataCompleto,
                        };
                    })}
                    defaultExpanded={true}
                    isMobile={isMobile}
                    loading={false}
                    horarioAtualizacao={horarioUltimaAtualizacao || undefined}
                />

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
                <JogosEstatisticas games={gamesList} totalCount={totalCount} />
            </AccordionDetails>
        </Accordion>
    );
};
