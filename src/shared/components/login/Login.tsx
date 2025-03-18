import { useState } from 'react';
import { Box, Button, Card, CardActions, CardContent, CircularProgress, TextField, Typography } from '@mui/material';
import { useAuthContext } from '../../contexts';
import { ModalCriarLogin } from './components/ModalCriarLogin';

interface ILoginProps {
  children: React.ReactNode;
}

export const Login: React.FC<ILoginProps> = ({ children }) => {
  const { isAuthenticated, login } = useAuthContext();

  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    gamertag: '',
  });
  const [registerErrors, setRegisterErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    gamertag: '',
  });

  const handleLoginSubmit = () => {
    setIsLoading(true);
    let valid = true;

    // Reset errors
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('O e-mail é obrigatório');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Por favor, insira um e-mail válido');
      valid = false;
    }

    if (!password) {
      setPasswordError('A senha é obrigatória');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres');
      valid = false;
    }

    if (valid) {
      login(email, password)
        .then(() => setIsLoading(false))
        .catch(() => {
          setIsLoading(false);
          setEmailError('Não foi possível fazer login, revise o email');
          setPasswordError('Não foi possível fazer login, revise a senha');
        });
    } else {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setRegisterErrors({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      gamertag: '',
    });
    setRegisterData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      gamertag: '',
    });
    setOpenModal(false);
  }

  const clearEmailError = () => {
    if (emailError) {
        if (emailError == 'Não foi possível fazer login, revise o email') {
            setEmailError('');
            setPasswordError('');
        }
        setEmailError(''); 
    }
}

const clearPasswordError = () => {
    if (passwordError) {
        if (passwordError == 'Não foi possível fazer login, revise a senha') {
            setPasswordError('');
            setEmailError('');
        }
        setPasswordError('');
    }
}

  if (isAuthenticated) return <>{children}</>;

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="#121212"
    >
      <Card sx={{ padding: 3, width: 420, boxShadow: 4, borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography marginBottom={2} variant="h5" align="center" fontWeight="bold" color="primary">
              Bem-vindo ao PlayRead!
            </Typography>

            <TextField
              fullWidth
              type="email"
              label="Email"
              value={email}
              disabled={isLoading}
              error={!!emailError}
              helperText={emailError || ''}
              onChange={(e) => {setEmail(e.target.value); clearEmailError();}}
            />

            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={password}
              disabled={isLoading}
              error={!!passwordError}
              helperText={passwordError || ''}
              onChange={(e) => {setPassword(e.target.value); clearPasswordError();}}
            />
          </Box>
        </CardContent>

        <CardActions sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            disabled={isLoading}
            onClick={handleLoginSubmit}
            endIcon={isLoading ? <CircularProgress color="inherit" size={20} /> : undefined}
          >
            Entrar
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="primary"
            onClick={() => setOpenModal(true)}
          >
            Criar Conta
          </Button>
        </CardActions>
      </Card>

      <ModalCriarLogin
        open={openModal}
        onClose={handleModalClose}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        registerData={registerData}
        setRegisterData={setRegisterData}
        registerErrors={registerErrors}
        setRegisterErrors={setRegisterErrors}
      />
    </Box>
  );
};