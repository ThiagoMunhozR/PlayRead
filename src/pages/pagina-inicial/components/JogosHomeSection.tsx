import { useState, useMemo, useEffect } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { JogosVisaoGeral } from './JogosVisaoGeral';
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
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h5" sx={{ margin: '0 0 0 8px' }}>Jogos</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <JogosVisaoGeral games={games} totalCount={totalCount} />
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
            </AccordionDetails>
        </Accordion>
    );
};
