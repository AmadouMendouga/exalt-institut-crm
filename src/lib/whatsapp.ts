// On cible directement api.whatsapp.com plutôt que le lien court wa.me : la
// redirection interne de wa.me corrompt les emoji hors plan de base (👋, 🎁,
// 💆...) en les remplaçant par "�", quel que soit le navigateur ou la méthode
// de navigation (confirmé en reproduisant le bug avec un lien wa.me construit
// manuellement, y compris sur desktop). Pointer directement vers l'endpoint
// que wa.me utilise en interne pour rediriger évite complètement le problème.
export function buildWaMeLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://api.whatsapp.com/send/?phone=${digits}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
}
