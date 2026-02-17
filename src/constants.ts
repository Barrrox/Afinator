export const CONFIG = {
  // Configurações de Dificuldade (MVP)
  TOLERANCE_CENTS: 30, // Margem de erro aceitável (+/- 30 cents)
  SUCCESS_DURATION_MS: 3000, // 3 segundos para vencer
  BUFFER_SIZE: 5, // Quantidade de frames para fazer a média (Smoothing)
  CONFIDENCE_THRESHOLD: 0.75, // Só aceita sons se o modelo tiver 75% de certeza
};