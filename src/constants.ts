export interface DifficultyConfig {
  label: string;
  description: string;
  tolerance: number;
  duration: number;
}

export const DIFFICULTY_MODES: { [key: string]: DifficultyConfig } = {
  zero: {
    label: "Preciso treinar percepção musical do zero",
    description: "Facilitado: Aceita desvios de até meio tom (100 cents). Tempo: 3s.",
    tolerance: 100,
    duration: 3000
  },
  manter: {
    label: "Preciso treinar manter a nota",
    description: "Médio: Foco em estabilidade. Margem de 30 cents. Tempo: 7s.",
    tolerance: 30,
    duration: 7000
  },
  absoluta: {
    label: "Preciso treinar afinação absoluta",
    description: "Difícil: Alta precisão (15 cents). Tempo: 4s.",
    tolerance: 15,
    duration: 4000
  }
};

export const DEFAULT_MODE = "zero";