export interface DifficultyConfig {
  label: string;
  description: string;
  tolerance: number;
  duration: number;
}

export const DIFFICULTY_MODES: { [key: string]: DifficultyConfig } = {
  zero: {
    label: "Preciso treinar percepção musical do zero",
    description: "Aceita desvios de até meio tom para contar como afinado. Margem de 100 cents. Tempo mínimo mantendo a nota: 3s.",
    tolerance: 100,
    duration: 3000
  },
  manter: {
    label: "Preciso treinar manter a nota",
    description: "Foco em estabilidade. Tempo maior mas não precisa ser taaao afinado. Margem de 30 cents. Tempo mínimo mantendo a nota: 7s.",
    tolerance: 30,
    duration: 7000
  },
  absoluta: {
    label: "Preciso treinar afinação absoluta.",
    description: "Foco em alta precisão. Margem: 10 cents. Tempo mínimo mantendo a nota: 5s.",
    tolerance: 10,
    duration: 5000
  }
};

export const DEFAULT_MODE = "zero";