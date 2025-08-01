import { useEffect, useMemo, useState } from 'react';
import { LinearProgress, Paper, Rating, useTheme } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IListagemJogo, JogosService } from '../../shared/services/api/jogos/JogosService';
import { FerramentasDaListagem } from '../../shared/components';
import { ActionMenu } from '../../shared/components/ActionMenu/ActionMenu';
import { useAppThemeContext, useAuthContext, useMessageContext } from '../../shared/contexts';
import { LayoutBaseDePagina } from '../../shared/layouts';
import { useDebounce } from '../../shared/hooks';

export const ListagemDeJogo: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { isMobile } = useAppThemeContext();
    const { debounce } = useDebounce();
    const navigate = useNavigate();
    const theme = useTheme();
    const { showAlert, showConfirmation } = useMessageContext();
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: isMobile ? 15 : 50 });
    const [rows, setRows] = useState<IListagemJogo[]>([]);
    const [filteredRows, setFilteredRows] = useState<IListagemJogo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthContext();
    // Estado de ordenação
    const [sortModel, setSortModel] = useState<GridSortModel>(() => {
        const saved = localStorage.getItem('jogos-grid-sort');
        return saved ? JSON.parse(saved) : [{ field: 'nome', sort: 'asc' }];
    });

    const busca = useMemo(() => {
        return searchParams.get('busca') || '';
    }, [searchParams]);

    useEffect(() => {
        setIsLoading(true);
        debounce(() => {
            JogosService.getAll(user?.CodigoUsuario, 0, '', 9999).then((result) => {
                if (result instanceof Error) {
                    showAlert(result.message, 'error');
                    setIsLoading(false);
                } else {
                    setRows(result.data);
                    setIsLoading(false);
                }
            });
        });
    }, [user?.CodigoUsuario]);

    useEffect(() => {
        // Filtra os jogos conforme a busca
        let filtered = rows;
        if (busca.trim() !== '') {
            filtered = rows.filter(jogo => jogo.nome.toLowerCase().includes(busca.toLowerCase()));
        }
        setFilteredRows(filtered);
        setPaginationModel((prev) => ({ ...prev, page: 0 })); // Sempre volta para a primeira página ao buscar
    }, [busca, rows]);

    const handleDelete = (id: number, nome: string) => {
        showConfirmation(
            `Realmente deseja apagar ${nome}?`,
            () => {
                JogosService.deleteById(id).then((result) => {
                    if (result instanceof Error) {
                        showAlert(result.message, 'error');
                    } else {
                        showAlert('Registro apagado com sucesso!', 'success');
                        // Atualiza localmente
                        setRows(prev => prev.filter(jogo => jogo.id !== id));
                    }
                });
            },
            () => { }
        );
    };

    const columns: GridColDef[] = [
        {
            field: 'Ações',
            headerName: isMobile ? '' : 'Ações',
            width: isMobile ? 54 : 90,
            headerClassName: 'super-app-theme--header',
            sortable: false,
            resizable: false,
            hideable: false,
            renderCell: (params: GridRenderCellParams) => (
                <ActionMenu
                    isMobile={isMobile}
                    onEdit={() => navigate(`/jogos/detalhe/${params.row.id}`)}
                    onDelete={() => handleDelete(params.row.id, params.row.nome)}
                />
            ),
        },
        { field: 'nome', headerName: 'Jogo', hideable: false, flex: 1, headerClassName: 'super-app-theme--header', },
        { field: 'data', headerName: 'Data', flex: 1, headerClassName: 'super-app-theme--header', },
        { field: 'dataCompleto', headerName: 'Completo', flex: 1, headerClassName: 'super-app-theme--header', },
        {
            field: 'avaliacao',
            headerName: 'Avaliação',
            flex: 1,
            headerClassName: 'super-app-theme--header',
            renderCell: (params: GridRenderCellParams) => (
                <Rating
                    value={params.value || 0}
                    precision={0.25}
                    readOnly
                    size="small"
                />
            ),
        },
    ];

    // Salva o sortModel no localStorage sempre que mudar
    useEffect(() => {
        localStorage.setItem('jogos-grid-sort', JSON.stringify(sortModel));
    }, [sortModel]);

    return (
        <LayoutBaseDePagina
            titulo="Gerenciar jogos"
            barraDeFerramentas={
                <FerramentasDaListagem
                    mostrarInputBusca
                    textoDaBusca={busca}
                    textoBotaoNovo="Novo"
                    aoClicarEmNovo={() => navigate('/jogos/detalhe/novo', { state: { from: 'listagem' } })}
                    aoMudarTextoDeBusca={(texto) => setSearchParams({ busca: texto }, { replace: true })}
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
                        rows={filteredRows}
                        columns={columns}
                        loading={isLoading}
                        pagination
                        pageSizeOptions={[15, 30, 50, 100]}
                        paginationModel={paginationModel}
                        onPaginationModelChange={(model) => setPaginationModel(model)}
                        sortModel={sortModel}
                        onSortModelChange={setSortModel}
                        localeText={{
                            MuiTablePagination: {
                                labelRowsPerPage: "Linhas por página",
                            },
                            noRowsLabel: "Nenhum jogo encontrado",
                            columnMenuSortAsc: "Ordenar crescente",
                            columnMenuSortDesc: "Ordenar decrescente",
                            columnMenuFilter: "Filtrar",
                            columnMenuHideColumn: "Ocultar coluna",
                            columnMenuShowColumns: "Mostrar colunas",
                            columnMenuManageColumns: "Gerenciar colunas",
                        }}
                        sx={{ height: 'auto' }}
                        initialState={{
                            columns: {
                                columnVisibilityModel: {
                                    data: !isMobile,
                                    dataCompleto: !isMobile,
                                    avaliacao: !isMobile,
                                }
                            }
                        }}                        
                    />
                )}
            </Paper>
        </LayoutBaseDePagina>
    );
};