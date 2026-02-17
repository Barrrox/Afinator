import { MusicMath } from '../utils/MusicMath';

export class PianoComponent {
  private container: HTMLElement;
  private keys: { [midi: number]: HTMLElement } = {};

  constructor(elementId: string) {
    const el = document.getElementById(elementId);
    if (!el) throw new Error(`Elemento ${elementId} não encontrado`);
    this.container = el;
    this.render();
  }

  private render() {
    this.container.innerHTML = '';
    // Vamos renderizar de C3 (48) até C5 (72)
    const startNote = 48;
    const endNote = 72;

    for (let i = startNote; i <= endNote; i++) {
      const key = document.createElement('div');
      const noteName = MusicMath.getNoteName(i);
      const isBlack = noteName.includes('#');
      
      key.className = `key ${isBlack ? 'black' : 'white'}`;
      key.dataset.note = i.toString();
      key.innerText = i % 12 === 0 ? `C${Math.floor(i/12)-1}` : ''; // Marca os Dós

      this.container.appendChild(key);
      this.keys[i] = key;
    }
  }

  /** Limpa todas as cores */
  clearHighlights() {
    Object.values(this.keys).forEach(k => {
      k.classList.remove('target', 'user');
    });
  }

  /** Pinta a nota alvo (Azul) */
  highlightTarget(midi: number) {
    // Limpa targets anteriores
    document.querySelectorAll('.key.target').forEach(ki => ki.classList.remove('target'));    
    
    if (this.keys[midi]) {
      this.keys[midi].classList.add('target');
    }
  }

  /** Pinta a nota do usuário (Verde) */
  highlightUser(midi: number) {
    // Limpa user anterior
    document.querySelectorAll('.key.user').forEach(k => k.classList.remove('user'));

    if (this.keys[midi]) {
      this.keys[midi].classList.add('user');
    }
  }
}