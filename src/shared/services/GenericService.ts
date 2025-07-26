import { createClient } from '@supabase/supabase-js';
import { Environment } from '../environment';

const supabase = createClient(Environment.SUPABASE_URL, Environment.SUPABASE_KEY);

export type OrderType = {
  column: string;
  direction: 'asc' | 'desc';
  secondary?: { column: string; direction: 'asc' | 'desc' };
};

export interface IGenericListResult<T> {
  data: T[];
  totalCount: number;
}

export interface IGenericGetAllParams {
  table: string;
  page?: number;
  pageSize?: number;
  filter?: { column: string; value: string };
  order?: OrderType;
  customSort?: (data: any[], order?: OrderType) => any[];
  extraFilters?: Record<string, any>;
}

export const GenericService = {
  async getAll<T = any>(params: IGenericGetAllParams): Promise<IGenericListResult<T> | Error> {
    try {
      let query = supabase
        .from(params.table)
        .select('*', { count: 'exact' });

      if (params.filter) {
        query = query.ilike(params.filter.column, `%${params.filter.value}%`);
      }
      if (params.extraFilters) {
        Object.entries(params.extraFilters).forEach(([col, val]) => {
          query = query.eq(col, val);
        });
      }
      if (params.order) {
        query = query.order(params.order.column, { ascending: params.order.direction === 'asc' });
        if (params.order.secondary) {
          query = query.order(params.order.secondary.column, { ascending: params.order.secondary.direction === 'asc' });
        }
      }

      const { data, error, count } = await query;
      if (error) throw new Error(error.message || 'Erro ao listar os registros.');

      let sortedData = data;
      if (params.customSort) {
        sortedData = params.customSort(data, params.order);
      }

      // Paginação
      if (params.page && params.pageSize) {
        const offset = (params.page - 1) * params.pageSize;
        sortedData = sortedData?.slice(offset, offset + params.pageSize);
      }

      return {
        data: sortedData as T[],
        totalCount: count || 0,
      };
    } catch (error) {
      console.error(error);
      return new Error((error as Error).message || 'Erro ao listar os registros.');
    }
  },

  async getById<T = any>(table: string, id: number): Promise<T | Error> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw new Error(error.message || 'Erro ao consultar o registro.');
      return data as T;
    } catch (error) {
      console.error(error);
      return new Error((error as Error).message || 'Erro ao consultar o registro.');
    }
  },

  async create<T = any>(table: string, dados: T): Promise<number | Error> {
    try {
      const { error, data } = await supabase
        .from(table)
        .insert([dados])
        .single();
      if (error) throw new Error(error.message || 'Erro ao criar o registro.');
      if (data && typeof data === 'object' && 'id' in data) {
        return (data as { id: number }).id;
      }
      return 0;
    } catch (error) {
      console.error(error);
      return new Error((error as Error).message || 'Erro ao criar o registro.');
    }
  },

  async updateById<T = any>(table: string, id: number, dados: T): Promise<void | Error> {
    if (!id) return new Error('ID inválido para a atualização');
    try {
      const { error } = await supabase
        .from(table)
        .update(dados)
        .eq('id', id);
      if (error) throw new Error(error.message || 'Erro ao atualizar o registro.');
    } catch (error) {
      console.error(error);
      return new Error((error as Error).message || 'Erro ao atualizar o registro.');
    }
  },

  async deleteById(table: string, id: number): Promise<void | Error> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      if (error) throw new Error(error.message || 'Erro ao apagar o registro.');
    } catch (error) {
      console.error(error);
      return new Error((error as Error).message || 'Erro ao apagar o registro.');
    }
  },

  async getUltimoRegistro(table: string): Promise<number | Error> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      if (error) throw new Error(error.message || `Erro ao buscar o último ID na tabela ${table}.`);
      return data && data.length > 0 ? data[0].id : 0;
    } catch (error) {
      console.error(error);
      return new Error((error as Error).message || 'Erro ao buscar o último ID.');
    }
  },
};
