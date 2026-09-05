// Salutation adaptée à l'heure d'envoi, pour remplacer le "Bonjour"/"Hello"
// figé des modèles de messages.
export function getTimeBasedGreeting(language: 'fr' | 'en', hour: number = new Date().getHours()): string {
  if (hour >= 5 && hour < 12) return language === 'fr' ? 'Bonjour' : 'Good morning';
  if (hour >= 12 && hour < 18) return language === 'fr' ? 'Bon après-midi' : 'Good afternoon';
  return language === 'fr' ? 'Bonsoir' : 'Good evening';
}
