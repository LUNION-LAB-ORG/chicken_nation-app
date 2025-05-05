/**
 * Formate un numéro de téléphone pour l'affichage
 * @param phone Le numéro de téléphone à formater
 * @returns Le numéro de téléphone formaté
 */
export const formatPhoneNumber = (phone: string): string => {
  // Nettoyer le numéro (enlever espaces, tirets, parenthèses)
  let cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Si le numéro commence par +225, l'enlever pour l'affichage
  if (cleaned.startsWith('+225')) {
    cleaned = cleaned.substring(4);
  } else if (cleaned.startsWith('225')) {
    cleaned = cleaned.substring(3);
  }
  
  // Formater le numéro pour l'affichage (XX XX XX XX XX)
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  } else if (cleaned.length === 8) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  }
  
  // Si le format ne correspond pas, retourner tel quel
  return phone;
};

/**
 * Formate un numéro de téléphone pour l'API
 * @param phone Le numéro de téléphone à formater
 * @returns Le numéro de téléphone formaté pour l'API
 */
export const formatPhoneForAPI = (phone: string): string => {
  // Nettoyer le numéro (enlever espaces, tirets, parenthèses)
  let cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Si le numéro ne commence pas par +225, l'ajouter
  if (!cleaned.startsWith('+225')) {
    // Si le numéro commence par 225 sans +, ajouter le +
    if (cleaned.startsWith('225')) {
      cleaned = `+${cleaned}`;
    } else {
      // Sinon, ajouter +225
      cleaned = `+225${cleaned}`;
    }
  }
  
  return cleaned;
};
