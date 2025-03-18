import React, { } from 'react';
import { Box, Button, CircularProgress, Modal, Paper, TextField, Typography } from '@mui/material';
import { createClient } from '@supabase/supabase-js';
import { Environment } from '../../../environment';


const supabase = createClient(Environment.SUPABASE_URL, Environment.SUPABASE_KEY);

interface IRegisterData {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    gamertag: string;
}

interface IRegisterErrors {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    gamertag: string;
}

interface ModalCriarLoginProps {
    open: boolean;
    onClose: () => void;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    registerData: IRegisterData;
    setRegisterData: React.Dispatch<React.SetStateAction<IRegisterData>>;
    registerErrors: IRegisterErrors;
    setRegisterErrors: React.Dispatch<React.SetStateAction<IRegisterErrors>>;
}

export const ModalCriarLogin: React.FC<ModalCriarLoginProps> = ({ open, onClose, isLoading, setIsLoading, registerData, setRegisterData, registerErrors, setRegisterErrors }) => {

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
        } else if (registerData.password.length < 6) {
            errors.password = 'A senha deve ter pelo menos 6 caracteres';
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
                onClose();
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

    const handleFieldChange = (field: string, value: string) => {
        setRegisterData((prevState: IRegisterData) => ({
            ...prevState,
            [field]: value,
        }));

        if (field === 'email' && /\S+@\S+\.\S+/.test(value)) {
            setRegisterErrors((prevState: IRegisterErrors) => ({
                ...prevState,
                email: '',
            }));
        } else if (field === 'password' && value.length >= 5) {
            setRegisterErrors((prevState: IRegisterErrors) => ({
                ...prevState,
                password: '',
            }));
        } else if (field === 'confirmPassword' && value === registerData.password) {
            setRegisterErrors((prevState: IRegisterErrors) => ({
                ...prevState,
                confirmPassword: '',
            }));
        } else if (field === 'name' && value.length > 0) {
            setRegisterErrors((prevState: IRegisterErrors) => ({
                ...prevState,
                name: '',
            }));
        } else if (field === 'gamertag' && value.length > 0) {
            setRegisterErrors((prevState: IRegisterErrors) => ({
                ...prevState,
                gamertag: '',
            }));
        }
    };

    return (
        <Modal
            open={open}
            onClose={() => { }}
            disableEscapeKeyDown>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    maxWidth: 600,
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#121212"
                }}>
                <Paper sx={{ padding: 4, borderRadius: 2, margin: 2 }}>
                    <Typography variant="h5" align="center" marginBottom={3}>
                        Criar Conta
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Informações de login
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        label="Email"
                        value={registerData.email}
                        error={!!registerErrors.email}
                        helperText={registerErrors.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        size="small"
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
                        size="small" label="Confirmar Senha"
                        type="password"
                        value={registerData.confirmPassword}
                        error={!!registerErrors.confirmPassword}
                        helperText={registerErrors.confirmPassword}
                        onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                        margin="normal"
                    />
                    <Typography variant="subtitle1" fontWeight="bold" marginTop={2}>
                        Informações Pessoais
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        label="Nome"
                        value={registerData.name}
                        error={!!registerErrors.name}
                        helperText={registerErrors.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        size="small"
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
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleRegisterSubmit}
                            disabled={isLoading}
                            endIcon={isLoading ?
                                <CircularProgress
                                    color="inherit"
                                    size={20} /> : undefined}>
                            Criar Conta
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Modal>
    );
};