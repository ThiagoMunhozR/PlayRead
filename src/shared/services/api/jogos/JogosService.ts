import { Environment } from '../../../environment';
import { Api } from '../axios-config';


export interface IListagemJogo {
  id: number;
  data: string;
  nome: string;
  dataCompleto: string;
}

export interface IDetalheJogo {
    id: number;
    data: string;
    nome: string;
    dataCompleto: string;
}

type TJogosComTotalCount = {
  data: IListagemJogo[];
  totalCount: number;
}

const getAll = async (page = 1, filter = ''): Promise<TJogosComTotalCount | Error> => {
  try {
  
    let urlRelativa: string;
    
    if (page === 0) { 
       urlRelativa = `/jogos`;
    } else {
       urlRelativa = `/jogos?_page=${page}&_limit=${Environment.LIMITE_DE_LINHAS}&nome_like=${filter}`;
    }
    const { data, headers } = await Api.get(urlRelativa);

    if (data) {
      return {
        data,
        totalCount: Number(headers['x-total-count'] || Environment.LIMITE_DE_LINHAS),
      };
    }

    return new Error('Erro ao listar os registros.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao listar os registros.');
  }
};

const getById = async (id: number): Promise<IDetalheJogo | Error> => {
  try {
    const { data } = await Api.get(`/jogos/${id}`);

    if (data) {
      return data;
    }

    return new Error('Erro ao consultar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao consultar o registro.');
  }
};

const create = async (dados: Omit<IDetalheJogo, 'id'>): Promise<number | Error> => {
  try {
    const { data } = await Api.post<IDetalheJogo>('/jogos', dados);

    if (data) {
      return data.id;
    }

    return new Error('Erro ao criar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao criar o registro.');
  }
};

const updateById = async (id: number, dados: IDetalheJogo): Promise<void | Error> => {
  try {
    await Api.put(`/jogos/${id}`, dados);
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao atualizar o registro.');
  }
};

const deleteById = async (id: number): Promise<void | Error> => {
  try {
    await Api.delete(`/jogos/${id}`);
  } catch (error) {
    console.error(error);
    return new Error((error as { message: string }).message || 'Erro ao apagar o registro.');
  }
};


export const JogosService = {
  getAll,
  create,
  getById,
  updateById,
  deleteById,
};