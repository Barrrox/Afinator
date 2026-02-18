export class TunerDisplay {
  private needle: HTMLElement | null;
  private statusText: HTMLElement | null;
  private progressBar: HTMLElement | null;

  constructor() {
    this.needle = document.getElementById('tuner-needle');
    this.statusText = document.getElementById('status-text');
    this.progressBar = document.getElementById('progress-fill');
  }

  updateGauge(cents: number) {
    if (!this.needle) return;
    
    // Limita visualmente entre -50 e 50 cents para não quebrar o layout
    const clampedCents = Math.max(-50, Math.min(50, cents));
    
    // Move a agulha (transform css)
    // 0 cents = 0deg (centro)
    const angle = clampedCents * 1.5; // Multiplicador para sensibilidade visual
    this.needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;

    this.updateStatusText(cents);
  }

  private updateStatusText(cents: number) {
    if (!this.statusText) return;

    if (Math.abs(cents) < 15) {
      this.statusText.innerText = "Na mosca!";
      this.statusText.style.color = "green";
    } else if (cents < 0) {
      this.statusText.innerText = "Muito grave (Suba!)";
      this.statusText.style.color = "orange";
    } else {
      this.statusText.innerText = "Muito agudo (Desça!)";
      this.statusText.style.color = "orange";
    }
  }

  updateProgress(percentage: number) {
    if (this.progressBar) {
      this.progressBar.style.width = `${percentage * 100}%`;
    }
  }

  showVictory() {
    if (this.statusText) {
      this.statusText.innerText = "Afinadíssimo";
      this.statusText.style.color = "blue";
      this.statusText.style.fontWeight = "bold";
    }
  }
}