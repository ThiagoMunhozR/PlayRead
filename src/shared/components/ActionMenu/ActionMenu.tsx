import React, { useState } from 'react';
import { IconButton, Icon, Menu, MenuItem } from '@mui/material';

interface IActionMenuProps {
  isMobile: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const ActionMenu: React.FC<IActionMenuProps> = ({ isMobile, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (isMobile) {
    return (
      <>
        <IconButton size="small" onClick={handleMenuOpen}>
          <Icon>more_vert</Icon>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <MenuItem onClick={() => { handleMenuClose(); onEdit(); }}>
            <Icon fontSize="medium" sx={{ mr: 2 }}>edit</Icon> Editar
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); onDelete(); }}>
            <Icon fontSize="medium" sx={{ mr: 2 }}>delete</Icon> Excluir
          </MenuItem>
        </Menu>
      </>
    );
  }
  return (
    <>
      <IconButton size="small" onClick={onDelete}>
        <Icon>delete</Icon>
      </IconButton>
      <IconButton size="small" onClick={onEdit}>
        <Icon>edit</Icon>
      </IconButton>
    </>
  );
};
