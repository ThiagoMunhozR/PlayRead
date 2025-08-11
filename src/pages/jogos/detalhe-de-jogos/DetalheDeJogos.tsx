import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Box, Grid, LinearProgress, Paper, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';

import { CustomCard, FerramentasDeDetalhe } from '../../../shared/components';
import { RatingBox } from '../../../shared/components/RatingBox/RatingBox';
import { LayoutBaseDePagina } from '../../../shared/layouts';
import { JogosService } from '../../../shared/services/api/jogos/JogosService';
import { useAppThemeContext, useAuthContext, useMessageContext } from '../../../shared/contexts';
import { carregarImagensItens } from '../../../shared/utils/carregarImagensItens';
import { CampoNomeJogo } from './components';

type FormData = {
  id?: number;
  data: string;
  nome: string;
  dataCompleto: string;
  avaliacao: number;
};

export const DetalheDeJogos: React.FC = () => {
  const formatarDataVisual = (data: string) => {
    if (!data || data.length !== 10 || !data.includes('-')) return data;
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };
  const { id = 'novo' } = useParams<'id'>();
  const navigate = useNavigate();
  const { showAlert, showConfirmation } = useMessageContext();

  const [isLoading, setIsLoading] = useState(false);
  const { isMobile } = useAppThemeContext();
  const [ClicouEmFechar, setClicouEmFechar] = useState(false);
  const { user } = useAuthContext();
  const [imagemJogo, setImagemJogo] = useState<string>('/imagens/SemImagem.jpg');
  const location = useLocation();
  const from = location.state?.from || 'listagem';
  const paramTitle = location.state?.title || '';
  const paramTitleId = location.state?.titleId || null;
  const [titleIdSelecionado, setTitleIdSelecionado] = useState<string | null>(paramTitleId);

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      id: id !== 'novo' ? Number(id) : undefined,
      data: new Date().toISOString().split('T')[0],
      nome: paramTitle || '',
      dataCompleto: '',
      avaliacao: 0,
    },
  });

  const watchedNome = useWatch({ control, name: 'nome' });
  const watchedData = useWatch({ control, name: 'data' });
  const watchedAvaliacao = useWatch({ control, name: 'avaliacao' });
  const watchedDataCompleto = useWatch({ control, name: 'dataCompleto' });

  useEffect(() => {
    if (watchedNome === '') {
      setImagemJogo('/imagens/SemImagem.jpg');
      setTitleIdSelecionado(null);
    }
  }, [watchedNome]);

  useEffect(() => {
    if (id === 'novo' && paramTitle) {
      carregarImagensItens([{ nome: paramTitle }], 'jogos', JogosService.buscarCapaDoJogo)
        .then((imgs) => {
          setImagemJogo(imgs[paramTitle] || '/imagens/SemImagem.jpg');
        });
    }
  }, [id, paramTitle]);

  useEffect(() => {
    if (id !== 'novo') {
      JogosService.getById(Number(id)).then((result) => {
        if (!(result instanceof Error) && result.nome) {
          carregarImagensItens([{ nome: result.nome }], 'jogos', JogosService.buscarCapaDoJogo)
            .then((imgs) => {
              setImagemJogo(imgs[result.nome] || '/imagens/SemImagem.jpg');
            });
        }
      });
    }
  }, [id]);

  const handleNavigateBack = () => {
    if (from === 'biblioteca') {
      navigate('/biblioteca-jogos');
    } else {
      navigate('/jogos');
    }
  };

  useEffect(() => {
    if (id !== 'novo') {
      setIsLoading(true);

      JogosService.getById(Number(id)).then((result) => {
        setIsLoading(false);

        if (result instanceof Error) {
          showAlert(result.message, 'error');
          handleNavigateBack();
        } else {
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
                titleId: titleIdSelecionado || null, // Title ID do jogo
                dataCompleto: DataCompletaFormatada, // Data Completa (opcional)
                avaliacao: formData.avaliacao, // Avaliação inicial
              };

              // Adicionar novo jogo
              JogosService.create(newJogo.id, newJogo.data, newJogo.nome, newJogo.titleId, newJogo.dataCompleto, newJogo.avaliacao, user?.CodigoUsuario).then((result) => {
                if (result instanceof Error) {
                  showAlert(result.message, 'error');
                } else {
                  showAlert('Jogo salvo com sucesso!', 'success');
                  if (ClicouEmFechar) {
                    handleNavigateBack();
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
          titleId: titleIdSelecionado || null,
          data: DataFormatada,
          dataCompleto: DataCompletaFormatada,
          avaliacao: formData.avaliacao,
        };

        JogosService.updateById(Number(id), payload).then((result) => {
          if (result instanceof Error) {
            showAlert(result.message, 'error');
          } else if (ClicouEmFechar) {
            showAlert('Jogo alterado com sucesso!', 'success');
            handleNavigateBack();
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
              handleNavigateBack();
            }
          });
      },
      () => { } // Função que será executada se o usuário clicar em "Não"
    );
  };

  const getImageStyles = () => ({
    width: '100%',
    height: 240,
    objectFit: 'cover',
    borderRadius: '4px 4px 0 0',
    boxSizing: 'border-box',
    display: 'block',
    boxShadow: '16px 10px 14px 0 rgba(0,0,0,0.25)'
  });

  return (
    <LayoutBaseDePagina
      titulo={id === 'novo' ? 'Novo jogo' : watchedNome || 'Detalhe do jogo'}
      barraDeFerramentas={
        <FerramentasDeDetalhe
          textoBotaoNovo='Novo'
          mostrarBotaoSalvarEFechar
          mostrarBotaoNovo={id !== 'novo'}
          mostrarBotaoApagar={id !== 'novo'}

          aoClicarEmSalvar={handleSave}
          aoClicarEmSalvarEFechar={handleSaveClose}
          aoClicarEmApagar={() => handleDelete(Number(id))}
          aoClicarEmVoltar={handleNavigateBack}
          aoClicarEmNovo={() => navigate(`/jogos/detalhe/novo`, { state: { from: 'listagem' } })}
        />
      }
    >

      <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Box margin={1} display="flex" flexDirection="column" component={Paper} variant="outlined">

          <Grid container spacing={0.1} alignItems="flex-start" padding={2}>
            <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
              <Grid container direction="column" padding={2} spacing={2}>

                {isLoading && (
                  <Grid item>
                    <LinearProgress variant='indeterminate' />
                  </Grid>
                )}
                <Grid container item direction="row" spacing={2}>
                  {isMobile && imagemJogo !== '/imagens/SemImagem.jpg' && (
                    <Grid item xs={12} container justifyContent="center">
                      <Box
                        marginBottom={2}
                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                      >
                        <Box
                          component="img"
                          src={imagemJogo}
                          alt=""
                          sx={getImageStyles()}
                        />
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    {/* Campo Nome usando componente CampoNomeJogo */}
                    <Controller
                      name="nome"
                      control={control}
                      rules={{ required: 'O nome é obrigatório' }}
                      render={({ field }) => (
                        <CampoNomeJogo
                          field={field}
                          isLoading={isLoading}
                          error={!!errors.nome}
                          helperText={errors.nome?.message}
                          onSelectNome={(nomeSelecionado, titleId) => {
                            carregarImagensItens([{ nome: nomeSelecionado }], 'jogos', JogosService.buscarCapaDoJogo)
                              .then((imgs) => {
                                const img = imgs[nomeSelecionado] || '/imagens/SemImagem.jpg';
                                setImagemJogo(img);
                                setTitleIdSelecionado(img !== '/imagens/SemImagem.jpg' ? titleId ?? null : null);
                              });
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Grid container item direction="row" spacing={2}>
                  <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
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
                  <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
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
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <Controller
                      name="avaliacao"
                      control={control}
                      render={({ field }) => (
                        <RatingBox
                          value={field.value || 0}
                          onChange={field.onChange}
                          isLoading={isLoading}
                          isMobile={isMobile}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            {!isMobile && (
              <Grid item xs={12} sm={4.5} md={4.5} lg={2.5} xl={2.5}>
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  {/* CustomCard dinâmico */}
                  <CustomCard
                    imageSrc={imagemJogo}
                    title={watchedNome || ''}
                    subtitle={formatarDataVisual(watchedData) || ''}
                    rating={watchedAvaliacao || 0}
                    showTrophy={!!watchedDataCompleto}
                    isMobile={false}
                  />
                </Box>
              </Grid>
            )}
            {/* Coluna 3: Vazia */}
            <Grid item xs={12} sm={1} md={2} lg={1} xl={1}>
              <Box sx={{ width: '100%', height: '100%' }} />
            </Grid>
          </Grid>
        </Box>

      </form>
    </LayoutBaseDePagina>
  );
};