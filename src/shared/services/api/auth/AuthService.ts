import { Environment } from '../../../environment';
import { createClient } from '@supabase/supabase-js';
import { GenericService } from '../../GenericService';

const supabase = createClient(Environment.SUPABASE_URL, Environment.SUPABASE_KEY);

// Interface do usuário com as informações adicionais
interface IUsuario {
    CodigoUsuario: number;
    Gamertag: string;
    FotoURL: string;
    Nome: string;
    Email: string;
    Xuid: string;
}

interface IUsuarioEdit {
    Gamertag: string;
    Nome: string;
}

interface IAuth {
    accessToken: string;
    user: IUsuario;
}

const updateById = async (id: number, dados: IUsuarioEdit): Promise<void | Error> => {
    return await GenericService.updateById<IUsuarioEdit>('usuarios', id, dados, 'CodigoUsuario');
};

const getById = async (id: number): Promise<IUsuarioEdit | Error> => {
    return await GenericService.getById<IUsuarioEdit>('usuarios', id, 'CodigoUsuario');
};


const auth = async (email: string, password: string): Promise<IAuth | Error> => {
    try {
        // Realiza login com email e senha
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (loginError) {
            throw new Error(loginError.message);
        }

        if (!loginData || !loginData.user) {
            throw new Error('Erro ao realizar login ou recuperar informações do usuário.');
        }

        // Busca os dados do usuário na tabela 'usuarios'
        const { data: usuarioData, error: fetchError } = await supabase
            .from('usuarios') // Nome da tabela
            .select('CodigoUsuario, Gamertag, FotoURL, Nome, Email, Xuid')
            .eq('Email', email) // Condição para buscar o usuário correto
            .maybeSingle(); // Espera que haja um único registro com esse email

        if (fetchError) {
            throw new Error(`Erro ao buscar dados do usuário: ${fetchError.message}`);
        }

        if (!usuarioData) {
            throw new Error('Usuário não encontrado na tabela "usuarios".');
        }

        // Retorna o token e os dados do usuário
        return {
            accessToken: loginData.session?.access_token || '',
            user: usuarioData,
        };
    } catch (error) {
        console.error('Erro na autenticação:', error);
        return new Error(
            error instanceof Error ? error.message : 'Erro inesperado durante o processo de autenticação.'
        );
    }
};

const loginWithSupabaseUser = async (user: any): Promise<IUsuario | Error> => {
    try {
        if (!user?.email) {
            throw new Error('Usuário do Supabase sem e-mail.');
        }
        const { data: usuarioData, error: fetchError } = await supabase
            .from('usuarios')
            .select('CodigoUsuario, Gamertag, FotoURL, Nome, Email, Xuid')
            .eq('Email', user.email)
            .maybeSingle();
        if (fetchError) {
            throw new Error(`Erro ao buscar dados do usuário: ${fetchError.message}`);
        }
        if (!usuarioData) {
            throw new Error('Usuário não encontrado na tabela "usuarios".');
        }
        return usuarioData;
    } catch (error) {
        console.error('Erro no loginWithSupabaseUser:', error);
        return new Error(
            error instanceof Error ? error.message : 'Erro inesperado ao buscar dados do usuário.'
        );
    }
};


export const AuthService = {
    auth,
    updateById,
    getById,
    loginWithSupabaseUser,
};
