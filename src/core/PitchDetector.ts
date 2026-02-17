// Assumindo que o ml5 é carregado via CDN ou importado
declare const ml5: any;

export class PitchDetector {
  private audioContext: AudioContext;
  private model: any;
  private stream: MediaStream | null = null;
  private frequencyBuffer: number[] = []; // Para média móvel

  constructor(ctx: AudioContext) {
    this.audioContext = ctx;
  }

  async initialize() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Carrega modelo 'CREPE' (mais preciso para voz)
    const modelUrl = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
    this.model = await ml5.pitchDetection(modelUrl, this.audioContext, this.stream, this.modelLoaded);
  }

  private modelLoaded() {
    console.log('Modelo de IA carregado!');
  }

  // Retorna a frequência suavizada
  public getPitch(callback: (freq: number | null) => void) {
    if (!this.model) return;

    this.model.getPitch((err: any, frequency: number) => {

      if (frequency && frequency > 0) {
        // Adiciona ao buffer
        this.frequencyBuffer.push(frequency);
        if (this.frequencyBuffer.length > 5) this.frequencyBuffer.shift();

        // Calcula a média (Smoothing)
        const avgFreq = this.frequencyBuffer.reduce((a, b) => a + b, 0) / this.frequencyBuffer.length;
        callback(avgFreq);
      } else {
        // Se for silêncio ou ruído, limpa o buffer para não "arrastar" notas antigas
        this.frequencyBuffer = [];
        callback(null);
      }
    });
  }
}