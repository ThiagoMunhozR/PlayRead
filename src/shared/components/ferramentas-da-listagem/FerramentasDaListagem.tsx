import { Box, Button, Icon, Paper, TextField, useTheme } from '@mui/material';
import { OrdenacaoMenu, OrdemType, DirecaoType } from './components/OrdenacaoMenu';
import { Environment } from '../../environment';

interface IBarraDeFerramentasProps {
    textoDaBusca?: string;
    mostrarInputBusca?: boolean;
    aoMudarTextoDeBusca?: (novoTexto: string) => void;
    textoBotaoNovo?: string;
    mostrarBotaoNovo?: boolean;
    aoClicarEmNovo?: () => void;
    ordem?: OrdemType;
    direcao?: DirecaoType;
    aoMudarOrdenacao?: (ordem: OrdemType, direcao: DirecaoType) => void;
}

export const FerramentasDaListagem: React.FC<IBarraDeFerramentasProps> = ({
    textoDaBusca = '',
    aoMudarTextoDeBusca,
    mostrarInputBusca = false,
    aoClicarEmNovo,
    textoBotaoNovo = 'Novo',
    mostrarBotaoNovo = true,
    ordem,
    direcao = 'desc',
    aoMudarOrdenacao,
}) => {
    const theme = useTheme();

  return (
    <Box
      gap={1}
      marginX={1}
      padding={1}
      paddingX={2}
      display="flex"
      alignItems="center"
      height={theme.spacing(5)}
      component={Paper}
    >
      {mostrarInputBusca && (
        <TextField
          size="small"
          value={textoDaBusca}
          placeholder={Environment.INPUT_DE_BUSCA}
          onChange={(e) => aoMudarTextoDeBusca?.(e.target.value)}
        />
      )}
      {ordem && (
        <OrdenacaoMenu ordem={ordem} direcao={direcao} onChange={aoMudarOrdenacao ?? (() => {})} />
      )}
      <Box flex={1} display="flex" justifyContent="end">
        {mostrarBotaoNovo && (
          <Button
            color='primary'
            disableElevation
            variant='contained'
            onClick={aoClicarEmNovo}
            endIcon={<Icon>add</Icon>}
          >{textoBotaoNovo}</Button>
        )}
      </Box>
    </Box>
  );
};