/**
 * Función centralizada para subir imágenes a Cloudinary
 * Usa SOLO fetch + FormData contra la API pública (unsigned upload)
 * Sin SDK de Cloudinary, sin constructores rotos
 */

export async function uploadImage(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();

  if (!cloudName) {
    throw new Error('Error: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME no está configurado');
  }

  if (!uploadPreset) {
    throw new Error('Error: NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET no está configurado');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error response:', errorData);
      throw new Error(errorData.error?.message || 'Error al subir imagen a Cloudinary');
    }

    const data = await response.json();

    if (!data.secure_url) {
      throw new Error('No se recibió URL de Cloudinary');
    }

    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    if (error instanceof Error) {
      throw new Error(`Error al subir imagen: ${error.message}`);
    }
    throw new Error('Error desconocido al subir imagen');
  }
}
