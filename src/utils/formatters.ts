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
  
  
  return phone;
};

 
export const formatPhoneForAPI = (phone: string): string => {
  console.log('=== FORMATAGE DU NUMÉRO DE TÉLÉPHONE ===');
  console.log('NUMÉRO ORIGINAL:', phone);
  
  // Nettoyer le numéro (enlever espaces, tirets, parenthèses)
  let cleaned = phone.replace(/[\s\-()]/g, '');
  console.log('NUMÉRO NETTOYÉ (sans espaces/tirets):', cleaned);
  
  // Extraire seulement les chiffres du numéro (sans préfixe)
  let digits = cleaned;
  
  // Si le numéro commence par +225, le supprimer
  if (cleaned.startsWith('+225')) {
    console.log('Le numéro commence par +225, extraction des chiffres');
    digits = cleaned.substring(4);
  } 
  // Si le numéro commence par 225, le supprimer
  else if (cleaned.startsWith('225')) {
    console.log('Le numéro commence par 225, extraction des chiffres');
    digits = cleaned.substring(3);
  }
  
  // S'assurer que le numéro a au moins 10 chiffres
  if (digits.length < 10) {
    console.log('ATTENTION: Numéro de téléphone trop court:', digits);
    // Compléter avec des zéros pour atteindre 10 chiffres
    digits = digits.padEnd(10, '0');
    console.log('NUMÉRO COMPLÉTÉ:', digits);
  }
  
  // Si le numéro est plus long que 10 chiffres, le tronquer
  if (digits.length > 10) {
    console.log('ATTENTION: Numéro de téléphone trop long, troncature à 10 chiffres');
    digits = digits.substring(0, 10);
  }
  
  // Format final: +225 suivi de 10 chiffres exactement
  const formattedNumber = `+225${digits}`;
  console.log('NUMÉRO FINAL FORMATÉ:', formattedNumber);
  console.log('LONGUEUR DU NUMÉRO FINAL:', formattedNumber.length);
  console.log('=== FIN DU FORMATAGE ===');
  
  return formattedNumber;
};
