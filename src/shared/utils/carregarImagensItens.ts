// src/shared/utils/carregarImagensItens.ts

/**
 * Remove caracteres especiais do nome do arquivo
 */
export function removerCaracteresEspeciais(nomeArquivo: string) {
  return nomeArquivo
    .replace(/:/g, '')
    .replace(/[/*?"<>|]/g, '')
    .replace(/[®]/g, '')
    .replace(/[™]/g, '')
    .replace(/[’]/g, "'")
    .trim();
}

/**
 * Verifica e retorna a capa do item (livro ou jogo)
 */
export async function verificarCapaDoItem(
  nome: string,
  tipo: 'livros' | 'jogos',
  buscarCapa: (nome: string) => Promise<string>,
  titleId?: string
): Promise<string> {
  // 1️⃣ Primeiro: Verifica se tem arquivo local
  const imagePath = `/imagens/${tipo}/${removerCaracteresEspeciais(nome)}.jpg`;
  const image = new Image();
  image.src = imagePath;

  return new Promise<string>((resolve) => {
    image.onload = () => resolve(imagePath);
    image.onerror = async () => {

      // 2️⃣ Segundo: Verifica se tem URL oficial do Xbox Live (titleHistory)
      if (tipo === 'jogos') {
        try {
          const userStr = localStorage.getItem('APP_USER') || localStorage.getItem('user');
          const user = userStr ? JSON.parse(userStr) : null;

          if (user?.Xuid) {
            const titleHistoryStr = localStorage.getItem(`titleHistory_${user.Xuid}`);
            if (titleHistoryStr) {
              const titleHistory = JSON.parse(titleHistoryStr);
              if (titleHistory.content && Array.isArray(titleHistory.content.titles)) {
                // Busca por nome primeiro
                let found = titleHistory.content.titles.find((t: any) => t.name?.toLowerCase() === nome.toLowerCase());

                // Se não achou por nome, busca por titleId
                if (!found && titleId) {
                  found = titleHistory.content.titles.find((t: any) => t.titleId === titleId);
                }

                if (found?.displayImage) {
                  console.log('🎮 Usando imagem oficial Xbox Live:', found.displayImage);
                  resolve(found.displayImage);
                  return;
                }
              }
            }
          }
        } catch (e) {
          console.error('Erro ao buscar imagem Xbox Live:', e);
        }
      }

      // 3️⃣ Terceiro: Verifica cache de imagem já buscada
      const imageKey = encodeURIComponent(nome);
      const cachedImage = localStorage.getItem(imageKey);
      if (cachedImage) {
        console.log('📸 Imagem encontrada no cache Google:', nome);
        resolve(cachedImage);
        return;
      }

      // 4️⃣ Quarto: Busca foto via API e salva em cache
      try {
        console.log('🔍 Buscando via API Google:', nome);
        const imageUrl = await buscarCapa(nome);
        resolve(imageUrl);
      } catch {
        resolve('/imagens/SemImagem.jpg');
      }
    };
  });
}

/**
 * Carrega as imagens dos itens (livros ou jogos)
 */
export async function carregarImagensItens(
  itens: any[],
  tipo: 'livros' | 'jogos',
  buscarCapa: (nome: string) => Promise<string>
): Promise<{ [key: string]: string }> {
  const imagens: { [key: string]: string } = {};
  for (const item of itens) {
    const capa = await verificarCapaDoItem(item.nome, tipo, buscarCapa, tipo === 'jogos' ? item.titleId : undefined);
    imagens[item.nome] = capa;
  }
  return imagens;
}
