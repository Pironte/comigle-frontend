import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderlogoComponent } from '../header/headerlogo/headerlogo.component';
import { MessageService } from '../../service/message/message.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ResetPasswordRequest } from '../../models/reset-password.models';
import { AuthenticationServiceService } from '../../service/authentication/authentication-service.service';
import { MessageType } from '../enums/level.enum';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [HeaderlogoComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  userId!: string;
  token!: string;

  constructor(private route: ActivatedRoute, public messageService: MessageService, private authService: AuthenticationServiceService, private router: Router) {
    this.resetPasswordForm = new FormGroup({
      newPassword: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'];
      this.token = params['token'];

      console.log(`peguei o userid ${this.userId} e token: ${this.token}`);
    });
  }

  get newPassword() {
    return this.resetPasswordForm.get('newPassword')!;
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword')!;
  }

  onResetPassword() {
    var request = new ResetPasswordRequest(this.userId, this.token, this.resetPasswordForm.value.newPassword, this.resetPasswordForm.value.confirmPassword);
    this.authService.resetPassword(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.setMessage("Senha alterada com sucesso!", MessageType.Success, 4000);
          this.router.navigate(['/login']);
        }
        else {
          this.messageService.setMessage(response.message, MessageType.Error, 4000);
        }
      },
      error: (err) => {
        this.messageService.setMessage("Falha geral ao alterar a senha!", MessageType.Error, 4000);
      }
    });
  }
}
