/**
 * Componente AuthModal (`AuthModal.tsx`)
 *
 * Modal para autenticação (Login e Cadastro) integrada às rotas `/api/auth/login`
 * e `/api/auth/register` do backend Express 5 com Argon2 + JWT.
 */

import { FormEvent, useState } from 'react';
import { loginApi, registerApi } from '../services/api';
import { AuthResponse } from '../types/product';

interface AuthModalProps {
  /** Controla se o modal está aberto */
  isOpen: boolean;
  /** Callback para fechar o modal */
  onClose: () => void;
  /** Callback executado após autenticação bem-sucedida */
  onSuccess: (auth: AuthResponse) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@produtos.dev');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const response =
        mode === 'login'
          ? await loginApi(email, password)
          : await registerApi(name, email, password);

      onSuccess(response);
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Erro ao realizar autenticação.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {mode === 'login' ? 'Entrar na Conta (JWT)' : 'Criar Nova Conta'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-medium cursor-pointer"
          >
            Fechar
          </button>
        </div>

        <div className="flex rounded-lg bg-slate-100 p-1 mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: João Carlos"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@produtos.dev"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none"
            />
          </div>

          {mode === 'login' && (
            <div className="rounded-lg bg-indigo-50/70 border border-indigo-100 p-2.5 text-xs text-indigo-800">
              Conta de demonstração pré-preenchida:{' '}
              <strong>admin@produtos.dev</strong> / <strong>Admin@123</strong>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading
              ? 'Processando...'
              : mode === 'login'
                ? 'Entrar'
                : 'Cadastrar e Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

