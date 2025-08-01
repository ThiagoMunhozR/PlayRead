import { Box, Drawer, Divider, List, useTheme, useMediaQuery, Typography, Avatar, ListItemButton, ListItemIcon, Icon } from '@mui/material';
import { useAppThemeContext, useAuthContext, useDrawerContext } from '../../contexts';
import { SubMenu } from './SubMenu';
import { useNavigate } from 'react-router-dom';

interface IMenuLateralProps {
  children: React.ReactNode;
}

export const MenuLateral: React.FC<IMenuLateralProps> = ({ children }) => {
  const theme = useTheme();
  const mdDown = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { isDrawerOpen, toggleDrawerOpen, drawerOptions } = useDrawerContext();
  const { toggleTheme } = useAppThemeContext();
  const { logout, user } = useAuthContext();

  return (
    <>
      <Drawer
        open={isDrawerOpen}
        variant={mdDown ? 'temporary' : 'permanent'}
        onClose={toggleDrawerOpen}
      >
        <Box width={theme.spacing(28)} height="100%" display="flex" flexDirection="column">
        {user && (
            <Box
              width="100%"
              height={theme.spacing(24)}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Avatar
                sx={{ height: theme.spacing(12), width: theme.spacing(12) }}
                src={user.FotoURL}
              />
              <Box mt={1}>
                <Typography variant="h6" align="center">
                  {user.Gamertag ? user.Gamertag : user.Nome}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" align="center" color="text.secondary">
                  {user.Gamertag ? user.Nome : ''}
                </Typography>
              </Box>
            </Box>
          )}
          <Divider />
          <Box flex={1}>
            <List component="nav">
              {drawerOptions.map(option => (
                <SubMenu
                  key={option.label}
                  title={option.label}
                  icon={option.icon}
                  subOptions={option.subOptions || []}
                />
              ))}
            </List>
          </Box>
          <Box>
            <List component="nav">
              <List component="nav" sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, p: 1 }}>
                <ListItemButton onClick={toggleTheme} sx={{ minWidth: 0, width: 48, justifyContent: 'center' }}>
                  <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                    <Icon>dark_mode</Icon>
                  </ListItemIcon>
                </ListItemButton>
              <ListItemButton
                onClick={() => {
                  navigate('/configuracoes');
                  if (mdDown) toggleDrawerOpen();
                }}
                sx={{ minWidth: 0, width: 48, justifyContent: 'center' }}
              >
                <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                  <Icon>settings</Icon>
                </ListItemIcon>
              </ListItemButton>
              </List>           
              <ListItemButton onClick={logout} sx={{ justifyContent: 'center' }}>
                <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center" width="100%">
                  <Icon sx={{ mr: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>logout</Icon>
                  <Typography sx={{ textAlign: 'center', m: 0, p: 0 }}>
                    Sair
                  </Typography>
                </Box>
              </ListItemButton>
            </List>
          </Box>
        </Box>
      </Drawer>
      <Box height="100vh" marginLeft={mdDown ? 0 : theme.spacing(28)}>
        {children}
      </Box>
    </>
  );
};
