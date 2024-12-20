import { useNavigate, useMatch, useResolvedPath } from 'react-router-dom';
import { ListItemButton, ListItemIcon, ListItemText, Icon } from '@mui/material';

interface IListItemLinkProps {
  to: string;
  icon: string;
  label: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const ListItemLink: React.FC<IListItemLinkProps> = ({ to, icon, label, style, onClick }) => {
  const navigate = useNavigate();
  const resolvedPath = useResolvedPath(to);
  const match = useMatch({ path: resolvedPath.pathname, end: false });

  const handleClick = () => {
    navigate(to);
    onClick?.();
  };

  return (
    <ListItemButton selected={!!match} style={style} onClick={handleClick}>
      <ListItemIcon>
        <Icon>{icon}</Icon>
      </ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  );
};
