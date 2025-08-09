import { Box, Stack, Typography, Grid, IconButton, Accordion, AccordionSummary, AccordionDetails, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import { useMemo, useState } from 'react';
import { JogosZeradosMes } from './JogosZeradosMês';
import { JogosZeradosAno } from './JogosZeradosAno';

interface JogosEstatisticasProps {
    games: Array<{ data?: string; dataCompleto?: string }>;
    totalCount: number;
}

export const JogosEstatisticas: React.FC<JogosEstatisticasProps> = ({ games, totalCount }) => {
    const [anoSelecionado, setAnoSelecionado] = useState<string | null>(null);
    const [graficosAbertos, setGraficosAbertos] = useState(false);

    // Top 3 anos com mais jogos zerados
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
    const top3Anos = useMemo(() => {
        return Object.entries(contagemPorAno)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
    }, [contagemPorAno]);

    return (
        <Accordion sx={{ width: '100%', marginTop: 2, bgcolor: 'transparent', boxShadow: 'none', border: 'none', borderRadius: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ margin: '0 0 0 8px' }}>Estatísticas</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack mt={2} spacing={2} alignItems="center">
                    <Grid container spacing={2} justifyContent="center" alignItems="flex-start">
                        <Grid item xs={12} md={6}>
                            <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
                                <Typography variant="h6" align="center" gutterBottom>
                                    Total de jogos zerados: {totalCount}
                                </Typography>
                                <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontSize: '1rem', fontWeight: 400, mt: -1 }}>
                                    Jogos completados: {games.filter(j => !!j.dataCompleto).length}
                                </Typography>
                                <Box display="flex" justifyContent="center" mb={2}>
                                    <Button
                                        variant="text"
                                        color="primary"
                                        endIcon={graficosAbertos ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        onClick={() => setGraficosAbertos(v => !v)}
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {graficosAbertos ? 'Recolher gráficos' : 'Ver gráficos'}
                                    </Button>
                                </Box>
                                {graficosAbertos && (
                                    <JogosZeradosAno
                                        games={games}
                                        onAnoClick={setAnoSelecionado}
                                    />
                                )}
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {graficosAbertos && anoSelecionado && (
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
            </AccordionDetails>
        </Accordion>
    );
};
