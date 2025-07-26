import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { ArrowDownward, ArrowUpward, Sort } from '@mui/icons-material';
import React, { useState } from 'react';

export type OrdemType = 'data' | 'alfabetica' | 'avaliacao';
export type DirecaoType = 'asc' | 'desc';

interface OrdenacaoProps {
  ordem: OrdemType;
  direcao: DirecaoType;
  onChange: (ordem: OrdemType, direcao: DirecaoType) => void;
}

const labels: Record<OrdemType, string> = {
  data: 'Data',
  alfabetica: 'Alfabética',
  avaliacao: 'Avaliação',
};

export const OrdenacaoMenu: React.FC<OrdenacaoProps> = ({ ordem, direcao, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (tipo: OrdemType) => {
    let novaDirecao: DirecaoType;
    if (tipo === ordem) {
      novaDirecao = direcao === 'asc' ? 'desc' : 'asc';
    } else {
      novaDirecao = (tipo === 'data' || tipo === 'avaliacao') ? 'desc' : 'asc';
    }
    onChange(tipo, novaDirecao);
    handleClose();
  };

  return (
    <>
      <IconButton onClick={handleOpen} size="small">
        <Sort />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {(['alfabetica', 'data', 'avaliacao'] as OrdemType[]).map((tipo) => {
          let icon = null;
          if (ordem === tipo) {
            icon = direcao === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />;
          }
          return (
            <MenuItem key={tipo} onClick={() => handleSelect(tipo)} selected={ordem === tipo}>
              <ListItemIcon>
                {icon}
              </ListItemIcon>
              <ListItemText primary={labels[tipo]} />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
