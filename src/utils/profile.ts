import { AuthResponse } from "@/services/api/auth";

/**
 * Détermine si le profil utilisateur est complet.
 * On considère le profil comme complet si TOUS les champs first_name, last_name ET birth_day sont remplis.
 */
export function isProfileComplete(user: Partial<AuthResponse>): boolean {
  // Vérifier que les champs obligatoires sont remplis
  return Boolean(
    user.first_name && 
    user.last_name && 
    user.birth_day
  );
}
