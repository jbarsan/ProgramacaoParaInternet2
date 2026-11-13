/**
 * Componente ProductCategoryRow (Thinking in React - Nível 4 da Hierarquia)
 *
 * Exibe uma linha de cabeçalho para agrupar visualmente os produtos de cada
 * categoria (ex.: "Frutas", "Vegetais") dentro da `ProductTable`.
 * Não possui estado próprio (stateless): recebe apenas a prop `category`.
 */

interface ProductCategoryRowProps {
  /** Nome da categoria a ser exibida como título da seção na tabela */
  category: string;
  /** Número de colunas que a linha deve abranger (depende se o modo admin está ativo) */
  colSpan?: number;
}

export function ProductCategoryRow({
  category,
  colSpan = 3,
}: ProductCategoryRowProps) {
  return (
    <tr className="bg-indigo-50/80 border-y border-indigo-100">
      <th
        colSpan={colSpan}
        className="py-2.5 px-4 text-left text-xs font-bold uppercase tracking-wider text-indigo-900"
      >
        {category}
      </th>
    </tr>
  );
}

