/**
 * Serviço de Comunicação com a API Backend (`api.ts`)
 *
 * Centraliza todas as chamadas HTTP para o servidor Express 5 (`http://localhost:3333`)
 * respeitando o Nível 2 de Maturidade de Richardson (recursos, verbos e status codes)
 * e tratando o contrato de erro `{ error: { message, statusCode, details } }`.
 */

import {
  ApiErrorShape,
  AuthResponse,
  CreateProductPayload,
  Product,
  User,
} from '../types/product';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3333';

/**
 * Dados iniciais estáticos da documentação "Thinking in React", utilizados
 * como fallback caso o usuário visualize o frontend sem o backend ativo.
 */
export const INITIAL_THINKING_IN_REACT_PRODUCTS: Product[] = [
  { id: 1, category: 'Frutas', price: '$1', stocked: true, name: 'Maçã', photoUrl: null },
  { id: 2, category: 'Frutas', price: '$1', stocked: true, name: 'Fruta do dragão', photoUrl: null },
  { id: 3, category: 'Frutas', price: '$2', stocked: false, name: 'Maracujá', photoUrl: null },
  { id: 4, category: 'Vegetais', price: '$2', stocked: true, name: 'Espinafre', photoUrl: null },
  { id: 5, category: 'Vegetais', price: '$4', stocked: false, name: 'Abóbora', photoUrl: null },
  { id: 6, category: 'Vegetais', price: '$1', stocked: true, name: 'Ervilhas', photoUrl: null },
];

/**
 * Função auxiliar que extrai a mensagem de erro padronizada do backend.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const apiErr = data as ApiErrorShape | null;
    if (apiErr?.error?.message) {
      const detailsList = Array.isArray(apiErr.error.details)
        ? apiErr.error.details.map((d) => d.message).join(' ')
        : '';
      throw new Error(
        detailsList ? `${apiErr.error.message} (${detailsList})` : apiErr.error.message,
      );
    }
    throw new Error(`Erro HTTP ${response.status} ao comunicar com o servidor.`);
  }

  return data as T;
}

/**
 * Resolve a URL completa da foto do produto armazenada no backend.
 */
export function resolvePhotoUrl(photoUrl: string | null): string | null {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    return photoUrl;
  }
  return `${API_BASE_URL}${photoUrl}`;
}

/**
 * Busca a lista de produtos na API (`GET /api/products`).
 */
export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  return handleResponse<Product[]>(response);
}

/**
 * Cria um novo produto na API (`POST /api/products`). Requer token JWT.
 */
export async function createProductApi(
  payload: CreateProductPayload,
  token: string,
): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<Product>(response);
}

/**
 * Atualiza um produto existente na API (`PUT /api/products/:id`). Requer token JWT.
 */
export async function updateProductApi(
  id: number,
  payload: Partial<CreateProductPayload>,
  token: string,
): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<Product>(response);
}

/**
 * Envia uma foto para um produto (`POST /api/products/:id/photo`) via Multer (`multipart/form-data`).
 */
export async function uploadProductPhotoApi(
  id: number,
  file: File,
  token: string,
): Promise<Product> {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await fetch(`${API_BASE_URL}/api/products/${id}/photo`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return handleResponse<Product>(response);
}

/**
 * Remove um produto na API (`DELETE /api/products/:id`). Requer token JWT.
 */
export async function deleteProductApi(id: number, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<void>(response);
}

/**
 * Realiza login (`POST /api/auth/login`) e retorna usuário + token JWT.
 */
export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(response);
}

/**
 * Cadastra novo usuário (`POST /api/auth/register`) e retorna usuário + token JWT.
 */
export async function registerApi(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse<AuthResponse>(response);
}

/**
 * Obtém o perfil do usuário autenticado (`GET /api/auth/me`).
 */
export async function fetchMeApi(token: string): Promise<{ user: User }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse<{ user: User }>(response);
}

