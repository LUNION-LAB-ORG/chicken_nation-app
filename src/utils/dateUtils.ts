/**
 * Utilitaires pour le formatage des dates
 */

/**
 * Formate une date au format JJ/MM/AAAA comme attendu par l'API
 * @param date Date à formater
 * @returns Date formatée en chaîne de caractères
 */
export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Vérifier si la date est valide
  if (isNaN(dateObj.getTime())) {
    console.warn('Date invalide:', date);
    return '';
  }
  
  // Formater au format JJ/MM/AAAA
  return dateObj.toLocaleDateString('fr-FR', {
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric'
  }).replace(/\//g, '/');
};

/**
 * Formate une heure au format HH:MM
 * @param hours Heures
 * @param minutes Minutes
 * @returns Heure formatée
 */
export const formatTime = (hours: number, minutes: number): string => {
  const paddedHours = hours.toString().padStart(2, '0');
  const paddedMinutes = minutes.toString().padStart(2, '0');
  return `${paddedHours}:${paddedMinutes}`;
};

/**
 * Vérifie si une date est aujourd'hui
 * @param date Date à vérifier
 * @returns true si la date est aujourd'hui
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};
