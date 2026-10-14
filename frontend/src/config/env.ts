/**
 * Ponto único de leitura das variáveis de ambiente.
 * Prioridade: window.__ENV__ (gerado em tempo de execução pelo contêiner a partir
 * de API_URL) e, em seguida, VITE_API_URL do arquivo .env (tempo de build).
 */
const rawApiUrl = window.__ENV__?.VITE_API_URL || import.meta.env.VITE_API_URL;

if (!rawApiUrl) {
  console.warn('[config] VITE_API_URL não definida no .env — usando http://localhost:3000');
}

export const env = {
  apiUrl: (rawApiUrl || 'http://localhost:3000').replace(/\/+$/, ''),
};
