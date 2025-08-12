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
  const imagePath = `/imagens/${tipo}/${removerCaracteresEspeciais(nome)}.jpg`;
  const defaultImagePath = '/imagens/SemImagem.jpg';
  const image = new Image();
  image.src = imagePath;
  return new Promise<string>((resolve) => {
    image.onload = () => resolve(imagePath);
    image.onerror = async () => {
      // Tenta buscar displayImage do titleHistory salvo no localStorage
      let displayImage: string | undefined = undefined;
      try {
        const userStr = localStorage.getItem('APP_USER') || localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (user?.Xuid) {
          const titleHistoryStr = localStorage.getItem(`titleHistory_${user.Xuid}`);
          if (titleHistoryStr) {
            const titleHistory = JSON.parse(titleHistoryStr);
            if (Array.isArray(titleHistory.titles)) {
              let found = titleHistory.titles.find((t: any) => t.name?.toLowerCase() === nome.toLowerCase());
              if (!found && titleId) {
                found = titleHistory.titles.find((t: any) => t.titleId === titleId);
              }
              if (found?.displayImage) {
                displayImage = found.displayImage;
              }
            }
          }
        }
      } catch (e) {
        // ignora erro de parse/localStorage
      }
      if (displayImage) {
        console.log('Capa encontrada no titleHistory:', displayImage);
        resolve(displayImage);
        return;
      }
      try {
        const imageUrl = await buscarCapa(nome);
        resolve(imageUrl);
      } catch {
        resolve(defaultImagePath);
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
