declare const ml5: any;

export class PitchDetector {
  private audioContext: AudioContext;
  private model: any;
  private stream: MediaStream | null = null;

  constructor(ctx: AudioContext) {
    this.audioContext = ctx;
  }

  async initialize() {
    // 1. GARANTIA: Força o contexto a acordar imediatamente
    if (this.audioContext.state === 'suspended') {
      console.log("PitchDetector: Forçando resume do AudioContext...");
      await this.audioContext.resume();
    }

    // 2. Obtém o microfone
    if (!this.stream) {
      console.log("PitchDetector: Pedindo permissão do microfone...");
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false // Desligar AGC ajuda na estabilidade do pitch
        }
      });
    }

    // 3. Carrega o modelo
    console.log("PitchDetector: Carregando modelo ML5...");
    const modelUrl = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';

    return new Promise<void>((resolve) => {
      // Passamos o stream explicitamente para o ml5 não tentar criar outro audioContext
      this.model = ml5.pitchDetection(modelUrl, this.audioContext, this.stream, () => {
        console.log("PitchDetector: Modelo OK!");
        resolve();
      });
    });
  }

  public getPitch(callback: (freq: number | null) => void) {
    if (!this.model) return;

    this.model.getPitch((err: any, frequency: number) => {
      if (frequency && frequency > 0) {
        // SEM BUFFER, SEM MÉDIA, SEM ATRASO.
        // Entrega o dado cru imediatamente.
        callback(frequency); 
      } else {
        callback(null);
      }
    });
  }

}