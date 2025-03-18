import { useState } from 'react';
import { Box, Button, Card, CardActions, CardContent, CircularProgress, TextField, Typography, Modal, Paper } from '@mui/material';
import { useAuthContext } from '../../contexts';
import { createClient } from '@supabase/supabase-js';
import { Environment } from '../../environment';

const supabase = createClient(Environment.SUPABASE_URL, Environment.SUPABASE_KEY);

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
    } else if (password.length < 5) {
      setPasswordError('A senha deve ter pelo menos 5 caracteres');
      valid = false;
    }

    if (valid) {
      login(email, password)
        .then(() => setIsLoading(false))
        .catch((error) => {
          setIsLoading(false);
          setEmailError('Erro de autenticação: ' + error.message);
        });
    } else {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async () => {
    setIsLoading(true);

    // Reset register errors
    setRegisterErrors({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      gamertag: '',
    });

    let valid = true;
    const errors = { ...registerErrors };

    // Validate email
    if (!registerData.email) {
      errors.email = 'O e-mail é obrigatório';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      errors.email = 'Por favor, insira um e-mail válido';
      valid = false;
    }

    // Validate password
    if (!registerData.password) {
      errors.password = 'A senha é obrigatória';
      valid = false;
    } else if (registerData.password.length < 5) {
      errors.password = 'A senha deve ter pelo menos 5 caracteres';
      valid = false;
    }

    // Validate confirm password
    if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = 'As senhas devem coincidir';
      valid = false;
    }

    // Validate name
    if (!registerData.name) {
      errors.name = 'Nome é obrigatório';
      valid = false;
    }

    // Validate gamertag
    if (!registerData.gamertag) {
      errors.gamertag = 'Gamertag é obrigatória';
      valid = false;
    }

    if (valid) {
      try {
        const { error } = await supabase.auth.signUp({
          email: registerData.email,
          password: registerData.password,
        });

        if (error) {
          throw error;
        }

        const { error: insertError } = await supabase
          .from('usuarios')
          .insert([{ Email: registerData.email, Nome: registerData.name, Gamertag: registerData.gamertag }])
          .single();

        if (insertError) {
          throw insertError;
        }

        setIsLoading(false);
        setOpenModal(false);
        alert('Cadastro realizado com sucesso, verifique seu e-mail para confirmá-lo e fazer login.');
      } catch (error) {
        setIsLoading(false);
        alert('Erro: ' + error);
      }
    } else {
      setRegisterErrors(errors);
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

  const handleFieldChange = (field: string, value: string) => {
    setRegisterData((prevState) => ({
      ...prevState,
      [field]: value,
    }));

    if (field === 'email' && /\S+@\S+\.\S+/.test(value)) {
      setRegisterErrors((prevState) => ({
        ...prevState,
        email: '',
      }));
    } else if (field === 'password' && value.length >= 5) {
      setRegisterErrors((prevState) => ({
        ...prevState,
        password: '',
      }));
    } else if (field === 'confirmPassword' && value === registerData.password) {
      setRegisterErrors((prevState) => ({
        ...prevState,
        confirmPassword: '',
      }));
    } else if (field === 'name' && value.length > 0) {
      setRegisterErrors((prevState) => ({
        ...prevState,
        name: '',
      }));
    } else if (field === 'gamertag' && value.length > 0) {
      setRegisterErrors((prevState) => ({
        ...prevState,
        gamertag: '',
      }));
    }
  };

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

            {(emailError || passwordError) && (
              <Typography color="error" variant="body2" align="center">
                {emailError && <div>{emailError}</div>}
                {passwordError && <div>{passwordError}</div>}
              </Typography>
            )}

            <TextField
              fullWidth
              type="email"
              label="Email"
              value={email}
              disabled={isLoading}
              error={!!emailError}
              helperText={emailError || ''}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={password}
              disabled={isLoading}
              error={!!passwordError}
              helperText={passwordError || ''}
              onChange={(e) => setPassword(e.target.value)}
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

      {/* Modal de Registro */}
      <Modal
        open={openModal}
        onClose={() => { }}
        disableEscapeKeyDown
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
          }}
        >
          <Paper sx={{ padding: 4, borderRadius: 2 }}>
            <Typography variant="h6" align="center" marginBottom={3}>
              Criar Conta
            </Typography>

            <Typography variant="subtitle1" fontWeight="bold">Informações de login</Typography>
            <TextField
              fullWidth
              label="Email"
              value={registerData.email}
              error={!!registerErrors.email}
              helperText={registerErrors.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={registerData.password}
              error={!!registerErrors.password}
              helperText={registerErrors.password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Confirmar Senha"
              type="password"
              value={registerData.confirmPassword}
              error={!!registerErrors.confirmPassword}
              helperText={registerErrors.confirmPassword}
              onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
              margin="normal"
            />
            <Typography variant="subtitle1" fontWeight="bold">Informações Pessoais</Typography>
            <TextField
              fullWidth
              label="Nome"
              value={registerData.name}
              error={!!registerErrors.name}
              helperText={registerErrors.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Gamertag"
              value={registerData.gamertag}
              error={!!registerErrors.gamertag}
              helperText={registerErrors.gamertag}
              onChange={(e) => handleFieldChange('gamertag', e.target.value)}
              margin="normal"
            />

            <Box display="flex" gap={2} marginTop={3}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={handleModalClose}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleRegisterSubmit}
                disabled={isLoading}
                endIcon={isLoading ? <CircularProgress color="inherit" size={20} /> : undefined}
              >
                Criar Conta
              </Button>
            </Box>
          </Paper>
        </Box>
      </Modal>
    </Box>
  );
};