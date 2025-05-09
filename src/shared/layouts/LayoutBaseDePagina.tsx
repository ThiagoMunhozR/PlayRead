import {
  Icon,
  IconButton,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Box } from '@mui/system';
import { useDrawerContext } from '../contexts';
import { ReactNode, useImperativeHandle, useRef, forwardRef } from 'react';

interface ILayoutBaseDePaginaProps {
  titulo: string;
  children?: ReactNode;
  barraDeFerramentas?: ReactNode;
}

export interface ILayoutBaseDePaginaHandle {
  scrollToTop: () => void;
}

export const LayoutBaseDePagina = forwardRef<ILayoutBaseDePaginaHandle, ILayoutBaseDePaginaProps>(
  ({ children, titulo, barraDeFerramentas }, ref) => {
    const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
    const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
    const theme = useTheme();
    const { toggleDrawerOpen } = useDrawerContext();

    const scrollRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      scrollToTop: () => {
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      },
    }));

    return (
      <Box height="100%" display="flex" flexDirection="column" gap={1}>
        <Box
          padding={1}
          display="flex"
          alignItems="center"
          gap={1}
          height={theme.spacing(smDown ? 6 : mdDown ? 8 : 12)}
        >
          {mdDown && (
            <IconButton onClick={toggleDrawerOpen}>
              <Icon>menu</Icon>
            </IconButton>
          )}

          <Typography
            overflow="hidden"
            textOverflow="ellipses"
            variant={smDown ? 'h5' : mdDown ? 'h4' : 'h3'}
          >
            {titulo}
          </Typography>
        </Box>

        {barraDeFerramentas && <Box>{barraDeFerramentas}</Box>}

        <Box ref={scrollRef} flex={1} overflow="auto">
          {children}
        </Box>
      </Box>
    );
  }
);
