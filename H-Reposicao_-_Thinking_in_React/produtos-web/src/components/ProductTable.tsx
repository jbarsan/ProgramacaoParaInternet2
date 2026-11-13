/**
 * Componente ProductTable (Thinking in React - Nível 3 da Hierarquia)
 *
 * Filtra a coleção de produtos de acordo com o texto digitado (`filterText`)
 * e a flag de estoque (`inStockOnly`), agrupando os itens por categoria e
 * renderizando `ProductCategoryRow` + `ProductRow`.
 *
 * Observação importante do guia "Thinking in React":
 * A lista filtrada NÃO é um estado (state), pois é integralmente calculada
 * (derivada) a partir da lista `products`, de `filterText` e de `inStockOnly`
 * durante a renderização.
 */

import { ReactNode } from 'react';
import { Product } from '../types/product';
import { ProductCategoryRow } from './ProductCategoryRow';
import { ProductRow } from './ProductRow';

interface ProductTableProps {
  /** Lista completa de produtos vinda do backend */
  products: Product[];
  /** Texto atual de busca digitado pelo usuário na SearchBar */
  filterText: string;
  /** Flag booleana que filtra apenas produtos com `stocked === true` */
  inStockOnly: boolean;
  /** Indica se o usuário está autenticado via JWT */
  isAuthenticated: boolean;
  /** Callback para abrir edição/upload de foto de um produto */
  onEditProduct?: (product: Product) => void;
  /** Callback para remover um produto */
  onDeleteProduct?: (product: Product) => void;
}

export function ProductTable({
  products,
  filterText,
  inStockOnly,
  isAuthenticated,
  onEditProduct,
  onDeleteProduct,
}: ProductTableProps) {
  const rows: ReactNode[] = [];
  let lastCategory: string | null = null;

  // Ordena por categoria para garantir que todos os produtos da mesma categoria fiquem agrupados
  const sortedProducts = [...products].sort((a, b) =>
    a.category.localeCompare(b.category, 'pt-BR'),
  );

  const normalizedFilter = filterText.trim().toLowerCase();
  const totalCols = isAuthenticated ? 4 : 3;

  sortedProducts.forEach((product) => {
    // 1. Filtra pelo texto de busca (case-insensitive)
    if (
      normalizedFilter !== '' &&
      product.name.toLowerCase().indexOf(normalizedFilter) === -1 &&
      product.category.toLowerCase().indexOf(normalizedFilter) === -1
    ) {
      return;
    }

    // 2. Filtra apenas produtos em estoque caso o checkbox esteja marcado
    if (inStockOnly && !product.stocked) {
      return;
    }

    // 3. Insere um cabeçalho de categoria sempre que a categoria mudar
    if (product.category !== lastCategory) {
      rows.push(
        <ProductCategoryRow
          category={product.category}
          key={`cat-${product.category}`}
          colSpan={totalCols}
        />,
      );
    }

    // 4. Insere a linha do produto
    rows.push(
      <ProductRow
        product={product}
        key={product.id}
        isAuthenticated={isAuthenticated}
        onEdit={onEditProduct}
        onDelete={onDeleteProduct}
      />,
    );

    lastCategory = product.category;
  });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
          <tr>
            <th className="py-3 px-4 font-semibold">Nome</th>
            <th className="py-3 px-4 font-semibold">Preço</th>
            <th className="py-3 px-4 font-semibold">Estoque</th>
            {isAuthenticated && (
              <th className="py-3 px-4 font-semibold text-right">Ações</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td
                colSpan={totalCols}
                className="py-8 px-4 text-center text-slate-500"
              >
                Nenhum produto encontrado para os filtros aplicados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

