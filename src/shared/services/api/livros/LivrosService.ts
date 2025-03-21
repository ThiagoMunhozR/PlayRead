import { Environment } from '../../../environment';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(Environment.SUPABASE_URL, Environment.SUPABASE_KEY);

export interface IListagemLivro {
  id: number;
  data: string;
  nome: string;
}

export interface IDetalheLivro {
  id: number;
  data: string;
  nome: string;
  CodigoUsuario: number | undefined;
}

type TLivrosComTotalCount = {
  data: IListagemLivro[];
  totalCount: number;
}

const getAll = async (codigousuario: number | undefined, page = 1, filter = '', pageSize = 25): Promise<TLivrosComTotalCount | Error> => {
  try {
    
    let query = supabase
      .from('livros') // Nome da tabela
      .select('*', { count: 'exact' })
      .ilike('nome', `%${filter}%`)
      .eq('CodigoUsuario', codigousuario)  // Filtro de nome

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
      const offset = (page - 1) * pageSize;
      // Aplica o range apenas sobre os dados já ordenados
      const paginatedData = sortedData?.slice(offset, offset + pageSize);

      return {
        data: paginatedData as IListagemLivro[], // Dados paginados e ordenados
        totalCount: count || 0,
      };
    }

    // Se page for 0, retornar os dados ordenados sem paginação
    return {
      data: sortedData as IListagemLivro[],
      totalCount: count || 0,
    };
  } catch (error) {
    console.error(error);
    return new Error((error as Error).message || 'Erro ao listar os registros.');
  }
};


const getById = async (id: number): Promise<IDetalheLivro | Error> => {
  try {
    const { data, error } = await supabase
      .from('livros') // Nome da tabela
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message || 'Erro ao consultar o registro.');

    return data as IDetalheLivro; // Garantindo que data seja do tipo IDetalheLivro
  } catch (error) {
    console.error(error);
    return new Error((error as Error).message || 'Erro ao consultar o registro.');
  }
};

const create = async (
  id: number,
  data: string,
  nome: string,
  CodigoUsuario: number | undefined,
): Promise<number | Error> => {
  try {
    // Criando o objeto com os parâmetros recebidos
    const dados: IDetalheLivro = {
      id,
      data,
      nome,
      CodigoUsuario
    };

    // Inserir no banco de dados
    const { error } = await supabase
      .from('livros') // Nome da tabela
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

const updateById = async (id: number, dados: IDetalheLivro): Promise<void | Error> => {
  if (!id) {
    return new Error('ID inválido para a atualização');
  }

  try {
    const { error } = await supabase
      .from('livros') // Nome da tabela
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
      .from('livros') // Nome da tabela
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message || 'Erro ao apagar o registro.');
  } catch (error) {
    console.error(error);
    return new Error((error as Error).message || 'Erro ao apagar o registro.');
  }
};

const getUltimoRegistroLivros = async (tableName: string): Promise<number | Error> => {
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

const buscarCapaDoLivro = async (nomeLivro: string): Promise<string> => {
  const imageKey = encodeURIComponent(nomeLivro);
  const cachedImage = localStorage.getItem(imageKey);
  
  if (cachedImage) {
    console.log('Imagem encontrada no cache:', nomeLivro);
    return cachedImage;
  } else {
    try {
      console.log('Precisou fazer API:', nomeLivro);
      const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(nomeLivro)}+CAPA+LIVRO&cx=${Environment.CSE_ID}&searchType=image&key=${Environment.API_KEY}&num=10&imgSize=large`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        
        for (const item of data.items) {
          try {
            if (item.image.height > item.image.width) {             
              const imageUrl = item.link;
              const compressedImage = await compressImage(imageUrl);
              localStorage.setItem(imageKey, compressedImage);
              return compressedImage;
            }
          } catch (error) {
            console.error('Erro ao processar a imagem:', error);
          }
        } 

        throw new Error('Nenhuma imagem retrato encontrada ou erro ao processar todas as imagens');
      } else {
        throw new Error('Nenhuma imagem encontrada');
      } 
    } catch (error) {
      console.error('Erro ao buscar a imagem:', error);
      throw new Error('Erro ao buscar a imagem');
    } 
  }
};

const compressImage = (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; 
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800; 
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.4);
      resolve(dataUrl);
    };

    img.onerror = reject;
    img.src = imageUrl;
  });
};

export const LivrosService = {
  getAll,
  create,
  getById,
  updateById,
  deleteById,
  getUltimoRegistroLivros,
  buscarCapaDoLivro,
};
