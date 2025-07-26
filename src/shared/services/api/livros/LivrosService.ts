import { Environment } from '../../../environment';
import { GenericService, OrderType } from '../../GenericService';

export interface IListagemLivro {
  id: number;
  data: string;
  nome: string;
  avaliacao?: number | null;
}

export interface IDetalheLivro {
  id: number;
  data: string;
  nome: string;
  avaliacao?: number | null;
  CodigoUsuario: number | undefined;
}

type TLivrosComTotalCount = {
  data: IListagemLivro[];
  totalCount: number;
}

const getAll = async (
  codigousuario: number | undefined,
  page = 1,
  filter = '',
  pageSize = 25,
  ordem: 'data' | 'alfabetica' | 'avaliacao' = 'data',
  direcao: 'asc' | 'desc' = 'desc'
): Promise<TLivrosComTotalCount | Error> => {
  let order: OrderType | undefined;
  let customSort: ((data: any[], order?: OrderType) => any[]) | undefined;
  if (ordem === 'alfabetica') {
    order = { column: 'nome', direction: direcao };
  } else if (ordem === 'avaliacao') {
    order = { column: 'avaliacao', direction: direcao };
    customSort = (data) => {
      const nulos = (data ?? []).filter((l: IListagemLivro) => l.avaliacao === null || l.avaliacao === undefined);
      const avaliados = (data ?? []).filter((l: IListagemLivro) => l.avaliacao !== null && l.avaliacao !== undefined).slice().sort((a: IListagemLivro, b: IListagemLivro) => {
        const diffAvaliacao = direcao === 'desc'
          ? (b.avaliacao ?? 0) - (a.avaliacao ?? 0)
          : (a.avaliacao ?? 0) - (b.avaliacao ?? 0);
        if (diffAvaliacao !== 0) return diffAvaliacao;
        // desempate: data decrescente
        const dateA = new Date(a.data.split('/').reverse().join('-')).getTime();
        const dateB = new Date(b.data.split('/').reverse().join('-')).getTime();
        return dateB - dateA;
      });
      return direcao === 'asc' ? [...nulos, ...avaliados] : [...avaliados, ...nulos];
    };
  } else if (ordem === 'data') {
    customSort = (data) => {
      return data?.slice().sort((a: IListagemLivro, b: IListagemLivro) => {
        const dateA = new Date(a.data.split('/').reverse().join('-'));
        const dateB = new Date(b.data.split('/').reverse().join('-'));
        return direcao === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
      });
    };
  }
  return await GenericService.getAll<IListagemLivro>({
    table: 'livros',
    page,
    pageSize,
    filter: { column: 'nome', value: filter },
    order,
    customSort,
    extraFilters: { CodigoUsuario: codigousuario },
  });
};


const getById = async (id: number): Promise<IDetalheLivro | Error> => {
  return await GenericService.getById<IDetalheLivro>('livros', id);
};

const create = async (
  id: number,
  data: string,
  nome: string,
  avaliacao: number | null | undefined,
  CodigoUsuario: number | undefined,
): Promise<number | Error> => {
  const dados: IDetalheLivro = {
    id,
    data,
    nome,
    avaliacao,
    CodigoUsuario
  };
  return await GenericService.create<IDetalheLivro>('livros', dados);
};

const updateById = async (id: number, dados: IDetalheLivro): Promise<void | Error> => {
  return await GenericService.updateById<IDetalheLivro>('livros', id, dados);
};

const deleteById = async (id: number): Promise<void | Error> => {
  return await GenericService.deleteById('livros', id);
};

const getUltimoRegistroLivros = async (tableName: string): Promise<number | Error> => {
  return await GenericService.getUltimoRegistro(tableName);
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
