# Afinator

O Afinator (Lê-se *Afineitorr* com r puxado de caipira) é um programa simples que serve para auxiliar as pessoas, principalmente cantores, a melhorar a percepção auditiva para afinar a voz. 



## Árvore do projeto

```ps
/src
  /core
    AudioEngine.ts      # Gerencia Input (Mic) e Output (Piano/Tone.js)
    PitchDetector.ts    # Wrapper para o ml5.js (isolamento de dependência)
    GameLoop.ts         # O "maestro": controla estados, timer e updates
  /utils
    MusicMath.ts        # Fórmulas de conversão (Hz <-> Notas <-> Cents)
    SignalProcessing.ts # Smoothing, Média Móvel (para estabilizar a voz)
  /ui
    PianoComponent.ts   # Manipula o DOM do piano (Pinta teclas)
    TunerDisplay.ts     # Mostra as setas e feedback visual
  constants.ts          # Configurações (Sensibilidade, Dificuldade)
  main.ts               # Ponto de entrada
index.html
style.css
```