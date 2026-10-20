
import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonFab,
  IonFabButton,
  IonIcon,
  IonButton,
  AlertController,
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import { camera, trash } from 'ionicons/icons';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonFab,
    IonFabButton,
    IonIcon,
    IonButton,
  ],
})
export class Tab2Page {
  public photoService = inject(PhotoService);
  private alertController = inject(AlertController);

  constructor() {
    addIcons({ camera, trash });
  }

  async addPhotoToGallery() {
    try {
      await this.photoService.addNewToGallery();
    } catch (error) {
      console.error('Error al tomar la fotografía:', error);

      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo tomar o guardar la fotografía.',
        buttons: ['Aceptar'],
      });

      await alert.present();
    }
  }

  async deletePhoto(filepath: string) {
    const alert = await this.alertController.create({
      header: 'Eliminar fotografía',
      message: '¿Deseas eliminar esta fotografía de la aplicación?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.photoService.deletePhoto(filepath);
            } catch (error) {
              console.error('Error al eliminar la fotografía:', error);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async ionViewWillEnter() {
    await this.photoService.loadSavedPhotos();
  }
}
