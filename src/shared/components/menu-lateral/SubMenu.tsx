import { useEffect, useState } from 'react';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Icon,
  Collapse,
  List,
} from '@mui/material';
import { useLocation } from 'react-router-dom';

import { ListItemLink } from '../menu-lateral/ListItemLink';

interface ISubMenuProps {
  title: string;
  icon: string;
  subOptions: { icon: string; path: string; label: string }[];
}

export const SubMenu: React.FC<ISubMenuProps> = ({ title, icon, subOptions }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isCurrentPathInSubOptions = subOptions.some(
      (subOption) => subOption.path === location.pathname
    );
    setIsOpen(isCurrentPathInSubOptions);
  }, [location.pathname, subOptions]);

  const toggleOpen = () => {
    setIsOpen(prevState => !prevState);
  };

  return (
    <>
      <ListItemButton onClick={toggleOpen}>
        <ListItemIcon>
          <Icon>{icon}</Icon>
        </ListItemIcon>
        <ListItemText primary={title} />
        <Icon>{isOpen ? 'expand_less' : 'expand_more'}</Icon>
      </ListItemButton>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {subOptions.map(subOption => (
            <ListItemLink
              key={subOption.path}
              to={subOption.path}
              icon={subOption.icon}
              label={subOption.label}             
              style={{
                paddingLeft: '32px', // Identação para subitem
                fontSize: '0.875rem', // Menor tamanho de fonte            
              }}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
};
