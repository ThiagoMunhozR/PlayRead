import { useNavigate, useParams } from 'react-router-dom';
import { Box, Grid, LinearProgress, Paper, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

import { FerramentasDeDetalhe } from '../../shared/components';
import { LayoutBaseDePagina } from '../../shared/layouts';
import { LivrosService } from '../../shared/services/api/livros/LivrosService';
import { useAuthContext, useMessageContext } from '../../shared/contexts';


type FormData = {
  id?: number;
  data: string;
  nome: string;
};

export const DetalheDeLivros: React.FC = () => {
  const { id = 'novo' } = useParams<'id'>();
  const navigate = useNavigate();
  const { showAlert, showConfirmation } = useMessageContext();

  const [isLoading, setIsLoading] = useState(false);
  const [, setLivro] = useState<FormData | null>(null);
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
      data: '',
      nome: '',
    },
  });

  useEffect(() => {
    if (id !== 'novo') {
      setIsLoading(true);

      LivrosService.getById(Number(id))
        .then((result) => {
          setIsLoading(false);

          if (result instanceof Error) {
            showAlert(result.message, 'error');
            navigate('/livros');
          } else {
            setLivro(result);
            setNome(result.nome);
            setValue('id', result.id);
            setValue('data', result.data || '');
            setValue('nome', result.nome || '');
          }
        });
    }
  }, [id, setValue]);

  const handleSave = () => {
    handleSubmit((formData: FormData) => {
      setIsLoading(true);
      if (id === 'novo') {
        LivrosService.getAll(user?.CodigoUsuario).then((Livros) => {
          if (Livros instanceof Error) {
            showAlert(Livros.message, 'error');
            return;
          }

          LivrosService.getUltimoRegistroLivros('livros')
            .then((lastId) => {
              if (lastId instanceof Error) {
                showAlert(lastId.message, 'error');
                return;
              }

              const nextId = lastId + 1;

              const newLivro = {
                id: nextId, // Valor do próximo ID gerado
                data: formData.data, // Data do Livro
                nome: formData.nome, // Nome do Livro
              };

              // Adicionar novo Livro
              LivrosService.create(newLivro.id, newLivro.data, newLivro.nome, user?.CodigoUsuario).then((result) => {
                if (result instanceof Error) {
                  showAlert(result.message, 'error');
                } else {
                  showAlert('Livro salvo com sucesso!', 'success');             
                  if (ClicouEmFechar) {                   
                    navigate('/livros');
                    setClicouEmFechar(false);                    
                  } else {
                    navigate(`/livros/detalhe/${result}`);                  
                  }                
                }
              });
            })
            .catch((error) => {
              console.error('Erro ao salvar:', error);
              showAlert('Erro ao salvar o Livro.', 'error');
            });
        });
      } else {
        // Atualizar Livro existente
        const payload = {
          id: Number(id), // Garantir que id é um número válido
          CodigoUsuario: user?.CodigoUsuario,
          ...formData,
        };

        LivrosService.updateById(Number(id), payload).then((result) => {
          if (result instanceof Error) {
            showAlert(result.message, 'error');
            showAlert('Livro atualizado com sucesso!', 'success');
          } else {
            if (ClicouEmFechar) {
              navigate('/livros');
              setClicouEmFechar(false);
            }
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
        LivrosService.deleteById(id)
          .then(result => {
            if (result instanceof Error) {
              showAlert(result.message, 'error');
            } else {
              showAlert('Registro apagado com sucesso!', 'success');
              navigate('/livros');
            }
          });
      },
      () => {} // Função que será executada se o usuário clicar em "Não"
    );
  };

  return (
    <LayoutBaseDePagina
      titulo={id === 'novo' ? 'Novo Livro' : nome || 'Detalhe do Livro'}
      barraDeFerramentas={
        <FerramentasDeDetalhe
          textoBotaoNovo='Novo'
          mostrarBotaoSalvarEFechar
          mostrarBotaoNovo={id !== 'novo'}
          mostrarBotaoApagar={id !== 'novo'}

          aoClicarEmSalvar={handleSave}
          aoClicarEmSalvarEFechar={handleSaveClose}
          aoClicarEmApagar={() => handleDelete(Number(id))}
          aoClicarEmVoltar={() => navigate('/livros')}
          aoClicarEmNovo={() => navigate('/livros/detalhe/novo')}
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
                      label="Nome do Livro"
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

          </Grid>

        </Box>

      </form>
    </LayoutBaseDePagina>
  );
};