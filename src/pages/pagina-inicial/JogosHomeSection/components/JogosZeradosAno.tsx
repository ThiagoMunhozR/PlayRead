import { useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import React from 'react';

interface JogosZeradosAnoProps {
    games: Array<{ data?: string; dataCompleto?: string }>;
    onAnoClick?: (ano: string) => void;
}

export const JogosZeradosAno: React.FC<JogosZeradosAnoProps> = ({ games, onAnoClick }) => {
    const theme = useTheme();

    // Contagem total por ano
    const contagemPorAno: Record<string, number> = {};
    // Contagem de jogos completados (com dataCompleto) por ano
    const contagemCompletosPorAno: Record<string, number> = {};

    games.forEach(jogo => {
        if (jogo.data) {
            const partes = jogo.data.split('/');
            if (partes.length === 3) {
                const ano = partes[2];
                contagemPorAno[ano] = (contagemPorAno[ano] || 0) + 1;
            }
        }
        if (jogo.dataCompleto) {
            const partes = jogo.dataCompleto.split('/');
            if (partes.length === 3) {
                const ano = partes[2];
                contagemCompletosPorAno[ano] = (contagemCompletosPorAno[ano] || 0) + 1;
            }
        }
    });

    // Garante que todos os anos presentes em qualquer uma das contagens apareçam
    const anosOrdenados = Array.from(new Set([
        ...Object.keys(contagemPorAno),
        ...Object.keys(contagemCompletosPorAno)
    ])).sort();


    const jogosPorAno = anosOrdenados.map(ano => contagemPorAno[ano] || 0);
    const jogosCompletosPorAno = anosOrdenados.map(ano => contagemCompletosPorAno[ano] || 0);

    // Média de jogos zerados por ano
    const mediaZerados = anosOrdenados.length > 0 ?
        jogosPorAno.reduce((acc, val) => acc + val, 0) / anosOrdenados.length : 0;

    return (
        <BarChart
            xAxis={[{ data: anosOrdenados, label: `Média de ${mediaZerados.toFixed(1)} jogos por ano` }]}
            series={[
                {
                    data: jogosCompletosPorAno,
                    label: 'Completados',
                    color: '#FFD700',
                    stack: 'total',
                },
                {
                    data: jogosPorAno,
                    label: 'Jogos zerados',
                    color: theme.palette.primary.main,
                    stack: 'total',
                },
            ]}
            height={300}
            margin={{ top: 16, right: 16, left: 16, bottom: 32 }}
            layout="vertical"
            onItemClick={(_, item) => {
                if (onAnoClick) {
                    const ano = anosOrdenados[item.dataIndex];
                    onAnoClick(ano);
                }
            }}
            sx={{ cursor: onAnoClick ? 'pointer' : 'default' }}
        />
    );
};
