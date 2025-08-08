import { Box, Stack, Typography, useTheme, Grid, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useMemo, useState } from 'react';
import { BarChart } from '@mui/x-charts';
import { JogosZeradosMes } from './JogosZeradosMês';

interface JogosVisaoGeralProps {
    games: Array<{ data?: string; dataCompleto?: string }>;
    totalCount: number;
}

export const JogosVisaoGeral: React.FC<JogosVisaoGeralProps> = ({ games, totalCount }) => {
    const theme = useTheme();
    const [anoSelecionado, setAnoSelecionado] = useState<string | null>(null);

    // Top 3 anos com mais jogos zerados
    // contagem total por ano
    const contagemPorAno = useMemo(() => {
        const contagem: Record<string, number> = {};
        games.forEach(jogo => {
            if (!jogo.data) return;
            const partes = jogo.data.split('/');
            if (partes.length !== 3) return;
            const ano = partes[2];
            contagem[ano] = (contagem[ano] || 0) + 1;
        });
        return contagem;
    }, [games]);

    // contagem de jogos completados (com dataCompleto) por ano
    const contagemCompletosPorAno = useMemo(() => {
        const contagem: Record<string, number> = {};
        games.forEach(jogo => {
            if (!jogo.dataCompleto) return;
            const partes = jogo.dataCompleto.split('/');
            if (partes.length !== 3) return;
            const ano = partes[2];
            contagem[ano] = (contagem[ano] || 0) + 1;
        });
        return contagem;
    }, [games]);

    const anosOrdenados = useMemo(() => {
        // Garante que todos os anos presentes em qualquer uma das contagens apareçam
        const anos = new Set([
            ...Object.keys(contagemPorAno),
            ...Object.keys(contagemCompletosPorAno)
        ]);
        return Array.from(anos).sort();
    }, [contagemPorAno, contagemCompletosPorAno]);

    const jogosPorAno = useMemo(() => {
        return anosOrdenados.map(ano => contagemPorAno[ano] || 0);
    }, [anosOrdenados, contagemPorAno]);

    const jogosCompletosPorAno = useMemo(() => {
        return anosOrdenados.map(ano => contagemCompletosPorAno[ano] || 0);
    }, [anosOrdenados, contagemCompletosPorAno]);

    const top3Anos = useMemo(() => {
        return Object.entries(contagemPorAno)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
    }, [contagemPorAno]);

    return (
        <Stack mt={2} spacing={2} alignItems="center">
            <Grid container spacing={2} justifyContent="center" alignItems="flex-start">
                <Grid item xs={12} md={6}>
                    {anosOrdenados.length > 0 && (
                        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
                            <Typography variant="h6" align="center" gutterBottom>
                                Total de jogos zerados: {totalCount}
                            </Typography>
                            <BarChart
                                xAxis={[{ data: anosOrdenados, label: 'Ano' }]}
                                series={[
                                    {
                                        data: jogosCompletosPorAno,
                                        label: 'Completados',
                                        color: '#FFD700',
                                        stack: 'total'
                                    },
                                    {
                                        data: jogosPorAno,
                                        label: 'Jogos zerados',
                                        color: theme.palette.primary.main,
                                        stack: 'total'
                                    }
                                ]}
                                height={300}
                                margin={{ top: 16, right: 16, left: 16, bottom: 32 }}
                                layout="vertical"
                                onItemClick={(_, item) => {
                                    const ano = anosOrdenados[item.dataIndex];
                                    setAnoSelecionado(ano);
                                }}
                                sx={{ cursor: 'pointer' }}
                            />
                        </Box>
                    )}
                </Grid>
                <Grid item xs={12} md={6}>
                    {anoSelecionado && (
                        <Box>
                            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                                <Typography variant="h6" align="center" gutterBottom>
                                    Jogos zerados por mês em {anoSelecionado}
                                </Typography>
                                <IconButton size="small" aria-label="Fechar" onClick={() => setAnoSelecionado(null)}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                            <JogosZeradosMes games={games} ano={anoSelecionado} />
                        </Box>
                    )}
                </Grid>
                <Box>
                    <Typography variant="h6" align="center" gutterBottom>
                        Top 3 anos com mais jogos zerados
                    </Typography>
                    <Stack spacing={1} alignItems="center">
                        {top3Anos.map(([ano, qtd], idx) => (
                            <Typography key={ano} variant="body1">
                                {idx === 0 && '🥇'}{idx === 1 && '🥈'}{idx === 2 && '🥉'} {ano} : {qtd} jogo{qtd > 1 ? 's' : ''}
                            </Typography>
                        ))}
                        {/* Adiciona o ano atual se não estiver no top 3 */}
                        {(() => {
                            const anoAtual = new Date().getFullYear().toString();
                            const jaNoTop3 = top3Anos.some(([ano]) => ano === anoAtual);
                            if (!jaNoTop3 && contagemPorAno[anoAtual]) {
                                return (
                                    <Typography key={anoAtual} variant="body1">
                                        {'📅'} {anoAtual} : {contagemPorAno[anoAtual]} jogo{contagemPorAno[anoAtual] > 1 ? 's' : ''}
                                    </Typography>
                                );
                            }
                            return null;
                        })()}
                    </Stack>
                </Box>
            </Grid>
        </Stack>
    );
};
