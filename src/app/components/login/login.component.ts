import { Component } from '@angular/core';
import { HeaderlogoComponent } from '../header/headerlogo/headerlogo.component';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../service/message/message.service';
import { MessageType } from '../enums/level.enum';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthenticationServiceService } from '../../service/authentication/authentication-service.service';
import { LoginRequest } from '../../models/login.models';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HeaderlogoComponent, CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm!: FormGroup;

  constructor(private authService: AuthenticationServiceService, public messageService: MessageService, private router: Router) {
    // Inicialização do formulário, aqui ficam as validações
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  /**
   * Método que chama o login do serviço de autenticação, tem tratamento para erros
   */
  login() {
    if (this.loginForm.valid) {
      const request = new LoginRequest(this.loginForm.value.username, this.loginForm.value.password);

      this.authService.login(request).subscribe(
        {
          next: (response) => {
            // Exemplo: tratar a resposta aqui
            if (!response.success) {
              this.messageService.setMessage("Usuário/Senha incorretos", MessageType.Error);
            } else {
              localStorage.setItem("token", response.token);
              this.router.navigate(['/home']);
            }
          },
          error: (err) => {
            // Tratar erros aqui
            this.messageService.setMessage("Falha geral ao cadastrar usuário", MessageType.Error);
          }
        })
    }
  }

  // Get dinâmico das classes que serão exibidas em caso de : sucesso, erro, warning e info
  get messageClass() {
    if (this.messageService.messageSource().type == MessageType.None) return '';

    switch (this.messageService.messageSource().type) {
      case MessageType.Success:
        return 'alert-success';
      case MessageType.Error:
        return 'alert-danger';
      case MessageType.Warning:
        return 'alert-warning';
      case MessageType.Info:
        return 'alert-info';
      default:
        return '';
    }
  }

  //gets dos campos do formulário, utilizados para checar as validações no html
  get username() {
    return this.loginForm.get('username')!;
  }

  get password() {
    return this.loginForm.get('password');
  }
}
