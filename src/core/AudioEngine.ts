import * as Tone from 'tone';

export class AudioEngine {
  private synth: Tone.Synth;

  constructor() {
    // Cria um sintetizador simples (onda triangular soa bem para "piano" 8-bit)
    this.synth = new Tone.Synth().toDestination();
  }

  /** Inicializa o contexto de áudio (necessário após clique do usuário) */
  async initialize() {
    await Tone.start();
    console.log('AudioEngine: Contexto iniciado');
  }

  /** Toca uma frequência por um curto período */
  playNote(frequency: number, duration: string = '8n') {
    this.synth.triggerAttackRelease(frequency, duration);
  }
}