# Photo Gallery 📸

Aplicación móvil desarrollada con **Ionic, Angular y Capacitor** que permite tomar fotografías con la cámara del teléfono, guardarlas en la galería del dispositivo y administrarlas desde la aplicación.

##  Funcionalidades

-  **Tomar fotografías:** permite utilizar la cámara del dispositivo para capturar imágenes.
-  **Visualizar fotografías:** muestra las fotografías guardadas en la aplicación.
-  **Guardar en la galería:** permite guardar las imágenes en la galería del teléfono.
-  **Eliminar fotografías:** permite eliminar fotografías desde la aplicación.
-  **Aplicación móvil:** utiliza Capacitor para acceder a las funciones nativas del dispositivo.

## Tecnologías utilizadas

- Ionic
- Angular
- TypeScript
- Capacitor
- `@capacitor/camera`
- `@capacitor/filesystem`
- `@capacitor-community/media`

## Requisitos previos

Para ejecutar el proyecto necesitas tener instalado:

- Node.js y npm.
- Ionic CLI.
- Android Studio, si deseas ejecutar la aplicación en Android.
- Un teléfono Android o un emulador para probar las funciones de la cámara y la galería.

## Instalación y ejecución

1. Clona el repositorio:

   ```bash
   git clone https://github.com/Emialejandra/photo-gallery.git
   ```

2. Ingresa a la carpeta del proyecto:

   ```bash
   cd photo-gallery
   ```

3. Instala las dependencias:

   ```bash
   npm install
   ```

4. Ejecuta la aplicación en el navegador para revisar la interfaz:

   ```bash
   ionic serve
   ```

**Nota:** las funciones nativas de cámara y galería deben comprobarse en un dispositivo compatible o emulador Android; el navegador no reproduce necesariamente todas las funciones del teléfono.

## Ejecución en Android

Para preparar el proyecto para Android:

```bash
ionic build
npx cap sync android
npx cap open android
```

Después, ejecuta la aplicación desde Android Studio en un dispositivo o emulador compatible.

## Evidencia del funcionamiento de la app 

