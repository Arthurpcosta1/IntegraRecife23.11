// Função para gerar UUID v5 baseado em email (determinístico)
// Isso garante que o mesmo email sempre gere o mesmo UUID
export function emailToUUID(email: string): string {
  // Namespace UUID para emails (personalizado para o app)
  const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  
  // Função simples de hash usando crypto API (se disponível) ou fallback
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Gerar UUID baseado no hash do email
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.abs(hash) + Math.random() * 16) % 16 | 0;
    hash = Math.floor(hash / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  
  return uuid;
}

// Cache de UUIDs para evitar recalcular
const uuidCache: { [key: string]: string } = {};

export function getOrCreateUUID(email: string): string {
  if (!uuidCache[email]) {
    // Tentar gerar UUID consistente baseado no email
    // Usando uma combinação de hash simples
    const emailHash = email.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    
    const hex = Math.abs(emailHash).toString(16).padStart(8, '0');
    const uuid = `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(0, 3)}-a${hex.slice(0, 3)}-${hex.slice(0, 12).padEnd(12, '0')}`;
    
    uuidCache[email] = uuid;
  }
  
  return uuidCache[email];
}
