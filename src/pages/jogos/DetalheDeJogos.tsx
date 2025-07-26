import { useNavigate, useParams } from 'react-router-dom';
import { Box, Grid, LinearProgress, Paper, Rating, TextField, Typography, IconButton } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

import { FerramentasDeDetalhe } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';
import { JogosService } from '../../shared/services/api/jogos/JogosService';
import { useAuthContext, useMessageContext } from '../../shared/contexts';

type FormData = {
  id?: number;
  data: string;
  nome: string;
  dataCompleto: string;
  avaliacao: number;
};

export const DetalheDeJogos: React.FC = () => {
  const { id = 'novo' } = useParams<'id'>();
  const navigate = useNavigate();
  const { showAlert, showConfirmation } = useMessageContext();

  const [isLoading, setIsLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [ClicouEmFechar, setClicouEmFechar] = useState(false);
  const { user } = useAuthContext();

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      id: id !== 'novo' ? Number(id) : undefined,
      data: new Date().toISOString().split('T')[0],
      nome: '',
      dataCompleto: '',
      avaliacao: 0,
    },
  });

  useEffect(() => {
    if (id !== 'novo') {
      setIsLoading(true);

      JogosService.getById(Number(id)).then((result) => {
        setIsLoading(false);

        if (result instanceof Error) {
          showAlert(result.message, 'error');
          navigate('/jogos');
        } else {
          setNome(result.nome);

          // Converter a data de DD/MM/YYYY para YYYY-MM-DD
          const DataFormatada = result.data
            ? result.data.split('/').reverse().join('-')
            : '';

          const DataCompletaFormatada = result.data
            ? result.dataCompleto.split('/').reverse().join('-')
            : '';

          setValue('id', result.id);
          setValue('data', DataFormatada);
          setValue('nome', result.nome || '');
          setValue('dataCompleto', DataCompletaFormatada || '');
          setValue('avaliacao', result.avaliacao ?? 0);
        }
      });
    }
  }, [id, setValue]);

  const handleSave = () => {
    handleSubmit((formData: FormData) => {
      setIsLoading(true);

      // Função para formatar a data apenas se necessário
      const formatarDataParaSalvar = (DataParaFormatar: string): string => {
        console.log(DataParaFormatar);
        if (DataParaFormatar == "-undefined-undefined" || DataParaFormatar == "") {
          return ""; // Retorna vazio se a data não for informada
        }

        const formatoCorreto = /^\d{2}\/\d{2}\/\d{4}$/; // Verifica se está no formato DD/MM/YYYY

        if (formatoCorreto.test(DataParaFormatar)) {
          return DataParaFormatar; // Retorna a data sem alterações
        }
        // Converte de YYYY-MM-DD para DD/MM/YYYY
        const [ano, mes, dia] = DataParaFormatar.split('-');
        return `${dia}/${mes}/${ano}`;
      };

      const DataFormatada = formatarDataParaSalvar(formData.data);
      const DataCompletaFormatada = formatarDataParaSalvar(formData.dataCompleto);

      if (id === 'novo') {
        JogosService.getAll(user?.CodigoUsuario).then((jogos) => {
          if (jogos instanceof Error) {
            showAlert(jogos.message, 'error');
            return;
          }

          JogosService.getUltimoRegistroJogos('jogos')
            .then((lastId) => {
              if (lastId instanceof Error) {
                showAlert(lastId.message, 'error');
                return;
              }

              const nextId = lastId + 1;

              const newJogo = {
                id: nextId, // Valor do próximo ID gerado
                data: DataFormatada, // Data do jogo
                nome: formData.nome, // Nome do jogo
                dataCompleto: DataCompletaFormatada, // Data Completa (opcional)
                avaliacao: formData.avaliacao, // Avaliação inicial
              };

              // Adicionar novo jogo
              JogosService.create(newJogo.id, newJogo.data, newJogo.nome, newJogo.dataCompleto, newJogo.avaliacao, user?.CodigoUsuario).then((result) => {
                if (result instanceof Error) {
                  showAlert(result.message, 'error');
                } else {
                  showAlert('Jogo salvo com sucesso!', 'success');
                  if (ClicouEmFechar) {
                    navigate('/jogos');
                    setClicouEmFechar(false);
                  } else {
                    navigate(`/jogos/detalhe/${result}`);
                  }
                }
              });
            })
            .catch((error) => {
              console.error('Erro ao salvar:', error);
              showAlert('Erro ao salvar o jogo.', 'error');
            });
        });
      } else {
        // Atualizar jogo existente
        const payload = {
          id: Number(id), // Garantir que id é um número válido
          CodigoUsuario: user?.CodigoUsuario,
          nome: formData.nome,
          data: DataFormatada,
          dataCompleto: DataCompletaFormatada,
          avaliacao: formData.avaliacao,
        };

        JogosService.updateById(Number(id), payload).then((result) => {
          if (result instanceof Error) {
            showAlert(result.message, 'error');
          } else if (ClicouEmFechar) {
            showAlert('Jogo alterado com sucesso!', 'success');
            navigate('/jogos');
            setClicouEmFechar(false);
          } else {
            showAlert('Jogo alterado com sucesso!', 'success');
          }
        });
      }
      setIsLoading(false);
    })();
  };

  // Ação de Salvar e Fechar
  const handleSaveClose = () => {
    setClicouEmFechar(true);
  };

  useEffect(() => {
    if (ClicouEmFechar) {
      handleSave();
    }
  }, [ClicouEmFechar]);

  // Ação de deletar
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
      () => { } // Função que será executada se o usuário clicar em "Não"
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
            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={6} md={6} lg={4} xl={2}>
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
              <Grid item xs={12} sm={6} md={3} lg={2} xl={2}>
                {/* Campo Data */}
                <Controller
                  name="data"
                  control={control}
                  rules={{
                    required: 'A data é obrigatória',
                  }}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      label="Data"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      {...field}
                      disabled={isLoading}
                      error={!!errors.data}
                      helperText={errors.data?.message}
                      value={(field.value && field.value.length > 0 && field.value.split('T')[0]) || ''}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3} lg={2} xl={2}>
                {/* Campo Data Completo (opcional) */}
                <Controller
                  name="dataCompleto"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Data Completa (Opcional)"
                      fullWidth
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      disabled={isLoading}
                      value={field.value || ''}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container item direction="row" spacing={2}>
              <Grid item xs={12} sm={6} md={6} lg={4} xl={2}>
                <Box component={Paper} elevation={0} sx={{ p: 2, borderRadius: 2, width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', border: '2px solid', borderColor: 'divider' }}>
                  <Typography variant="body1" mb={1} align="center">Avaliação</Typography>
                  <Controller
                    name="avaliacao"
                    control={control}
                    render={({ field }) => (
                      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <IconButton
                          aria-label="Diminuir meia estrela"
                          onClick={() => field.onChange(Math.max(0, (field.value || 0) - 0.5))}
                          disabled={isLoading || (field.value || 0) <= 0}
                          sx={{
                            color: 'white',
                            opacity: 0.5,
                            p: 0.2,
                            background: 'none',
                            border: 'none',
                            boxShadow: 'none',
                            outline: 'none',
                            '&:hover': { background: 'none', opacity: 0.8 },
                            '&:focus': { background: 'none', boxShadow: 'none', outline: 'none' },
                            '&:active': { background: 'none', boxShadow: 'none', outline: 'none' },
                          }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Rating
                          {...field}
                          precision={0.5}
                          value={field.value || 0}
                          onChange={(_, value) => field.onChange(value)}
                          disabled={isLoading}
                          size="large"
                        />
                        <IconButton
                          aria-label="Aumentar meia estrela"
                          onClick={() => field.onChange(Math.min(5, (field.value || 0) + 0.5))}
                          disabled={isLoading || (field.value || 0) >= 5}
                          sx={{
                            color: 'white',
                            opacity: 0.5,
                            p: 0.2,
                            background: 'none',
                            border: 'none',
                            boxShadow: 'none',
                            outline: 'none',
                            '&:hover': { background: 'none', opacity: 0.8 },
                            '&:focus': { background: 'none', boxShadow: 'none', outline: 'none' },
                            '&:active': { background: 'none', boxShadow: 'none', outline: 'none' },
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  />
                </Box>
              </Grid>
            </Grid>

          </Grid>

        </Box>

      </form>
    </LayoutBaseDePagina>
  );
};