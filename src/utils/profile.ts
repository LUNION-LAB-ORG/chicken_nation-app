import { AuthResponse } from "@/services/api/auth";

/**
 * Détermine si le profil utilisateur est complet.
 * On considère le profil comme complet si TOUS les champs first_name, last_name ET birth_day sont remplis.
 */
export function isProfileComplete(user: Partial<AuthResponse>): boolean {
  if (!user) return false;
  
  // Vérifier que les champs obligatoires sont remplis et non vides
  return Boolean(
    user.first_name?.trim() && 
    user.last_name?.trim() && 
    user.birth_day?.trim()
  );
}
