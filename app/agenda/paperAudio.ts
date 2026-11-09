/**
 * Sistema d'efectes acústics orgànics i subtils per al paper de l'agenda
 * Utilitza Web Audio API procedural: lliure de dependències, sense descàrregues
 * externes, i amb volum calibrat per a un so càlid i gens intimidatori.
 */

class PaperAudioEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private initContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    if (this.ctx && !this.noiseBuffer) {
      // Buffer de soroll blanc d'alta definició per sintetitzar les fibres del paper
      const sampleRate = this.ctx.sampleRate;
      const bufferLength = Math.floor(sampleRate * 0.8);
      const buffer = this.ctx.createBuffer(1, bufferLength, sampleRate);
      const data = buffer.getChannelData(0);

      // Soroll suau i porós simulant paper d'arxiu i pergamí
      let lastVal = 0;
      for (let i = 0; i < bufferLength; i++) {
        const white = Math.random() * 2 - 1;
        // Filtrar lleugerament per obtenir textura càlida (soroll rosa suau)
        lastVal = lastVal * 0.72 + white * 0.28;
        data[i] = lastVal;
      }
      this.noiseBuffer = buffer;
    }

    return this.ctx;
  }

  /**
   * So de desplegar paper (unfold): suau farrameig amb obertura de plecs
   */
  public playUnfold() {
    try {
      const ctx = this.initContext();
      if (!ctx || !this.noiseBuffer) return;

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      // Volum moderat i gens invasiu
      masterGain.gain.setValueAtTime(0.18, now);
      masterGain.connect(ctx.destination);

      // Capa 1: Fregament lliscant suau de les fibres de paper en obrir-se
      const bodySource = ctx.createBufferSource();
      bodySource.buffer = this.noiseBuffer;

      const bodyFilter = ctx.createBiquadFilter();
      bodyFilter.type = "bandpass";
      bodyFilter.frequency.setValueAtTime(1800, now);
      bodyFilter.frequency.exponentialRampToValueAtTime(3200, now + 0.35);
      bodyFilter.Q.setValueAtTime(1.8, now);

      const bodyGain = ctx.createGain();
      bodyGain.gain.setValueAtTime(0.001, now);
      bodyGain.gain.linearRampToValueAtTime(0.38, now + 0.08);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      bodySource.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(masterGain);

      bodySource.start(now);
      bodySource.stop(now + 0.45);

      // Capa 2: Micro-plecs cruixents (crinkles) en desplegar-se els plecs
      const crinkleTimes = [0.03, 0.12, 0.22];
      crinkleTimes.forEach((delay, idx) => {
        const cSource = ctx.createBufferSource();
        cSource.buffer = this.noiseBuffer;

        const cFilter = ctx.createBiquadFilter();
        cFilter.type = "bandpass";
        const freq = 3400 + idx * 600 + (Math.random() * 400 - 200);
        cFilter.frequency.setValueAtTime(freq, now + delay);
        cFilter.Q.setValueAtTime(2.4, now + delay);

        const cGain = ctx.createGain();
        cGain.gain.setValueAtTime(0.001, now + delay);
        cGain.gain.linearRampToValueAtTime(0.22, now + delay + 0.012);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.065);

        cSource.connect(cFilter);
        cFilter.connect(cGain);
        cGain.connect(masterGain);

        cSource.start(now + delay);
        cSource.stop(now + delay + 0.07);
      });
    } catch {
      // Protecció en cas que les polítiques d'àudio del navegador bloquegin el so
    }
  }

  /**
   * So d'arrugar bola de paper (crumple): cruixit tàctil i compressió suau
   */
  public playCrumple() {
    try {
      const ctx = this.initContext();
      if (!ctx || !this.noiseBuffer) return;

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      // Volum càlid i contingut
      masterGain.gain.setValueAtTime(0.2, now);
      masterGain.connect(ctx.destination);

      // Micro-cruixits de compressió de paper esgavellat
      const crunchTimes = [0.0, 0.06, 0.14, 0.22];
      crunchTimes.forEach((delay, idx) => {
        const source = ctx.createBufferSource();
        source.buffer = this.noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        // Freqüències descendents que donen sensació de comprimir la bola cap al centre
        const freq = 2600 - idx * 350 + (Math.random() * 300 - 150);
        filter.frequency.setValueAtTime(Math.max(600, freq), now + delay);
        filter.Q.setValueAtTime(1.9, now + delay);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, now + delay);
        gain.gain.linearRampToValueAtTime(0.32, now + delay + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.075);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        source.start(now + delay);
        source.stop(now + delay + 0.08);
      });

      // Cos ressonant suau de la bola en arrugar-se
      const bodySource = ctx.createBufferSource();
      bodySource.buffer = this.noiseBuffer;

      const bodyFilter = ctx.createBiquadFilter();
      bodyFilter.type = "lowpass";
      bodyFilter.frequency.setValueAtTime(950, now);
      bodyFilter.Q.setValueAtTime(1.2, now);

      const bodyGain = ctx.createGain();
      bodyGain.gain.setValueAtTime(0.001, now);
      bodyGain.gain.linearRampToValueAtTime(0.24, now + 0.04);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      bodySource.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(masterGain);

      bodySource.start(now);
      bodySource.stop(now + 0.32);
    } catch {
      // Ignorar errors silents
    }
  }
}

export const paperAudio = new PaperAudioEngine();
