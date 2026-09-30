/**
 * Controller de Auth — tradutor HTTP <-> domínio para autenticação.
 */
import type { Request, Response } from "express";
import * as authService from "../services/auth.service";

export async function register(request: Request, response: Response) {
  const user = await authService.register(request.body);
  response.status(201).json(user);
}

export async function login(request: Request, response: Response) {
  const result = await authService.login(request.body);
  response.status(200).json(result);
}

export async function me(request: Request, response: Response) {
  const user = await authService.getMe(request.user!.id);
  response.status(200).json(user);
}
