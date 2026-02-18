import { MusicMath } from '../utils/MusicMath';
import { PitchDetector } from './PitchDetector';
import { AudioEngine } from './AudioEngine';

export class GameLoop {
  private targetMidi: number | null = null;
  private successStartTime: number | null = null;
  private isRunning: boolean = false;
  private lastPitchTime = 0;
  
  constructor(
    private pitchDetector: PitchDetector,
    private audioEngine: AudioEngine,
    private uiController: any,
    private config: { tolerance: number, duration: number } // Injeção de config
  ) {}

  public startGame(noteMidi: number) {
    this.targetMidi = noteMidi;
    this.isRunning = true;
    this.successStartTime = null;
    
    this.audioEngine.playNote(MusicMath.midiToFreq(noteMidi));
    this.uiController.highlightTarget(noteMidi);
    
    this.loop();
  }

  private loop = () => {
    if (!this.isRunning) return;

    // 1. Renderiza o Visual (Isso roda a 60FPS livremente)
    requestAnimationFrame(this.loop);

    // 2. Controla a frequência de chamadas da IA
    // Não adianta chamar a IA 60 vezes por segundo se ela demora 50ms para responder.
    // Vamos chamar a cada 50ms (aprox 20 vezes por segundo) para não engasgar a CPU.
    const now = performance.now();
    if (now - this.lastPitchTime < 50) return; 
    this.lastPitchTime = now;

    // 3. Pede o Pitch
    this.pitchDetector.getPitch((currentFreq) => {
      // Se a resposta demorou e o jogo já parou, ignora
      if (!this.isRunning) return;

      if (!currentFreq || !this.targetMidi) {
        this.resetSuccessTimer();
        return;
      }

      const targetFreq = MusicMath.midiToFreq(this.targetMidi);
      const currentMidiRaw = MusicMath.freqToMidi(currentFreq);
      const currentMidiRounded = Math.round(currentMidiRaw);
      const centsOff = MusicMath.getCentsOff(currentFreq, targetFreq);

      // Atualiza UI apenas quando temos dados novos
      this.uiController.updateGauge(centsOff);
      this.uiController.highlightUserNote(currentMidiRounded);

      if (Math.abs(centsOff) <= this.config.tolerance) {
        this.handleSuccessProgress();
      } else {
        this.resetSuccessTimer();
      }
    });
  };

  private handleSuccessProgress() {
    const now = performance.now();
    if (!this.successStartTime) this.successStartTime = now;
    const elapsed = now - this.successStartTime;
    this.uiController.updateProgressBar(elapsed / this.config.duration);
    if (elapsed >= this.config.duration) {
      this.isRunning = false;
      this.uiController.showVictoryMessage();
    }
  }

  private resetSuccessTimer() {
    this.successStartTime = null; 
    this.uiController.updateProgressBar(0);
  }
}