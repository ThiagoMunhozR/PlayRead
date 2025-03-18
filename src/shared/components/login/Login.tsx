import { useState } from 'react';
import { Box, Button, Card, CardActions, CardContent, CircularProgress, TextField, Typography, Modal } from '@mui/material';
import * as yup from 'yup';
import { useAuthContext, useMessageContext } from '../../contexts'; // Importando o contexto de autenticação
import { createClient } from '@supabase/supabase-js';
import { Environment } from '../../environment';

const supabase = createClient(Environment.SUPABASE_URL, Environment.SUPABASE_KEY);

const loginSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required().min(5),
});

const registerSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required().min(5),
  confirmPassword: yup.string().required().min(5).oneOf([yup.ref('password')], 'As senhas devem coincidir'),
  name: yup.string().required('Nome é obrigatório'),
  gamertag: yup.string().required('Gamertag é obrigatória'),
});

interface ILoginProps {
  children: React.ReactNode;
}

export const Login: React.FC<ILoginProps> = ({ children }) => {
  const { isAuthenticated, login } = useAuthContext();
  const { showAlert } = useMessageContext();
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

  const handleLoginSubmit = () => {
    setIsLoading(true);
    loginSchema
      .validate({ email, password }, { abortEarly: false })
      .then(dadosValidados => {
        login(dadosValidados.email, dadosValidados.password)
          .then(() => setIsLoading(false))
          .catch((error) => {
            setIsLoading(false);
            setEmailError('Erro de autenticação: ' + error.message);
          });
      })
      .catch((errors: yup.ValidationError) => {
        setIsLoading(false);
        errors.inner.forEach(error => {
          if (error.path === 'email') {
            setEmailError(error.message);
          } else if (error.path === 'password') {
            setPasswordError(error.message);
          }
        });
      });
  };

  const handleRegisterSubmit = async () => {
    setIsLoading(true);

    try {
      // Validar os dados de registro
      await registerSchema.validate(registerData, { abortEarly: false });

      // Criar usuário no Supabase Authentication
      const { error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
      });

      if (error) {
        throw error;
      }

      // Inserir dados na tabela de usuários
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert([{ Email: registerData.email, Nome: registerData.name, Gamertag: registerData.gamertag, }])
        .single();

      if (insertError) {
        throw insertError;
      }

      setIsLoading(false);
      setOpenModal(false); // Fechar o modal após sucesso
      showAlert('Cadastro realizado com sucesso!', 'success');
    } catch (error) {
      setIsLoading(false);
      showAlert('Erro: ' + error , 'error');
    }
  };

  const handleModalClose = () => setOpenModal(false);

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
              helperText={emailError}
              onKeyDown={() => setEmailError('')}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={password}
              disabled={isLoading}
              error={!!passwordError}
              helperText={passwordError}
              onKeyDown={() => setPasswordError('')}
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
            onClick={() => setOpenModal(true)} // Abrir o modal para criar conta
          >
            Criar Conta
          </Button>
        </CardActions>
      </Card>

      {/* Modal de Registro */}
      <Modal open={openModal} onClose={handleModalClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            padding: 4,
            borderRadius: 2,
            width: 400,
          }}
        >
          <Typography variant="h6" align="center">Criar Conta</Typography>
          <TextField
            fullWidth
            label="Email"
            value={registerData.email}
            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Senha"
            type="password"
            value={registerData.password}
            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Confirmar Senha"
            type="password"
            value={registerData.confirmPassword}
            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Nome"
            value={registerData.name}
            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Gamertag"
            value={registerData.gamertag}
            onChange={(e) => setRegisterData({ ...registerData, gamertag: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleRegisterSubmit}
            disabled={isLoading}
            endIcon={isLoading ? <CircularProgress color="inherit" size={20} /> : undefined}
          >
            Criar Conta
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};