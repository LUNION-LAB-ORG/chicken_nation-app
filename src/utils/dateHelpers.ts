/**
 * Utilitaires pour le formatage et la manipulation des dates
 */

/**
 * Formate une date au format JJ.MM.AAAA
 * @param dateString Chaîne de date ISO ou objet Date
 * @returns Date formatée au format JJ.MM.AAAA
 */
export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Vérifier si la date est valide
  if (isNaN(date.getTime())) {
    return 'Date invalide';
  }
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}.${month}.${year}`;
};

/**
 * Formate une heure au format HH:MM
 * @param dateString Chaîne de date ISO ou objet Date
 * @returns Heure formatée au format HH:MM
 */
export const formatTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Vérifier si la date est valide
  if (isNaN(date.getTime())) {
    return 'Heure invalide';
  }
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

/**
 * Formate une date et heure au format JJ.MM.AAAA à HH:MM
 * @param dateString Chaîne de date ISO ou objet Date
 * @returns Date et heure formatées au format JJ.MM.AAAA à HH:MM
 */
export const formatDateTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Vérifier si la date est valide
  if (isNaN(date.getTime())) {
    return 'Date et heure invalides';
  }
  
  return `${formatDate(date)} à ${formatTime(date)}`;
};

/**
 * Vérifie si une date est aujourd'hui
 * @param dateString Chaîne de date ISO ou objet Date
 * @returns true si la date est aujourd'hui, false sinon
 */
export const isToday = (dateString: string | Date): boolean => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const today = new Date();
  
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Retourne une représentation relative de la date (aujourd'hui, hier, etc.)
 * @param dateString Chaîne de date ISO ou objet Date
 * @returns Représentation relative de la date
 */
export const getRelativeDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  
  // Vérifier si la date est valide
  if (isNaN(date.getTime())) {
    return 'Date invalide';
  }
  
  // Aujourd'hui
  if (isToday(date)) {
    return 'Aujourd\'hui';
  }
  
  // Hier
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Hier';
  }
  
  // Cette semaine (dans les 7 derniers jours)
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  if (date >= oneWeekAgo) {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[date.getDay()];
  }
  
  // Date complète pour les dates plus anciennes
  return formatDate(date);
};
