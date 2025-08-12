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
                .then(imagens => {
                    setImagensJogos(prev => ({ ...prev, ...imagens }));
                });
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

    const [ultimosJogosJogados, setUltimosJogosJogados] = useState<any[]>([]);
    const [horarioUltimaAtualizacao, setHorarioUltimaAtualizacao] = useState<string | null>(null);
    const [isLoadingXbox, setIsLoadingXbox] = useState(false);

    useEffect(() => {
        if (ultimosJogosJogados.length > 0) {
            // Mapeia para o formato esperado por carregarImagensItens
            const jogosParaImagens = ultimosJogosJogados.map(jogo => ({
                nome: jogo.name,
                titleId: jogo.titleId
            }));
            carregarImagensItens(jogosParaImagens, 'jogos', JogosService.buscarCapaDoJogo)
                .then(imagens => {
                    setImagensJogos(prev => ({ ...prev, ...imagens }));
                });
        }
    }, [ultimosJogosJogados]);

    // Função para ler do localStorage e horário, e buscar do Xbox se necessário
    const carregarUltimosJogosJogadosEHorario = async () => {
        let jogos: any[] = [];
        let horario: string | null = null;
        try {
            const userStr = localStorage.getItem('APP_USER') || localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            if (user?.Xuid) {
                const storageKey = `titleHistory_${user.Xuid}`;
                const lastFetchKey = `titleHistory_lastFetch_${user.Xuid}`;
                const now = Date.now();
                const lastFetch = Number(localStorage.getItem(lastFetchKey));

                // Se nunca buscou ou passou 15 minutos, busca do Xbox em background
                if (!lastFetch || now - lastFetch > 15 * 60 * 1000) {
                    if (!lastFetch) {
                        setIsLoadingXbox(true);
                    }
                    setHorarioUltimaAtualizacao('Atualizando...');
                    console.log('Buscando titleHistory do Xbox...');
                    try {
                        const titleHistory = await JogosService.getTitleHistoryByXuid(user.Xuid);
                        localStorage.setItem(storageKey, JSON.stringify(titleHistory));
                        localStorage.setItem(lastFetchKey, now.toString());
                        // Atualiza a tela com os novos dados
                        if (Array.isArray(titleHistory.titles)) {
                            setUltimosJogosJogados(titleHistory.titles.slice(0, 10));
                        }
                        const date = new Date(now);
                        const horas = date.getHours().toString().padStart(2, '0');
                        const minutos = date.getMinutes().toString().padStart(2, '0');
                        setHorarioUltimaAtualizacao(`Atualizado às ${horas}:${minutos}`);
                    } catch (e) {
                        setHorarioUltimaAtualizacao('Erro ao atualizar');
                    }
                    setIsLoadingXbox(false);
                }
            }
        } catch { setIsLoadingXbox(false); }
        return { jogos, horario };
    };

    useEffect(() => {
        let cancelado = false;
        const atualizar = async () => {
            // Carrega do localStorage imediatamente
            const userStr = localStorage.getItem('APP_USER') || localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            let jogos: any[] = [];
            let horario: string | null = null;
            if (user?.Xuid) {
                const storageKey = `titleHistory_${user.Xuid}`;
                const lastFetchKey = `titleHistory_lastFetch_${user.Xuid}`;
                const titleHistoryStr = localStorage.getItem(storageKey);
                if (titleHistoryStr) {
                    try {
                        const titleHistory = JSON.parse(titleHistoryStr);
                        if (Array.isArray(titleHistory.titles)) {
                            jogos = titleHistory.titles.slice(0, 10);
                        }
                    } catch { }
                }
                const lastFetchStr = localStorage.getItem(lastFetchKey);
                if (lastFetchStr) {
                    const date = new Date(Number(lastFetchStr));
                    const horas = date.getHours().toString().padStart(2, '0');
                    const minutos = date.getMinutes().toString().padStart(2, '0');
                    horario = `${horas}:${minutos}`;
                }
            }
            if (!cancelado) {
                setUltimosJogosJogados(jogos);
                setHorarioUltimaAtualizacao(horario ? 'Atualizado às ' + horario : null);
            }
            // Depois faz a atualização (background)
            await carregarUltimosJogosJogadosEHorario();
        };
        atualizar();

        // Listener para mudanças em outras abas
        const onStorage = (e: StorageEvent) => {
            if (e.key && e.key.startsWith('titleHistory_')) {
                atualizar();
            }
        };
        window.addEventListener('storage', onStorage);

        return () => {
            cancelado = true;
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

                {user?.Xuid && (
                    <CustomCardRows
                        title="Últimos jogos jogados:"
                        items={ultimosJogosJogados.map((jogo) => {
                            // Procura o jogo correspondente no gamesList pelo nome
                            const jogoLocal = gamesList.find(g => (g.nome === jogo.name) || (g.titleId === jogo.titleId));
                            return {
                                id: jogo.titleId || jogo.name,
                                imageSrc:
                                    imagensJogos[jogo.name]
                                    || '/imagens/loading.gif',
                                title: jogo.name,
                                titleId: jogo.titleId,
                                subtitle: jogoLocal?.data,
                                rating: jogoLocal?.avaliacao,
                                showTrophy: !!jogoLocal?.dataCompleto,
                            };
                        })}
                        defaultExpanded={true}
                        isMobile={isMobile}
                        loading={isLoadingXbox}
                        labelInfo={horarioUltimaAtualizacao || undefined}
                    />
                )}

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
