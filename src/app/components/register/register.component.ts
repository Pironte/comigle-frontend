import { Component } from '@angular/core';
import { HeaderlogoComponent } from '../header/headerlogo/headerlogo.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationServiceService } from '../../service/authentication/authentication-service.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [HeaderlogoComponent, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm!: FormGroup;

  constructor(private authService: AuthenticationServiceService, private router: Router) {
    this.registerForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required])
    });
  }

  register() {
    if (this.registerForm.valid)
      this.authService.register(this.registerForm.value.username, this.registerForm.value.email, this.registerForm.value.password, this.registerForm.value.confirmPassword).subscribe(
        {
          next: (response) => {
            // Exemplo: tratar a resposta aqui
            console.log('Resposta da API:', response);
            this.router.navigate(['/login']);
          },
          error: (err) => {
            // Tratar erros aqui
            console.error('Erro no cadastro:', err);
          }
        })
  }
}
