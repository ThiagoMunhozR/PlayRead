// src/shared/utils/carregarImagensItens.ts

/**
 * Remove caracteres especiais do nome do arquivo
 */
export function removerCaracteresEspeciais(nomeArquivo: string) {
  return nomeArquivo
    .replace(/:/g, '')
    .replace(/[/*?"<>|]/g, '');
}

/**
 * Verifica e retorna a capa do item (livro ou jogo)
 */
export async function verificarCapaDoItem(
  nome: string,
  tipo: 'livros' | 'jogos',
  buscarCapa: (nome: string) => Promise<string>
): Promise<string> {
  const imagePath = `/imagens/${tipo}/${removerCaracteresEspeciais(nome)}.jpg`;
  const defaultImagePath = '/imagens/SemImagem.jpg';
  const image = new Image();
  image.src = imagePath;
  return new Promise<string>((resolve) => {
    image.onload = () => resolve(imagePath);
    image.onerror = async () => {
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
    const capa = await verificarCapaDoItem(item.nome, tipo, buscarCapa);
    imagens[item.nome] = capa;
  }
  return imagens;
}
