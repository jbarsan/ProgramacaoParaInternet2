/**
 * Componente FilterableProductTable (Thinking in React - Nível 1 / Raiz da Hierarquia)
 *
 * Conforme os Passos 3, 4 e 5 do guia "Thinking in React":
 * - É o componente pai comum que detém o estado mínimo de filtro da interface:
 *   `filterText` (texto de busca) e `inStockOnly` (booleano do checkbox).
 * - Além disso, integra-se à API REST Express 5 para buscar, cadastrar, atualizar,
 *   fazer upload de fotos (Multer) e excluir produtos com autenticação JWT.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  API_BASE_URL,
  deleteProductApi,
  fetchMeApi,
  fetchProducts,
  INITIAL_THINKING_IN_REACT_PRODUCTS,
} from '../services/api';
import { AuthResponse, Product, User } from '../types/product';
import { AuthModal } from './AuthModal';
import { ProductFormModal } from './ProductFormModal';
import { ProductTable } from './ProductTable';
import { SearchBar } from './SearchBar';

const TOKEN_STORAGE_KEY = 'produtos_web_jwt_token';

export function FilterableProductTable() {
  // Estados mínimos da UI descritos em "Thinking in React" (Passo 3 e Passo 4)
  const [filterText, setFilterText] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Estados de integração com o Backend Express + SQLite
  const [products, setProducts] = useState<Product[]>(
    INITIAL_THINKING_IN_REACT_PRODUCTS,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [usingFallback, setUsingFallback] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Estados de Autenticação JWT
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY),
  );
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Estados do modal de Criação/Edição/Upload de Foto de Produto
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  /**
   * Carrega a lista de produtos diretamente da API (`GET /api/products`).
   */
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const apiProducts = await fetchProducts();
      setProducts(apiProducts);
      setUsingFallback(false);
    } catch {
      setProducts(INITIAL_THINKING_IN_REACT_PRODUCTS);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  /**
   * Restaura a sessão do usuário caso exista um token JWT salvo no navegador.
   */
  useEffect(() => {
    if (!token) {
      setCurrentUser(null);
      return;
    }

    fetchMeApi(token)
      .then((res) => setCurrentUser(res.user))
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setCurrentUser(null);
      });
  }, [token]);

  const handleAuthSuccess = (auth: AuthResponse) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, auth.token);
    setToken(auth.token);
    setCurrentUser(auth.user);
    setFeedback(`Bem-vindo(a), ${auth.user.name}! Modo de edição habilitado.`);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setCurrentUser(null);
    setFeedback('Sessão encerrada com sucesso.');
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!token) return;
    const confirmed = window.confirm(
      `Deseja realmente remover o produto "${product.name}"?`,
    );
    if (!confirmed) return;

    try {
      await deleteProductApi(product.id, token);
      setFeedback(`Produto "${product.name}" removido com sucesso.`);
      await loadProducts();
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : 'Erro ao excluir o produto.',
      );
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Cabeçalho da Aplicação e Barra de Autenticação */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-xs border border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
            <span>React + TypeScript + TailwindCSS + Express 5</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Produtos Web — Thinking in React
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tabela filtrável de produtos integrada à API RESTful.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={`${API_BASE_URL}/api/docs`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Swagger Docs
          </a>

          {currentUser && token ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                + Novo Produto
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                Sair ({currentUser.name.split(' ')[0]})
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Entrar (JWT)
            </button>
          )}
        </div>
      </header>

      {/* Avisos de status da conexão com a API ou feedback de ações */}
      {usingFallback && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 flex items-center justify-between">
          <span>
            Exibindo dados locais do exemplo <strong>Thinking in React</strong> (servidor backend offline em {API_BASE_URL}).
          </span>
          <button
            type="button"
            onClick={() => void loadProducts()}
            className="font-semibold underline cursor-pointer ml-3"
          >
            Reconectar
          </button>
        </div>
      )}

      {feedback && (
        <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs text-indigo-900 flex items-center justify-between">
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="font-semibold text-indigo-700 hover:underline cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Card Principal de FilterableProductTable */}
      <main className="space-y-5 rounded-2xl bg-white p-6 shadow-xs border border-slate-200">
        {/* Nível 2: SearchBar com estado controlado e fluxo de dados inverso */}
        <SearchBar
          filterText={filterText}
          inStockOnly={inStockOnly}
          onFilterTextChange={setFilterText}
          onInStockOnlyChange={setInStockOnly}
        />

        {/* Nível 3: ProductTable que filtra e agrupa em ProductCategoryRow e ProductRow */}
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Carregando produtos do banco de dados SQLite...
          </div>
        ) : (
          <ProductTable
            products={products}
            filterText={filterText}
            inStockOnly={inStockOnly}
            isAuthenticated={Boolean(currentUser && token)}
            onEditProduct={(product) => {
              setEditingProduct(product);
              setIsProductModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
          />
        )}
      </main>

      {/* Modais de Autenticação e Gestão de Produtos / Upload de Fotos */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {token && (
        <ProductFormModal
          isOpen={isProductModalOpen}
          editingProduct={editingProduct}
          token={token}
          onClose={() => setIsProductModalOpen(false)}
          onSaved={() => {
            setFeedback('Produto salvo com sucesso!');
            void loadProducts();
          }}
        />
      )}
    </div>
  );
}

