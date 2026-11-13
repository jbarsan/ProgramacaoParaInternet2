/**
 * Componente SearchBar (Thinking in React - Nível 2 da Hierarquia)
 *
 * Recebe a entrada do usuário para filtrar a tabela de produtos.
 * Segue os passos 4 e 5 do guia "Thinking in React":
 * - O estado (`filterText` e `inStockOnly`) vive no componente pai comum
 *   (`FilterableProductTable`) e é passado via props.
 * - O fluxo de dados inverso é implementado através dos callbacks
 *   `onFilterTextChange` e `onInStockOnlyChange`.
 */

interface SearchBarProps {
  /** Valor atual do campo de busca por texto */
  filterText: string;
  /** Estado atual da caixa de seleção "Mostrar apenas produtos em estoque" */
  inStockOnly: boolean;
  /** Função chamada sempre que o usuário digita no campo de busca (fluxo inverso) */
  onFilterTextChange: (newText: string) => void;
  /** Função chamada sempre que o usuário alterna o checkbox (fluxo inverso) */
  onInStockOnlyChange: (checked: boolean) => void;
}

export function SearchBar({
  filterText,
  inStockOnly,
  onFilterTextChange,
  onInStockOnlyChange,
}: SearchBarProps) {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200"
    >
      <div className="flex-1">
        <label htmlFor="product-search" className="sr-only">
          Buscar produto
        </label>
        <input
          id="product-search"
          type="text"
          value={filterText}
          placeholder="Buscar por nome ou categoria (ex.: Maçã, Frutas)..."
          onChange={(e) => onFilterTextChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
        />
      </div>

      <label className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-700 select-none cursor-pointer">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => onInStockOnlyChange(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
        />
        <span>Mostrar apenas produtos em estoque</span>
      </label>
    </form>
  );
}

