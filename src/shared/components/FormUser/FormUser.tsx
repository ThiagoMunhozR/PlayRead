import { Box, Grid, LinearProgress, Paper, TextField, Avatar, Divider, useTheme, InputAdornment, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import React, { useState, useRef } from 'react';

export type FormUserData = {
  nome: string;
  gamertag: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  fotoURL?: string;
};

interface FormUserProps {
  editUser: boolean;
  trocaSenha: boolean;
  onChangeSenha: (value: boolean) => void;
  control: Control<FormUserData>;
  errors: FieldErrors<FormUserData>;
  isLoading?: boolean;
  isMobile?: boolean;
  fotoURL?: string;
}

export const FormUser: React.FC<FormUserProps> = ({ control, errors, isLoading = false, isMobile = false, fotoURL, editUser, trocaSenha, onChangeSenha }) => {
  const theme = useTheme();
  const [showSenha, setShowSenha] = useState(false);
  const senhaInputRef = useRef<HTMLInputElement>(null);

  const avatarBox = (foto?: string) => (
    <Grid item xs={12} sm={4.5} md={4.5} lg={2.5} xl={2.5}>
      <Box
        width="100%"
        height={theme.spacing(20)}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Avatar
          sx={{ height: theme.spacing(16), width: theme.spacing(16) }}
          src={foto}
        />
      </Box>
    </Grid>
  );

  let senhaInputProps: any = undefined;
  if (editUser) {
    senhaInputProps = {
      endAdornment: (
        <InputAdornment position="end">
          {/* Botão de visualizar senha */}
          {trocaSenha && !isLoading && (
            <Tooltip title={showSenha ? 'Ocultar senha' : 'Visualizar senha'}>
              <IconButton
                aria-label={showSenha ? 'Ocultar senha' : 'Visualizar senha'}
                onClick={() => setShowSenha((v) => !v)}
                edge="end"
                size="small"
              >
                {showSenha ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
          {/* Botão de editar/cancelar */}
          {!trocaSenha ? (
            <Tooltip title="Alterar senha">
              <IconButton
                aria-label="Alterar senha"
                onClick={() => {
                  onChangeSenha(true);
                  setTimeout(() => {
                    // Foca no input do campo de senha (TextField de senha)
                    const input = document.querySelector('input[name="senha"]') as HTMLInputElement | null;
                    if (input) {
                      input.focus();
                      input.value = '';
                      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                      nativeInputValueSetter?.call(input, '');
                      input.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }, 100);
                }}
                edge="end"
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Cancelar alteração de senha">
              <IconButton
                sx={{ marginLeft: 1 }}
                aria-label="Cancelar alteração de senha"
                onClick={() => {
                  onChangeSenha(false);
                  setShowSenha(false);
                }}
                edge="end"
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </InputAdornment>
      ),
      inputRef: !trocaSenha ? undefined : senhaInputRef,
      placeholder: !trocaSenha ? '******' : undefined,
      value: !trocaSenha ? '******' : undefined,
      //readOnly: !trocaSenha,
    };
  } else if (!isLoading) {
    senhaInputProps = {
      endAdornment: (
        <InputAdornment position="end">
          <Tooltip title={showSenha ? 'Ocultar senha' : 'Visualizar senha'}>
            <IconButton
              aria-label={showSenha ? 'Ocultar senha' : 'Visualizar senha'}
              onClick={() => setShowSenha((v) => !v)}
              edge="end"
              size="small"
            >
              {showSenha ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </Tooltip>
        </InputAdornment>
      ),
      placeholder: '******',
      value: '******',
      readOnly: true,
    };
  }

  return (
    <Box margin={1} display="flex" flexDirection="column" component={Paper} variant="outlined">
      <Grid container spacing={0.1} alignItems="flex-start" padding={2}>
        {isMobile && avatarBox(fotoURL)}
        <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
          <Grid container direction="column" padding={2} spacing={2}>
            {isLoading && (
              <Grid item>
                <LinearProgress variant='indeterminate' />
              </Grid>
            )}
            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Controller
                  name="nome"
                  control={control}
                  rules={{ required: 'O nome é obrigatório' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome"
                      disabled={isLoading}
                      error={!!errors.nome}
                      helperText={errors.nome?.message}
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} marginBottom={2}>
                <Controller
                  name="gamertag"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Gamertag"
                      disabled={isLoading}
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Divider />
            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="E-mail"
                      disabled={true}
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Controller
                  name="senha"
                  control={control}
                  rules={(!editUser || trocaSenha) ? { required: 'A senha é obrigatória' } : {}}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Senha"
                      type={showSenha ? 'text' : 'password'}
                      error={!!errors.senha && (!editUser || trocaSenha)}
                      helperText={(!editUser || trocaSenha) ? errors.senha?.message : ''}
                      disabled={!trocaSenha || isLoading}
                      fullWidth
                      InputProps={{ ...senhaInputProps, disableUnderline: false }}
                      InputLabelProps={{ shrink: true }}
                      autoComplete="new-password"
                    />
                  )}
                />
            </Grid>

            {(!editUser || trocaSenha)  && (
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Controller
                  name="confirmarSenha"
                  control={control}
                  rules={(!editUser || trocaSenha) ? { required: 'A confirmação da senha é obrigatória' } : {}}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Confirmar senha"
                      type={showSenha ? 'text' : 'password'}
                      error={!!errors.confirmarSenha && (!editUser || trocaSenha)}
                      helperText={(!editUser || trocaSenha) ? errors.confirmarSenha?.message : ''}
                      fullWidth
                      InputProps={{ ...senhaInputProps, disableUnderline: false }}
                      InputLabelProps={{ shrink: true }}
                      autoComplete="new-password"
                    />
                  )}
                />
            </Grid>
            )}
          </Grid>
        </Grid>
        {!isMobile && avatarBox(fotoURL)}
      </Grid>
    </Box>
  );
};
