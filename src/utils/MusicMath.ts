export class MusicMath {
  // Nota A4 é 440Hz e MIDI 69
  static freqToMidi(freq: number): number {
    return 69 + 12 * Math.log2(freq / 440);
  }

  static midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /** Retorna a nota em string (ex: "C4") */
  static getNoteName(midi: number): string {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = Math.floor(midi / 12) - 1; // Calcula a oitava
    const noteIndex = midi % 12; // Calcula a no
    return `${notes[noteIndex]}${octave}`;
  }

  /** Calcula a diferença em Cents entre duas frequências */
  static getCentsOff(currentFreq: number, targetFreq: number): number {
    return 1200 * Math.log2(currentFreq / targetFreq);
  }
}