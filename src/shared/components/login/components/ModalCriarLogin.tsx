import React, { useState } from 'react';
import { Box, Button, CircularProgress, Modal, Paper, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { FormUser, FormUserData } from '../../FormUser/FormUser';
import { createClient } from '@supabase/supabase-js';
import { Environment } from '../../../environment';
import { useAppThemeContext, useMessageContext } from '../../../contexts';

interface ModalCriarLoginProps {
    open: boolean;
    onClose: () => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}


export const ModalCriarLogin: React.FC<ModalCriarLoginProps> = ({ open, onClose, isLoading, setIsLoading }) => {
    const supabase = createClient(Environment.SUPABASE_URL, Environment.SUPABASE_KEY);
    const { showAlert, showConfirmation } = useMessageContext();
    const [trocaSenha, setTrocaSenha] = useState(true);
    const { isMobile } = useAppThemeContext();

    const { control, handleSubmit, formState: { errors } } = useForm<FormUserData>({
        defaultValues: {
            nome: '',
            gamertag: '',
            email: '',
            senha: '',
            confirmarSenha: '',
        },
    });

    const handleRegisterSubmit = handleSubmit(async (data) => {
        setIsLoading(true);
        if (data.senha !== data.confirmarSenha) {
            showAlert('As senhas devem coincidir', 'error');
            setIsLoading(false);
            return;
        }
        if (data.email.length === 0) {
            showAlert('O e-mail é obrigatório', 'error');
            setIsLoading(false);
            return;
        }
        if (data.senha.length < 6) {
            showAlert('A senha deve ter pelo menos 6 caracteres', 'error');
            setIsLoading(false);
            return;
        }
        try {
            const { error } = await supabase.auth.signUp({
                email: data.email,
                password: data.senha,
            });
            if (error) throw error;
            const { error: insertError } = await supabase
                .from('usuarios')
                .insert([{ Email: data.email, Nome: data.nome, Gamertag: data.gamertag }])
                .single();
            if (insertError) throw insertError;
            setIsLoading(false);
            onClose();
            showConfirmation(
                'Cadastro realizado com sucesso, verifique seu e-mail para confirmá-lo e fazer login.',
                () => { },
                () => { },
                'OK',
                false
            );
        } catch (error: any) {
            setIsLoading(false);
            let errorMsg = 'Erro desconhecido.';
            if (error?.code === '23505' || error?.message?.includes('duplicate key')) {
                errorMsg = 'Este e-mail já está cadastrado.';
            } else if (typeof error?.message === 'string') {
                errorMsg = error.message;
            } else if (typeof error === 'string') {
                errorMsg = error;
            }
            showAlert(errorMsg, 'error');
        }
    });

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
                    width: '100vw',
                    maxWidth: '100vw',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#121212',
                    p: 0
                }}>
                <Paper
                    sx={{
                        width: { xs: '95vw', sm: '90vw', md: '70vw', lg: '60vw', xl: '50vw' },
                        maxWidth: 1000,
                        minWidth: { xs: '95vw', sm: 400 },
                        p: { xs: 2, sm: 4 },
                        borderRadius: 2,
                        m: { xs: 0, sm: 2 }
                    }}>
                    <Typography variant="h5" align="center" marginBottom={3}>
                        Criar Conta
                    </Typography>
                    <FormUser
                        editUser={false}
                        onChangeSenha={setTrocaSenha}
                        trocaSenha={trocaSenha}
                        control={control}
                        errors={errors}
                        isLoading={isLoading}
                        isMobile={isMobile}
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