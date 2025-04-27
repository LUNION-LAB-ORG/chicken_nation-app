/**
 * Utilitaires pour la gestion des images
 */

/**
 * Formate l'URL d'une image pour l'affichage
 * @param imageUrl URL de l'image à formater
 * @returns URL formatée
 */
export const formatImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) return '';
  
  // Si l'URL est déjà complète (commence par http ou https), la retourner telle quelle
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Si l'image est une ressource locale (commence par require ou import)
  if (imageUrl.startsWith('require(') || imageUrl.startsWith('import(')) {
    return imageUrl;
  }
  
  // Sinon, ajouter le préfixe de l'URL de base de l'API
  // Utiliser l'URL du backend
  return `https://chicken.turbodeliveryapp.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};
