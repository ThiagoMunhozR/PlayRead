import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { FormUser } from '../../shared/components/FormUser/FormUser';
import { FerramentasDeDetalhe } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';
import { useAppThemeContext, useAuthContext, useMessageContext } from '../../shared/contexts';
import { AuthService } from '../../shared/services/api/auth/AuthService';
import { Environment } from '../../shared/environment';
import { supabase } from '../../shared/services/api/axios-config';

type FormData = {
  nome: string;
  gamertag: string;
  email: string;
  senha: string;
  confirmarSenha: string;
};

export const Configuracoes: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthContext();
  const { isMobile } = useAppThemeContext();
  const { showAlert } = useMessageContext();
  const [isLoading, setIsLoading] = useState(false);
  const [ClicouEmFechar, setClicouEmFechar] = useState(false);
  const [trocarSenha, setTrocarSenha] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      nome: '',
      gamertag: '',
    },
  });

  useEffect(() => {
    if (user) {
      setValue('nome', user.Nome || '');
      setValue('gamertag', user.Gamertag || '');
      setValue('email', user.Email || '');
      setValue('senha', ''); // Senha não é carregada por segurança
    }
    setIsLoading(false);
  }, [user, setValue]);

  const handleSave = async () => {
    handleSubmit((formData: FormData) => {
      if (user) {
        if (trocarSenha) {
          if (formData.senha !== formData.confirmarSenha) {
            showAlert('As senhas não conferem', 'error');
            return;
          } else {
            supabase.auth.updateUser({
              password: formData.senha,
            });
          }
        }
        const payload = {
          Nome: formData.nome,
          Gamertag: formData.gamertag,
        };

        AuthService.updateById(user.CodigoUsuario, payload).then((result) => {
          if (result instanceof Error) {
            showAlert(result.message, 'error');
          } else {
            const updatedUser = { ...user, ...payload };
            localStorage.setItem(Environment.LOCAL_STORAGE_KEY__USER, JSON.stringify(updatedUser));
            if (setUser) setUser(updatedUser);
            showAlert('Configurações alteradas com sucesso!', 'success');
            if (ClicouEmFechar) {
              navigate('/biblioteca-jogos');
              setClicouEmFechar(false);
            }
          }
        });
      }
    })();
  };

  const handleSaveClose = () => {
    setClicouEmFechar(true);
  };

  useEffect(() => {
    if (ClicouEmFechar) {
      handleSave();
    }
  }, [ClicouEmFechar]);


  return (
    <LayoutBaseDePagina
      titulo="Configurações"
      barraDeFerramentas={
        <FerramentasDeDetalhe
          textoBotaoNovo='Novo'
          mostrarBotaoNovo={false}
          mostrarBotaoApagar={false}
          mostrarBotaoSalvar={false}
          mostrarBotaoSalvarEFechar={true}
          aoClicarEmSalvar={handleSave}
          aoClicarEmSalvarEFechar={handleSaveClose}
          aoClicarEmVoltar={() => navigate('/biblioteca-jogos')}
        />
      }
    >
      <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {user && (
          <FormUser
            editUser={true}
            trocaSenha={trocarSenha}
            onChangeSenha={setTrocarSenha}
            control={control}
            errors={errors}
            isLoading={isLoading}
            isMobile={isMobile}
            fotoURL={user.FotoURL}
          />
        )}
      </form>
    </LayoutBaseDePagina>
  );
};