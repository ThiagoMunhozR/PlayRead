import { Environment } from '../../../environment';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(Environment.SUPABASE_URL, Environment.SUPABASE_KEY);

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
    // Fazendo a consulta ao banco sem a paginação
    let query = supabase
      .from('jogos') // Nome da tabela
      .select('*', { count: 'exact' })
      .ilike('nome', `%${filter}%`);  // Filtro de nome

    const { data, error, count } = await query;

    if (error) throw new Error(error.message || 'Erro ao listar os registros.');

    // Ordenando os dados pela data no cliente (antes da paginação)
    const sortedData = data?.sort((a, b) => {
      const dateA = new Date(a.data.split('/').reverse().join('-'));  // Convertendo de 'DD/MM/YYYY' para 'YYYY-MM-DD'
      const dateB = new Date(b.data.split('/').reverse().join('-'));  // Convertendo de 'DD/MM/YYYY' para 'YYYY-MM-DD'
      return dateB.getTime() - dateA.getTime();  // Ordem decrescente
    });

    // Paginação após a ordenação
    if (page > 0) {
      const offset = (page - 1) * Environment.LIMITE_DE_LINHAS;
      // Aplica o range apenas sobre os dados já ordenados
      const paginatedData = sortedData?.slice(offset, offset + Environment.LIMITE_DE_LINHAS);

      return {
        data: paginatedData as IListagemJogo[], // Dados paginados e ordenados
        totalCount: count || 0,
      };
    }

    // Se page for 0, retornar os dados ordenados sem paginação
    return {
      data: sortedData as IListagemJogo[],
      totalCount: count || 0,
    };
  } catch (error) {
    console.error(error);
    return new Error((error as Error).message || 'Erro ao listar os registros.');
  }
};


const getById = async (id: number): Promise<IDetalheJogo | Error> => {
  try {
    const { data, error } = await supabase
      .from('jogos') // Nome da tabela
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message || 'Erro ao consultar o registro.');

    return data as IDetalheJogo; // Garantindo que data seja do tipo IDetalheJogo
  } catch (error) {
    console.error(error);
    return new Error((error as Error).message || 'Erro ao consultar o registro.');
  }
};

const create = async (
  id: number,
  data: string,
  nome: string,
  dataCompleto: string
): Promise<number | Error> => {
  try {
    // Criando o objeto com os parâmetros recebidos
    const dados: IDetalheJogo = {
      id,
      data,
      nome,
      dataCompleto,
    };

    console.log("Dados antes de criar o jogo:", dados);

    // Inserir no banco de dados
    const { error } = await supabase
      .from('jogos') // Nome da tabela
      .insert([dados]) // Inserir o objeto completo
      .single();

    // Verificar se ocorreu erro
    if (error) throw new Error(error.message || 'Erro ao criar o registro.');

    return id;
  } catch (error) {
    console.error(error);
    return new Error((error as Error).message || 'Erro ao criar o registro.');
  }
};

const updateById = async (id: number, dados: IDetalheJogo): Promise<void | Error> => {
  if (!id) {
    return new Error('ID inválido para a atualização');
  }

  try {
    const { error } = await supabase
      .from('jogos') // Nome da tabela
      .update(dados)
      .eq('id', id);

    if (error) throw new Error(error.message || 'Erro ao atualizar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as Error).message || 'Erro ao atualizar o registro.');
  }
};

const deleteById = async (id: number): Promise<void | Error> => {
  try {
    const { error } = await supabase
      .from('jogos') // Nome da tabela
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message || 'Erro ao apagar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as Error).message || 'Erro ao apagar o registro.');
  }
};

const getUltimoRegistroJogos = async (tableName: string): Promise<number | Error> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('id') // Seleciona a coluna ID
      .order('id', { ascending: false }) // Ordena pelo ID em ordem decrescente
      .limit(1); // Obtém o maior ID

    if (error) throw new Error(error.message || `Erro ao buscar o último ID na tabela ${tableName}.`);

    // Retorna o próximo ID ou 1 se não houver registros
    return data && data.length > 0 ? data[0].id : 0;
  } catch (error) {
    console.error(error);
    return new Error((error as Error).message || 'Erro ao buscar o último ID.');
  }
};

export const JogosService = {
  getAll,
  create,
  getById,
  updateById,
  deleteById,
  getUltimoRegistroJogos,
};
