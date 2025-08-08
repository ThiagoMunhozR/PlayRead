import { Box, useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { useMemo } from 'react';

interface JogosZeradosMesProps {
    games: Array<{ data?: string }>;
    ano?: string | number;
}

export const JogosZeradosMes: React.FC<JogosZeradosMesProps> = ({ games, ano }) => {
    const anoAtual = new Date().getFullYear();
    const theme = useTheme();

    // Filtra jogos zerados do ano informado (ou ano atual se não informado)
    const jogosDoAno = useMemo(() => games.filter(jogo => {
        if (!jogo.data) return false;
        const partes = jogo.data.split('/');
        if (partes.length !== 3) return false;
        const anoJogo = Number(partes[2]);
        const anoFiltro = typeof ano === 'undefined' ? anoAtual : Number(ano);
        return anoJogo === anoFiltro;
    }), [games, anoAtual, ano]);

    // Conta por mês
    const jogosPorMes = useMemo(() => {
        const meses = Array(12).fill(0);
        jogosDoAno.forEach(jogo => {
            if (!jogo.data) return;
            const partes = jogo.data.split('/');
            if (partes.length !== 3) return;
            const mes = Number(partes[1]);
            if (mes >= 1 && mes <= 12) {
                meses[mes - 1]++;
            }
        });
        return meses;
    }, [jogosDoAno]);

    const mesesLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    return (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
            <BarChart
                xAxis={[{ data: mesesLabels, label: 'Mês' }]}
                series={[{ data: jogosPorMes, label: 'Jogos zerados', color: theme.palette.primary.main }]}
                height={300}
                margin={{ top: 16, right: 16, left: 16, bottom: 32 }}
            />
        </Box>
    );
};
