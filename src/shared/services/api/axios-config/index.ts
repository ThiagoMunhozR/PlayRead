import { createClient } from '@supabase/supabase-js';
import { Environment } from '../../../environment';

// Configuração do cliente do Supabase
const supabase = createClient(Environment.SUPABASE_URL, Environment.SUPABASE_KEY);

// Função para interceptar a resposta (se necessário)
const responseInterceptor = (response: any) => {
  // Aqui você pode implementar o que deseja fazer com a resposta antes de retornar
  return response;
};

// Função para interceptar o erro (se necessário)
const errorInterceptor = (error: any) => {
  // Aqui você pode processar o erro
  return Promise.reject(error);
};

// Aqui, ao invés de interceptar a resposta do axios, você faz diretamente com o Supabase
const customApiRequest = async (query: any) => {
  try {
    const { data, error } = await query;

    if (error) {
      errorInterceptor(error);
      throw error;
    }

    return responseInterceptor(data);
  } catch (error) {
    errorInterceptor(error);
    throw error;
  }
};

export { supabase, customApiRequest };
