import { useEffect, useMemo, useState } from 'react';
import { Icon, IconButton, LinearProgress, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IListagemLivro, LivrosService } from '../../shared/services/api/livros/LivrosService';
import { FerramentasDaListagem } from '../../shared/components';
import { useAuthContext, useMessageContext } from '../../shared/contexts';
import { LayoutBaseDePagina } from '../../shared/layouts';
import { useDebounce } from '../../shared/hooks';
import { Environment } from '../../shared/environment';


export const ListagemDeLivro: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { debounce } = useDebounce();
    const navigate = useNavigate();
    const { showAlert, showConfirmation } = useMessageContext();

    const [rows, setRows] = useState<IListagemLivro[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const { user } = useAuthContext();

    const busca = useMemo(() => {
        return searchParams.get('busca') || '';
    }, [searchParams]);

    const pagina = useMemo(() => {
        return Number(searchParams.get('pagina') || '1');
    }, [searchParams]);

    const CarregarLivros = () => {
        LivrosService.getAll(user?.CodigoUsuario, pagina, busca)
            .then(result => {
                if (result instanceof Error) {
                    showAlert(result.message, 'error');
                    setIsLoading(false);
                } else {
                    setTotalCount(result.totalCount);
                    setRows(result.data);
                    setIsLoading(false);
                }
            });
    };

    useEffect(() => {
        setIsLoading(true);

        debounce(() => {
            CarregarLivros();
        });
    }, [busca, pagina]);

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
                            CarregarLivros();
                        }
                    });
            },
            () => {}
        );
    };

    return (
        <LayoutBaseDePagina
            titulo='Gerenciar Livros'
            barraDeFerramentas={
                <FerramentasDaListagem
                    mostrarInputBusca
                    textoDaBusca={busca}
                    textoBotaoNovo='Novo'
                    aoClicarEmNovo={() => navigate('/livros/detalhe/novo')}
                    aoMudarTextoDeBusca={texto => setSearchParams({ busca: texto, pagina: '1' }, { replace: true })}
                />
            }
        >
            <TableContainer component={Paper} variant="outlined" sx={{ m: 1, width: 'auto' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Ações</TableCell>
                            <TableCell>Data</TableCell>
                            <TableCell>Livro</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map(row => (
                            <TableRow key={row.id}>
                                <TableCell>
                                    <IconButton size="small" onClick={() => handleDelete(row.id)}>
                                        <Icon>delete</Icon>
                                    </IconButton>
                                    <IconButton size="small" onClick={() => navigate(`/livros/detalhe/${row.id}`)}>
                                        <Icon>edit</Icon>
                                    </IconButton>
                                </TableCell>
                                <TableCell>{row.data}</TableCell>
                                <TableCell>{row.nome}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>

                    {totalCount === 0 && !isLoading && (
                        <caption>{Environment.LISTAGEM_VAZIA}</caption>
                    )}

                    <TableFooter>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <LinearProgress variant='indeterminate' />
                                </TableCell>
                            </TableRow>
                        )}
                        {(totalCount > 0 && totalCount > Environment.LIMITE_DE_LINHAS) && (
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <Pagination
                                        page={pagina}
                                        count={Math.ceil(totalCount / Environment.LIMITE_DE_LINHAS)}
                                        onChange={(_, newPage) => setSearchParams({ busca, pagina: newPage.toString() }, { replace: true })}
                                    />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableFooter>
                </Table>
            </TableContainer>
        </LayoutBaseDePagina>
    );
};