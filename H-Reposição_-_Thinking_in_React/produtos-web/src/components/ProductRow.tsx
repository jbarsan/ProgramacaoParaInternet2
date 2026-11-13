/**
 * Componente ProductRow (Thinking in React - Nível 5 da Hierarquia)
 *
 * Exibe uma linha para cada produto individual na tabela.
 * Conforme a especificação do guia "Thinking in React":
 * - Caso o produto não esteja em estoque (`!product.stocked`), o nome do produto
 *   é renderizado em vermelho (`text-rose-600`) com um selo indicativo de "Sem estoque".
 * - Exibe também a miniatura da foto enviada via Multer (`product.photoUrl`)
 *   e botões de edição/exclusão caso o usuário esteja autenticado via JWT.
 */

import { resolvePhotoUrl } from '../services/api';
import { Product } from '../types/product';

interface ProductRowProps {
  /** Objeto do produto a ser exibido na linha */
  product: Product;
  /** Indica se há um usuário autenticado para habilitar ações de gestão */
  isAuthenticated: boolean;
  /** Callback disparado ao clicar em "Editar / Foto" */
  onEdit?: (product: Product) => void;
  /** Callback disparado ao clicar em "Excluir" */
  onDelete?: (product: Product) => void;
}

export function ProductRow({
  product,
  isAuthenticated,
  onEdit,
  onDelete,
}: ProductRowProps) {
  const fullPhotoUrl = resolvePhotoUrl(product.photoUrl);

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
      {/* Coluna 1: Foto + Nome do Produto (vermelho se esgotado, conforme Thinking in React) */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {fullPhotoUrl ? (
            <img
              src={fullPhotoUrl}
              alt={product.name}
              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-xs shrink-0"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-500 shrink-0"
              title="Produto sem foto cadastrada"
            >
              {product.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="flex flex-col">
            {product.stocked ? (
              <span className="font-medium text-slate-800">{product.name}</span>
            ) : (
              <span className="font-semibold text-rose-600" title="Fora de estoque">
                {product.name}
              </span>
            )}
            <span className="text-xs text-slate-400">
              {product.stocked ? 'Em estoque' : 'Esgotado'}
            </span>
          </div>
        </div>
      </td>

      {/* Coluna 2: Preço */}
      <td className="py-3 px-4 font-mono font-semibold text-slate-700">
        {product.price}
      </td>

      {/* Coluna 3: Status visual */}
      <td className="py-3 px-4">
        {product.stocked ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            Disponível
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
            Sem estoque
          </span>
        )}
      </td>

      {/* Coluna 4 (opcional): Ações administrativas quando logado */}
      {isAuthenticated && (
        <td className="py-3 px-4 text-right">
          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(product)}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              Editar / Foto
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(product)}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              Excluir
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}

