/**
 * Utilitaires pour les calculs de prix et de réductions
 */

/**
 * Calcule le pourcentage de réduction entre un prix original et un prix réduit
 * @param originalPrice Prix original
 * @param discountedPrice Prix réduit
 * @returns Pourcentage de réduction arrondi à l'entier le plus proche
 */
export const calculateDiscountPercentage = (originalPrice: number, discountedPrice: number): number => {
  if (!originalPrice || !discountedPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

/**
 * Calcule le prix réduit à partir d'un prix original et d'un pourcentage de réduction
 * @param originalPrice Prix original (format: "1000 FCFA" ou 1000)
 * @param discountPercentage Pourcentage de réduction
 * @returns Prix réduit formaté (ex: "900 FCFA")
 */
export const calculateDiscountedPrice = (originalPrice: string | number, discountPercentage: number): string => {
  const price = typeof originalPrice === 'string' 
    ? parseFloat(originalPrice.replace(/[^\d.-]/g, ""))
    : originalPrice;
    
  if (isNaN(price)) return typeof originalPrice === 'string' ? originalPrice : `${originalPrice} FCFA`;
  
  const discountedPrice = price - (price * discountPercentage) / 100;
  return `${Math.round(discountedPrice)} FCFA`;
};

/**
 * Formate un prix avec séparateur de milliers
 * @param price Prix à formater
 * @returns Prix formaté avec séparateur de milliers (ex: "1.000 FCFA")
 */
export const formatPrice = (price: number): string => {
  return `${Math.round(price).toLocaleString().replace(/,/g, ".")} FCFA`;
};

/**
 * Extrait un nombre d'une chaîne de caractères contenant un prix
 * @param priceString Chaîne contenant un prix (ex: "1000 FCFA")
 * @returns Nombre extrait ou 0 si non valide
 */
export const extractPriceNumber = (priceString: string): number => {
  const price = parseFloat(priceString.replace(/[^\d.-]/g, ""));
  return isNaN(price) ? 0 : price;
};

/**
 * Calcule le prix total avec les suppléments
 * @param basePrice Prix de base
 * @param supplementsPrice Prix des suppléments
 * @param quantity Quantité
 * @returns Prix total formaté
 */
export const calculateTotalPrice = (
  basePrice: number, 
  supplementsPrice: number, 
  quantity: number
): string => {
  const total = (basePrice + supplementsPrice) * quantity;
  return formatPrice(total);
};

export default {
  calculateDiscountPercentage,
  calculateDiscountedPrice,
  formatPrice,
  extractPriceNumber,
  calculateTotalPrice
};
