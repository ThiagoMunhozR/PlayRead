import { useNavigate, useParams } from 'react-router-dom';
import { Box, Grid, LinearProgress, Paper, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

import { FerramentasDeDetalhe } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';
import { JogosService } from '../../shared/services/api/jogos/JogosService';
import { useMessageContext } from '../../shared/contexts';

type FormData = {
  id?: number;
  data: string;
  nome: string;
  dataCompleto: string;
};

export const DetalheDeJogos: React.FC = () => {
  const { id = 'novo' } = useParams<'id'>();
  const navigate = useNavigate();
  const { showAlert, showConfirmation } = useMessageContext();

  const [isLoading, setIsLoading] = useState(false);
  const [jogo, setJogo] = useState<FormData | null>(null);
  const [nome, setNome] = useState('');

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      id: id !== 'novo' ? Number(id) : undefined,
      data: '',
      nome: '',
      dataCompleto: '',
    },
  });

  useEffect(() => {
    if (id !== 'novo') {
      setIsLoading(true);

      JogosService.getById(Number(id))
        .then((result) => {
          setIsLoading(false);

          if (result instanceof Error) {
            showAlert(result.message, 'error');
            navigate('/jogos');
          } else {
            setJogo(result);
            setNome(result.nome);
            setValue('id', result.id);
            setValue('data', result.data || '');
            setValue('nome', result.nome || '');
            setValue('dataCompleto', result.dataCompleto || '');
          }
        });
    }
  }, [id, setValue]);

  const handleSave = () => {
    handleSubmit((formData: FormData) => {
      setIsLoading(true);
      if (id === 'novo') {
        JogosService.getAll().then((jogos) => {
          if (jogos instanceof Error) {
            showAlert(jogos.message, 'error');
            return;
          }

          // Determinar o próximo ID
          const nextId = jogos.totalCount + 1;

          const newJogo = {
            id: nextId,
            ...formData,
          };

          // Adicionar novo jogo
          JogosService.create(newJogo).then((result) => {
            if (result instanceof Error) {
              showAlert(result.message, 'error');
            } else {
              showAlert('Jogo salvo com sucesso!', 'success');
              navigate(`/jogos/detalhe/${result}`);
            }
          });
        });
      } else {
        // Atualizar jogo existente
        const payload = {
          id: Number(id), // Garantir que id é um número válido
          ...formData,
        };

        JogosService.updateById(Number(id), payload).then((result) => {
          if (result instanceof Error) {
            showAlert(result.message, 'error');
          } else {
            showAlert('Jogo atualizado com sucesso!', 'success');
          }
        });
      }
      setIsLoading(false);
    })();
  };

  const handleSaveClose = () => {
    handleSave();
    navigate('/jogos');
  };

  const handleDelete = (id: number) => {
    showConfirmation(
      'Realmente deseja apagar?', // Mensagem de confirmação
      () => { // Função que será executada se o usuário clicar em "Sim"
        JogosService.deleteById(id)
          .then(result => {
            if (result instanceof Error) {
              showAlert(result.message, 'error');
            } else {
              showAlert('Registro apagado com sucesso!', 'success');
              navigate('/jogos');
            }
          });
      },
      () => { // Função que será executada se o usuário clicar em "Não"
        showAlert('Ação cancelada pelo usuário.', 'info');
      }
    );
  };



  return (
    <LayoutBaseDePagina
      titulo={id === 'novo' ? 'Novo jogo' : nome || 'Detalhe do jogo'}
      barraDeFerramentas={
        <FerramentasDeDetalhe
          textoBotaoNovo='Novo'
          mostrarBotaoSalvarEFechar
          mostrarBotaoNovo={id !== 'novo'}
          mostrarBotaoApagar={id !== 'novo'}

          aoClicarEmSalvar={handleSave}
          aoClicarEmSalvarEFechar={handleSaveClose}
          aoClicarEmApagar={() => handleDelete(Number(id))}
          aoClicarEmVoltar={() => navigate('/jogos')}
          aoClicarEmNovo={() => navigate('/jogos/detalhe/novo')}
        />
      }
    >

      <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Box margin={1} display="flex" flexDirection="column" component={Paper} variant="outlined">

          <Grid container direction="column" padding={2} spacing={2}>

            {isLoading && (
              <Grid item>
                <LinearProgress variant='indeterminate' />
              </Grid>
            )}

            <Grid item>
              <Typography variant='h6'>Geral</Typography>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                {/* Campo Nome */}
                <Controller
                  name="nome"
                  control={control}
                  rules={{ required: 'O nome é obrigatório' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome do Jogo"
                      disabled={isLoading}
                      error={!!errors.nome}
                      helperText={errors.nome?.message}
                      fullWidth
                      onChange={(e) => {
                        field.onChange(e);
                        setNome(e.target.value);
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                {/* Campo Data */}
                <Controller
                  name="data"
                  disabled={isLoading}
                  control={control}
                  rules={{
                    required: 'A data é obrigatória',
                    pattern: {
                      value: /^\d{2}\/\d{2}\/\d{4}$/,
                      message: 'Data inválida. Use o formato DD/MM/AAAA',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Data"
                      error={!!errors.data}
                      helperText={errors.data?.message}
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={4} xl={2}>
                {/* Campo Data Completo (opcional) */}
                <Controller
                  name="dataCompleto"
                  disabled={isLoading}
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Data Completa (Opcional)" fullWidth />
                  )}
                />
              </Grid>
            </Grid>

          </Grid>

        </Box>

      </form>
    </LayoutBaseDePagina>
  );
};