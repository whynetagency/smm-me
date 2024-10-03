import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {AlertController, ToastController} from '@ionic/angular';
import {Router} from '@angular/router';
import {AuthService} from '../../core/services/auth.service';

@Component({
  selector: 'app-restore',
  templateUrl: './restore.page.html',
  styleUrls: ['./restore.page.scss'],
})
export class RestorePage implements OnInit {
  restoreForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.restoreForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  restore() {
    this.auth.resetPw(this.restoreForm.value.email).then(async () => {
      const toast = await this.toastCtrl.create({
        duration: 3000,
        message: 'Success! Check your Emails for more information.'
      });
      await toast.present();
    }, async (err) => {
      const alert = await this.alertCtrl.create({
        header: 'Ошибка!',
        message: err.message,
        buttons: ['OK']
      });
      await alert.present();
    });
  }
}
