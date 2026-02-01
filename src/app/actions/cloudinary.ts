// ESTE ARCHIVO ESTÁ OBSOLETO Y YA NO SE UTILIZA.
// La eliminación de imágenes se ha desactivado para evitar la necesidad
// de usar claves secretas (api_secret) en el backend.
// La subida de imágenes ahora se realiza de forma segura y "sin firma"
// directamente desde el navegador del cliente.
// Las imágenes antiguas permanecerán en Cloudinary si se reemplazan o eliminan.

export async function deleteImageFromCloudinary(publicId: string): Promise<{ success: boolean; error?: string }> {
  console.warn("deleteImageFromCloudinary ya no está activo para evitar el uso de api_secret. La imagen no fue eliminada de Cloudinary.");
  return { success: true };
}
