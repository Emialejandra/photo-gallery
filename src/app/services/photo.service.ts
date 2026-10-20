
import { Injectable, signal } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { Media } from '@capacitor-community/media';

const PHOTOS_KEY = 'saved_photos';
const ALBUM_NAME = 'Photo Gallery';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  public photos = signal<UserPhoto[]>([]);

  private async savePhotoList(photos: UserPhoto[]) {
    const savedPhotos = photos.map(({ webviewPath, ...photo }) => photo);

    await Preferences.set({
      key: PHOTOS_KEY,
      value: JSON.stringify(savedPhotos),
    });
  }

  private async getAlbumIdentifier(): Promise<string> {
    let { albums } = await Media.getAlbums();

    let album;

    if (Capacitor.getPlatform() === 'android') {
      const albumsPath = (await Media.getAlbumsPath()).path;

      album = albums.find(
        (item) =>
          item.name === ALBUM_NAME &&
          item.identifier.startsWith(albumsPath)
      );
    } else {
      album = albums.find((item) => item.name === ALBUM_NAME);
    }

    if (!album) {
      await Media.createAlbum({ name: ALBUM_NAME });

      const result = await Media.getAlbums();
      albums = result.albums;

      if (Capacitor.getPlatform() === 'android') {
        const albumsPath = (await Media.getAlbumsPath()).path;

        album = albums.find(
          (item) =>
            item.name === ALBUM_NAME &&
            item.identifier.startsWith(albumsPath)
        );
      } else {
        album = albums.find((item) => item.name === ALBUM_NAME);
      }
    }

    if (!album) {
      throw new Error('No se pudo crear o encontrar el álbum.');
    }

    return album.identifier;
  }

  public async loadSavedPhotos() {
    const result = await Preferences.get({ key: PHOTOS_KEY });

    if (!result.value) {
      this.photos.set([]);
      return;
    }

    const savedPhotos: UserPhoto[] = JSON.parse(result.value);
    const loadedPhotos: UserPhoto[] = [];

    for (const photo of savedPhotos) {
      try {
        const file = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data,
        });

        if (typeof file.data === 'string') {
          loadedPhotos.push({
            ...photo,
            webviewPath: `data:image/jpeg;base64,${file.data}`,
          });
        }
      } catch (error) {
        console.error('No se pudo cargar la foto:', error);
      }
    }

    this.photos.set(loadedPhotos);
    await this.savePhotoList(loadedPhotos);
  }

  public async addNewToGallery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 90,
    });

    if (!capturedPhoto.base64String) {
      throw new Error('No se pudo obtener la fotografía.');
    }

    const filepath = `photo_${Date.now()}.jpeg`;
    const fileName = filepath.replace(/\.jpeg$/i, '');

    // Guardar la copia privada de la aplicación.
    await Filesystem.writeFile({
      path: filepath,
      data: capturedPhoto.base64String,
      directory: Directory.Data,
    });

    try {
      // Guardar otra copia en la galería multimedia.
      const albumIdentifier = await this.getAlbumIdentifier();

      const savedMedia = await Media.savePhoto({
        path: `data:image/jpeg;base64,${capturedPhoto.base64String}`,
        albumIdentifier,
        fileName,
      });

      if (
        Capacitor.getPlatform() === 'android' &&
        !savedMedia.filePath
      ) {
        throw new Error('No se recibió la ruta de la foto guardada.');
      }

      const newPhoto: UserPhoto = {
        filepath,
        galleryPath: savedMedia.filePath,
        webviewPath:
          `data:image/jpeg;base64,${capturedPhoto.base64String}`,
      };

      const updatedPhotos = [newPhoto, ...this.photos()];

      this.photos.set(updatedPhotos);
      await this.savePhotoList(updatedPhotos);
    } catch (error) {
      // Evitar dejar una copia privada huérfana si falla el guardado
      // en la galería.
      await Filesystem.deleteFile({
        path: filepath,
        directory: Directory.Data,
      }).catch(() => undefined);

      throw error;
    }
  }


  public async deletePhoto(filepath: string) {
    const photo = this.photos().find(
      (item) => item.filepath === filepath
    );

    if (!photo) {
      throw new Error('No se encontró la fotografía.');
    }

    // Eliminar la copia de la galería del teléfono.
    if (photo.galleryPath) {
      await Filesystem.deleteFile({
        path: photo.galleryPath,
      });
    }

    // Eliminar la copia privada de la aplicación.
    try {
      await Filesystem.deleteFile({
        path: photo.filepath,
        directory: Directory.Data,
      });
    } catch (error) {
      console.warn(
        'No se pudo eliminar la copia interna; se actualizará la galería de la aplicación.',
        error
      );
    }

    // Retirar la fotografía de la interfaz.
    const updatedPhotos = this.photos().filter(
      (item) => item.filepath !== filepath
    );

    this.photos.set(updatedPhotos);

    // Guardar la lista actualizada permanentemente.
    await this.savePhotoList(updatedPhotos);
  }

}

export interface UserPhoto {
  filepath: string;
  galleryPath?: string;
  webviewPath?: string;
}
