import { AuthResponse } from "@/services/api/auth";
 
export function isProfileComplete(user: Partial<AuthResponse>): boolean {
  if (!user) return false;
  
  // Vérifier que les champs obligatoires sont remplis et non vides
  return Boolean(
    user.first_name?.trim() && 
    user.last_name?.trim() && 
    user.birth_day?.trim()
  );
}
