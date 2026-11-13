/**
 * Componente ProductFormModal (`ProductFormModal.tsx`)
 *
 * Modal para criar ou editar um produto na API REST e enviar foto segura
 * via Multer (`POST /api/products/:id/photo`).
 */

import { FormEvent, useEffect, useState } from 'react';
import {
  createProductApi,
  updateProductApi,
  uploadProductPhotoApi,
} from '../services/api';
import { Product } from '../types/product';

interface ProductFormModalProps {
  /** Controla a abertura do modal */
  isOpen: boolean;
  /** Produto em edição (ou null caso seja criação de novo produto) */
  editingProduct: Product | null;
  /** Token JWT do usuário autenticado */
  token: string;
  /** Callback para fechar o modal */
  onClose: () => void;
  /** Callback disparado após salvar/atualizar o produto no backend */
  onSaved: () => void;
}

export function ProductFormModal({
  isOpen,
  editingProduct,
  token,
  onClose,
  onSaved,
}: ProductFormModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Frutas');
  const [price, setPrice] = useState('$1');
  const [stocked, setStocked] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setCategory(editingProduct.category);
      setPrice(editingProduct.price);
      setStocked(editingProduct.stocked);
    } else {
      setName('');
      setCategory('Frutas');
      setPrice('$1');
      setStocked(true);
    }
    setPhotoFile(null);
    setErrorMessage(null);
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      let savedProduct: Product;
      if (editingProduct) {
        savedProduct = await updateProductApi(
          editingProduct.id,
          { name, category, price, stocked },
          token,
        );
      } else {
        savedProduct = await createProductApi(
          { name, category, price, stocked },
          token,
        );
      }

      // Caso um arquivo de imagem tenha sido selecionado, envia via Multer
      if (photoFile) {
        await uploadProductPhotoApi(savedProduct.id, photoFile, token);
      }

      onSaved();
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Erro ao salvar o produto.',
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
            {editingProduct ? `Editar: ${editingProduct.name}` : 'Novo Produto'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-medium cursor-pointer"
          >
            Fechar
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nome do Produto
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Manga"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Categoria
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex.: Frutas ou Vegetais"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Preço
              </label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex.: $2"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-1">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={stocked}
                onChange={(e) => setStocked(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              <span>Produto disponível em estoque</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Foto do Produto (Multer — JPG, PNG ou WEBP até 2MB)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              className="w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
