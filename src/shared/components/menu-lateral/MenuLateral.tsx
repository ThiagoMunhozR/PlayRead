import { Box, Drawer, Divider, List, useTheme, useMediaQuery, Typography, Avatar, ListItemButton, ListItemIcon, Icon, ListItemText } from '@mui/material';
import { useAppThemeContext, useAuthContext, useDrawerContext } from '../../contexts';
import { SubMenu } from './SubMenu';

interface IMenuLateralProps {
  children: React.ReactNode;
}

export const MenuLateral: React.FC<IMenuLateralProps> = ({ children }) => {
  const theme = useTheme();
  const mdDown = useMediaQuery(theme.breakpoints.down('md'));
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
                  {user.Gamertag}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" align="center" color="text.secondary">
                  {user.Nome}
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
              <ListItemButton onClick={toggleTheme}>
                <ListItemIcon>
                  <Icon>dark_mode</Icon>
                </ListItemIcon>
                <ListItemText primary="Alternar tema" />
              </ListItemButton>
              <ListItemButton onClick={logout}>
                <ListItemIcon>
                  <Icon>logout</Icon>
                </ListItemIcon>
                <ListItemText primary="Sair" />
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
