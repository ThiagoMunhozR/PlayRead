import { useEffect, useMemo, useState } from 'react';
import { Icon, IconButton, LinearProgress, Paper, useTheme } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IListagemLivro, LivrosService } from '../../shared/services/api/livros/LivrosService';
import { FerramentasDaListagem } from '../../shared/components';
import { useAuthContext, useMessageContext } from '../../shared/contexts';
import { LayoutBaseDePagina } from '../../shared/layouts';
import { useDebounce } from '../../shared/hooks';

export const ListagemDeLivro: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { debounce } = useDebounce();
    const navigate = useNavigate();
    const theme = useTheme();
    const { showAlert, showConfirmation } = useMessageContext();
    const [pageSize, setPageSize] = useState(8);

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
        LivrosService.getAll(user?.CodigoUsuario, pagina, busca, pageSize).then((result) => {
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
    }, [busca, pagina, pageSize]);

    const handleDelete = (id: number) => {
        showConfirmation(
            'Realmente deseja apagar?',
            () => {
                LivrosService.deleteById(id).then((result) => {
                    if (result instanceof Error) {
                        showAlert(result.message, 'error');
                    } else {
                        showAlert('Registro apagado com sucesso!', 'success');
                        CarregarLivros();
                    }
                });
            },
            () => { }
        );
    };

    // Definição das colunas do DataGrid
    const columns: GridColDef[] = [
        {
            field: 'acoes',
            disableColumnMenu: true,
            headerName: 'Ações',
            headerAlign: 'center',
            headerClassName: 'super-app-theme--header',
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <>
                    <IconButton size="small" onClick={() => handleDelete(params.row.id)}>
                        <Icon>delete</Icon>
                    </IconButton>
                    <IconButton size="small" onClick={() => navigate(`/livros/detalhe/${params.row.id}`)}>
                        <Icon>edit</Icon>
                    </IconButton>
                </>
            ),
        },
        { field: 'nome', headerName: 'Livro', flex: 1, headerClassName: 'super-app-theme--header', },
        { field: 'data', headerName: 'Data', flex: 1, headerClassName: 'super-app-theme--header', },
    ];

    return (
        <LayoutBaseDePagina
            titulo="Gerenciar Livros"
            barraDeFerramentas={
                <FerramentasDaListagem
                    mostrarInputBusca
                    textoDaBusca={busca}
                    textoBotaoNovo="Novo"
                    aoClicarEmNovo={() => navigate('/livros/detalhe/novo')}
                    aoMudarTextoDeBusca={(texto) => setSearchParams({ busca: texto, pagina: '1' }, { replace: true })}
                />
            }
        >
            <Paper
                variant="outlined"
                sx={{
                    m: 1,
                    height: 'auto',
                    width: 'auto',
                    '& .super-app-theme--header': {
                        backgroundColor: theme.palette.background.paper,
                    },
                }}>
                {isLoading ? (
                    <LinearProgress />
                ) : (
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        rowCount={totalCount}
                        paginationMode="server"
                        loading={isLoading}
                        pageSizeOptions={[8, 15, 30, 50]} // Permite mudar o tamanho da página
                        paginationModel={{ page: pagina - 1, pageSize }} // Ajusta a página para o formato correto
                        onPaginationModelChange={(model) => {
                            setSearchParams({ busca, pagina: String(model.page + 1) }, { replace: true });
                            setPageSize(model.pageSize);
                        }}             
                        localeText={{
                            MuiTablePagination: {
                                labelRowsPerPage: "Linhas por página",
                            },
                            noRowsLabel: "Nenhum livro encontrado",
                            columnMenuSortAsc: "Ordenar crescente",
                            columnMenuSortDesc: "Ordenar decrescente",
                            columnMenuFilter: "Filtrar",
                            columnMenuHideColumn: "Ocultar coluna",
                            columnMenuShowColumns: "Mostrar colunas",
                        }}
                    />
                )}
            </Paper>
        </LayoutBaseDePagina>
    );
};