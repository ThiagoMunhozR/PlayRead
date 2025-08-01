import React, { useState, useEffect } from 'react';
import { Card, CardContent, Box, Typography, Rating } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { ActionMenu } from '../ActionMenu/ActionMenu';
import { useMessageContext } from '../../contexts';
import { useNavigate } from 'react-router-dom';
import { JogosService } from '../../services/api/jogos/JogosService';

interface CustomCardProps {
  isMobile: boolean;
  imageSrc: string;
  title: string;
  subtitle?: string;
  rating?: number;
  showTrophy?: boolean;
  cardHeight?: number;
  imageHeight?: number;
  idEditing?: number;
  onDeleted?: () => void;
}

// Função para estilos dinâmicos dos cards
const getCardStyles = (isMobile: boolean, cardHeight?: number) => ({
  height: cardHeight ?? (isMobile ? 340 : 475), // Altura menor para celulares
  width: isMobile ? '90%' : '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  flexGrow: 1, // Permite que o card cresça e ocupe o espaço disponível
});

// Função para estilos dinâmicos das imagens
const getImageStyles = (isMobile: boolean, imageHeight?: number) => ({
  width: '100%',
  height: imageHeight ?? (isMobile ? 240 : 355), // Mais vertical para capa de jogo
  objectFit: 'cover',
  borderRadius: '4px 4px 0 0',
  boxSizing: 'border-box',
  display: 'block',
});

// Função para estilos dinâmicos do texto
const getTextStyles = (isMobile: boolean) => ({
  title: {
    fontSize: isMobile ? '0.92rem' : '1.25rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%',
    display: 'block',
    minHeight: isMobile ? '1.2em' : '1.5em',
    maxWidth: '100%',
  },
  subtitle: {
    fontSize: isMobile ? '0.75rem' : '1rem',
    marginTop: isMobile ? 0.5 : 1,
  },
});


export const CustomCard: React.FC<CustomCardProps> = ({
  isMobile,
  imageSrc,
  title,
  subtitle,
  rating,
  showTrophy,
  cardHeight,
  imageHeight,
  idEditing,
  onDeleted,
}) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isMobile && active) {
      timer = setTimeout(() => setActive(false), 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isMobile, active]);

  const { showAlert, showConfirmation } = useMessageContext();
  const navigate = useNavigate();

  const handleDelete = (id: number) => {
    showConfirmation(
      `Realmente deseja apagar ${title}?`,
      () => {
        JogosService.deleteById(id).then((result) => {
          if (result instanceof Error) {
            showAlert(result.message, 'error');
          } else {
            showAlert('Registro apagado com sucesso!', 'success');
            if (typeof onDeleted === 'function') onDeleted();
          }
        });
      },
      () => { }
    );
  };

  // Animação de destaque
  const highlightStyles = active
    ? {
      boxShadow: '0 0 24px 0 rgba(255, 215, 0, 0.35)',
      border: showTrophy ? '3px solid #FFD700' : '2px solid #1976d2',
      transition: 'box-shadow 0.3s, border 0.3s',
    }
    : {};

  // Tooltip aparece quando ativo
  return (
    <Tooltip title={title} open={active} placement="top" arrow>
      <Card
        sx={{
          ...getCardStyles(isMobile, cardHeight),
          ...(showTrophy
            ? {
              border: '2px solid #FFD700',
              boxShadow: '0 0 12px 0 rgba(255, 215, 0, 0.18)',
              transition: 'border 0.2s, box-shadow 0.2s',
            }
            : {}),
          ...highlightStyles,
          cursor: 'pointer',
        }}
        onClick={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: isMobile ? 300 : 420,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px 4px 0 0',
            boxSizing: 'border-box',
            overflow: 'hidden',
            padding: 0,
          }}
        >
          <Box
            component="img"
            src={imageSrc}
            alt=""
            sx={getImageStyles(isMobile, imageHeight)}
          />
          {idEditing && (
            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
              <ActionMenu
                isMobile={true}
                IsContrast={true}
                onEdit={() => navigate(`/jogos/detalhe/${idEditing}`, { state: { from: 'biblioteca' } })}
                onDelete={() => handleDelete(idEditing)}
              />
            </Box>
          )}
        </Box>
        <CardContent
          sx={{
            padding: isMobile ? '4px' : '12px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            height: isMobile ? '80px' : '105px',
            minHeight: isMobile ? '80px' : '105px',
          }}
        >
          <Typography
            variant="h6"
            sx={getTextStyles(isMobile).title}
            title={title}
            marginTop={1}
          >
            {title} {showTrophy && '🏆'}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={getTextStyles(isMobile).subtitle}
            >
              {subtitle}
            </Typography>
          )}
          {typeof rating === 'number' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 0.5 }}>
              <Rating
                value={rating}
                precision={0.25}
                readOnly
                size={isMobile ? 'small' : 'medium'}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Tooltip>
  );
}
