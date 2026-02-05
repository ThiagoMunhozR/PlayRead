import { Environment } from '../../../environment';
import { GenericService, OrderType } from '../../GenericService';

export interface IListagemJogo {
  id: number;
  data: string;
  nome: string;
  titleId: string | null;
  dataCompleto: string;
  avaliacao: number;
}

export interface IDetalheJogo {
  id: number;
  data: string;
  nome: string;
  titleId: string | null;
  dataCompleto: string;
  avaliacao: number;
  CodigoUsuario: number | undefined;
}

export type TJogosComTotalCount = {
  data: IListagemJogo[];
  totalCount: number;
}

const getAll = async (
  codigousuario: number | undefined,
  page = 1,
  filter = '',
  pageSize = 25,
  ordem: 'data' | 'alfabetica' | 'avaliacao' = 'data',
  direcao: 'asc' | 'desc' = 'desc'
): Promise<TJogosComTotalCount | Error> => {
  // Define ordenação principal e secundária
  let order: OrderType | undefined;
  let customSort: ((data: any[], order?: OrderType) => any[]) | undefined;
  if (ordem === 'alfabetica') {
    order = { column: 'nome', direction: direcao };
  } else if (ordem === 'avaliacao') {
    order = { column: 'avaliacao', direction: direcao };
    customSort = (data) => {
      const nulos = (data ?? []).filter((j: IListagemJogo) => j.avaliacao === null);
      const avaliados = (data ?? []).filter((j: IListagemJogo) => j.avaliacao !== null).slice().sort((a: IListagemJogo, b: IListagemJogo) => {
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
      return data?.slice().sort((a: IListagemJogo, b: IListagemJogo) => {
        const dateA = new Date(a.data.split('/').reverse().join('-'));
        const dateB = new Date(b.data.split('/').reverse().join('-'));
        return direcao === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
      });
    };
  }

  return await GenericService.getAll<IListagemJogo>({
    table: 'jogos',
    page,
    pageSize,
    filter: { column: 'nome', value: filter },
    order,
    customSort,
    extraFilters: { CodigoUsuario: codigousuario },
  });
};


const getById = async (id: number): Promise<IDetalheJogo | Error> => {
  return await GenericService.getById<IDetalheJogo>('jogos', id);
};

const create = async (
  id: number,
  data: string,
  nome: string,
  titleId: string | null,
  dataCompleto: string,
  avaliacao: number,
  CodigoUsuario: number | undefined,
): Promise<number | Error> => {
  const dados: IDetalheJogo = {
    id,
    data,
    nome,
    titleId,
    dataCompleto,
    CodigoUsuario,
    avaliacao
  };
  return await GenericService.create<IDetalheJogo>('jogos', dados);
};

const updateById = async (id: number, dados: IDetalheJogo): Promise<void | Error> => {
  return await GenericService.updateById<IDetalheJogo>('jogos', id, dados);
};

const deleteById = async (id: number): Promise<void | Error> => {
  return await GenericService.deleteById('jogos', id);
};

const getUltimoRegistroJogos = async (tableName: string): Promise<number | Error> => {
  return await GenericService.getUltimoRegistro(tableName);
};

const buscarCapaDoJogo = async (nomeJogo: string): Promise<string> => {
  const imageKey = encodeURIComponent(nomeJogo);
  const cachedImage = localStorage.getItem(imageKey);

  if (cachedImage) {
    console.log('Imagem encontrada no cache:', nomeJogo);
    return cachedImage;
  } else {
    try {
      console.log('Precisou fazer API:', nomeJogo);
      const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(nomeJogo)}+GAME+COVER+ART&cx=${Environment.CSE_ID}&searchType=image&key=${Environment.API_KEY}&num=10&imgSize=large`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        // 1. Tenta imagens retrato (height > width)
        for (const item of data.items) {
          try {
            if (item.image.height > item.image.width) {
              const imageUrl = item.link;
              const compressedImage = await compressImage(imageUrl);
              localStorage.setItem(imageKey, compressedImage);
              return compressedImage;
            }
          } catch (error) {
            console.error('Erro ao processar a imagem (retrato):', error);
          }
        }
        // 2. Tenta imagens quase quadradas (width/height entre 0.8 e 1.0)
        for (const item of data.items) {
          try {
            const w = item.image.width;
            const h = item.image.height;
            if (w && h && w / h >= 0.8 && w / h <= 1.0) {
              const imageUrl = item.link;
              const compressedImage = await compressImage(imageUrl);
              localStorage.setItem(imageKey, compressedImage);
              return compressedImage;
            }
          } catch (error) {
            console.error('Erro ao processar a imagem (quase quadrada):', error);
          }
        }
        // 3. Tenta todas as imagens (sem filtro)
        for (const item of data.items) {
          try {
            const imageUrl = item.link;
            const compressedImage = await compressImage(imageUrl);
            localStorage.setItem(imageKey, compressedImage);
            return compressedImage;
          } catch (error) {
            console.error('Erro ao processar a imagem (qualquer):', error);
          }
        }
        throw new Error('Nenhuma imagem pôde ser processada');
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

const getTitleHistoryByXuid = async (xuid: string) => {
  console.log('🎮 Buscando histórico Xbox via Edge Function...');

  try {
    // Usa sua própria Edge Function (bypassa CORS)
    const response = await fetch(`/api/xbox-proxy?xuid=${xuid}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(errorData.error || `Erro: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Dados Xbox recebidos via Edge Function!');

    return data;

  } catch (error) {
    console.error('❌ Erro Xbox Edge Function:', error);
    throw error;
  }
};



export const JogosService = {
  getAll,
  create,
  getById,
  updateById,
  deleteById,
  getUltimoRegistroJogos,
  buscarCapaDoJogo,
  getTitleHistoryByXuid,
};
