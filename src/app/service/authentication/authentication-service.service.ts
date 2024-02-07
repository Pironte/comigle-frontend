import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateUserRequest } from '../../models/register.models';
import { CreateUserResponse } from '../../components/interfaces/register.interface';
import { LoginRequest } from '../../models/login.models';
import { LoginResponse } from '../../components/interfaces/login.interface';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationServiceService {

  private urlEndpoint = 'https://localhost:7260';

  constructor(private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) { }

  /**
   * Cria usuário dentro do sistema
   * @param request request para criação de usuário
   * @returns resposta da criação do usuário
   */
  register(request: CreateUserRequest): Observable<CreateUserResponse> {
    const registerEndpoint = `${this.urlEndpoint}/User/Register`;
    return this.http.post<CreateUserResponse>(registerEndpoint, request);
  }

  /**
   * Loga o usuário no sistema
   * @param request request para logar o usuário
   * @returns resposta com token do usuário
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    const loginEndpoint = `${this.urlEndpoint}/User/Login`;
    return this.http.post<LoginResponse>(loginEndpoint, request);
  }

  /**
   * Desloga o usuário do sistema
   */
  logout(): void {
    const logoutEndpoint = `${this.urlEndpoint}/User/LogOut`;
    console.log(`peguei a url ${logoutEndpoint}`);
    // Obter o token do sessionStorage
    const token = localStorage.getItem('token');
    console.log(`peguei o token ${token}`);

    // Se o token existir, enviar no cabeçalho da solicitação
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.post(logoutEndpoint, {}, { headers: headers }).subscribe(() => {
        // Limpar o sessionStorage após o logout
        localStorage.clear();
        this.router.navigate(['/login']);
      });
    }
  }

  /**
   * Decodifica o token de autenticação do usuário
   * @param token token de autenticação do usuário
   * @returns retorna a desserialização do token em JSON
   */
  decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  /**
   * Recupera o nome do usuário logado da sessionStorage
   * @returns uma string com o nome do usuário logado
   */
  getUserName(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = this.decodeToken(token);
        return decoded ? decoded.username : null;
      }
    }

    return null;
  }
}
