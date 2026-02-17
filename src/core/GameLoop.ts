import { CONFIG } from '../constants';
import { MusicMath } from '../utils/MusicMath';
import { PitchDetector } from './PitchDetector';
import { AudioEngine } from './AudioEngine'; // Classe wrapper do Tone.js (não mostrada por brevidade)

export class GameLoop {
  private targetMidi: number | null = null;
  private successStartTime: number | null = null;
  private isRunning: boolean = false;
  
  constructor(
    private pitchDetector: PitchDetector,
    private audioEngine: AudioEngine,
    private uiController: any // Interface da UI
  ) {}

  public startGame(noteMidi: number) {
    this.targetMidi = noteMidi;
    this.isRunning = true;
    this.successStartTime = null;
    
    // Toca a nota alvo (Azul)
    this.audioEngine.playNote(MusicMath.midiToFreq(noteMidi));
    this.uiController.highlightTarget(noteMidi);
    
    this.loop();
  }

  private loop = () => {
    if (!this.isRunning) return;

    this.pitchDetector.getPitch((currentFreq) => {
      if (!currentFreq || !this.targetMidi) {
        this.resetSuccessTimer();
        requestAnimationFrame(this.loop);
        return;
      }

      const targetFreq = MusicMath.midiToFreq(this.targetMidi);
      const currentMidiRaw = MusicMath.freqToMidi(currentFreq);
      const currentMidiRounded = Math.round(currentMidiRaw);
      
      const centsOff = MusicMath.getCentsOff(currentFreq, targetFreq);

      // Atualiza UI
      this.uiController.updateGauge(centsOff); // Flechas
      this.uiController.highlightUserNote(currentMidiRounded); // Tecla Verde

      // Lógica de Sucesso (checa se está dentro da tolerância)
      // Nota: Math.abs(centsOff) lida com oitavas? No MVP não. 
      // Para lidar com oitavas (requisito futuro), usaríamos modulo 12.
      if (Math.abs(centsOff) <= CONFIG.TOLERANCE_CENTS) {
        this.handleSuccessProgress();
      } else {
        this.resetSuccessTimer();
      }
    });

    requestAnimationFrame(this.loop);
  };

  private handleSuccessProgress() {
    const now = performance.now();
    if (!this.successStartTime) {
      this.successStartTime = now;
    }

    const elapsed = now - this.successStartTime;
    this.uiController.updateProgressBar(elapsed / CONFIG.SUCCESS_DURATION_MS);

    if (elapsed >= CONFIG.SUCCESS_DURATION_MS) {
      this.isRunning = false;
      this.uiController.showVictoryMessage();
    }
  }

  private resetSuccessTimer() {
    // Pequeno "buffer de perdão" (Debounce):
    // Se o usuário falhar por 100ms, não zera imediatamente (opcional)
    this.successStartTime = null; 
    this.uiController.updateProgressBar(0);
  }
}