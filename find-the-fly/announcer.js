(() => {
  "use strict";

  /**
   * Multiplayer-style match announcer (COD energy):
   * gravelly VO via speechSynthesis + radio grit via Web Audio.
   */
  const LINES = {
    matchStart: [
      "Mission start!",
      "Secure the area!",
      "Find that target!",
      "Sweep the room!",
    ],
    huntIdle: [
      "Keep hunting.",
      "He's in there somewhere.",
      "Stay sharp.",
      "Check your corners.",
      "Don't let him breathe.",
      "Move.",
    ],
    spotted: [
      "Enemy spotted!",
      "Target acquired!",
      "Shame him!",
      "Lock in!",
      "Contact!",
    ],
    smackUrgent: [
      "Stay still!",
      "Hold your nerves!",
      "Take the shot!",
      "Make him feel it!",
    ],
    kill: [
      "Enemy down!",
      "Nice!",
      "Kill confirmed!",
      "He's down!",
      "Target eliminated!",
    ],
    firstBlood: ["First blood!", "Opening kill!"],
    streak2: ["Double kill!", "Two down!"],
    streak3: ["Triple kill!", "You're on fire!"],
    streak4: ["Domination!", "Unstoppable!"],
    streak5: ["Holy shit!", "Godlike!"],
    miss: [
      "Denied!",
      "He's getting away!",
      "Miss!",
      "Re-engage!",
    ],
    escaped: [
      "Target lost!",
      "He slipped away!",
      "Lost visual!",
      "Find him again!",
    ],
    hint: [
      "Movement!",
      "Track that flight path!",
      "Visual on movement!",
    ],
    replica: [
      "Multiple contacts!",
      "They're multiplying!",
      "More hostiles!",
      "Reinforcements!",
    ],
    decoy: [
      "Wrong target!",
      "That's a decoy!",
      "Negative, keep searching!",
    ],
    swarm: [
      "We're overrun!",
      "Mission failed!",
      "Swarm incoming!",
      "You lose!",
    ],
    timeLow: [
      "Time's running out!",
      "Hurry up!",
      "Clock's ticking!",
    ],
  };

  const announcer = {
    enabled: true,
    voice: null,
    ambientTimer: null,
    lastLineAt: 0,
    spokeTimeLow: false,
    audioCtx: null,
    unlocked: false,

    unlock() {
      if (this.unlocked) return;
      this.unlocked = true;
      try {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.audioCtx.state === "suspended") this.audioCtx.resume();
      } catch (_) {
        /* ignore */
      }
      this.pickVoice();
      // Warm speech API on user gesture
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const warm = new SpeechSynthesisUtterance("");
        warm.volume = 0;
        window.speechSynthesis.speak(warm);
      }
    },

    pickVoice() {
      if (!window.speechSynthesis) return;
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      const prefer = [
        /david/i,
        /mark/i,
        /guy/i,
        /ryan/i,
        /english.*(united states|us).*male/i,
        /google us english/i,
        /microsoft.*male/i,
        /alex/i,
        /daniel/i,
        /en-us/i,
        /en_us/i,
      ];
      let found = null;
      for (const re of prefer) {
        found = voices.find((v) => re.test(v.name) || re.test(v.lang));
        if (found) break;
      }
      this.voice = found || voices.find((v) => /^en/i.test(v.lang)) || voices[0];
    },

    radioClick() {
      if (!this.audioCtx || !this.enabled) return;
      const ctx = this.audioCtx;
      if (ctx.state === "suspended") ctx.resume();
      const t0 = ctx.currentTime;
      // Short radio burst / grit before VO
      const bufferSize = Math.floor(ctx.sampleRate * 0.07);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.35;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1800;
      filter.Q.value = 0.7;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.45, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(t0);
      noise.stop(t0 + 0.09);
    },

    say(text, { priority = false, rate = 1.02, pitch = 0.72 } = {}) {
      if (!this.enabled || !window.speechSynthesis || !text) return;
      this.unlock();
      this.pickVoice();
      if (priority) window.speechSynthesis.cancel();
      this.radioClick();
      const u = new SpeechSynthesisUtterance(text);
      if (this.voice) u.voice = this.voice;
      u.rate = rate;
      u.pitch = pitch;
      u.volume = 1;
      this.lastLineAt = performance.now();
      flashAnnouncer(text);
      // slight delay so radio click leads the VO
      setTimeout(() => window.speechSynthesis.speak(u), 60);
    },

    line(key, opts) {
      const pool = LINES[key];
      if (!pool || !pool.length) return;
      const text = pool[Math.floor(Math.random() * pool.length)];
      this.say(text, opts);
    },

    killCall(score) {
      if (score <= 1) {
        this.line("firstBlood", { priority: true, rate: 1.05 });
        setTimeout(() => this.line("kill", { priority: false }), 850);
      } else if (score === 2) this.line("streak2", { priority: true, rate: 1.08 });
      else if (score === 3) this.line("streak3", { priority: true, rate: 1.1 });
      else if (score === 4) this.line("streak4", { priority: true, rate: 1.08 });
      else if (score >= 5) this.line("streak5", { priority: true, rate: 1.12 });
      else this.line("kill", { priority: true });
    },

    startAmbient() {
      this.stopAmbient();
      this.spokeTimeLow = false;
      const tick = () => {
        if (!this.enabled) return;
        const gap = 11000 + Math.random() * 7000;
        this.ambientTimer = setTimeout(() => {
          // Don't talk over fresh priority lines
          if (performance.now() - this.lastLineAt > 4500) {
            this.line("huntIdle", { priority: false, rate: 0.98, pitch: 0.7 });
          }
          tick();
        }, gap);
      };
      tick();
    },

    stopAmbient() {
      if (this.ambientTimer) clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    },

    setEnabled(on) {
      this.enabled = on;
      if (!on) {
        this.stopAmbient();
        this.stopShameBed();
      } else this.unlock();
    },

    /* Heartbeat → drowned by rising fly buzz during shame lock */
    shameBed: null,

    startShameBed() {
      this.unlock();
      this.stopShameBed();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      if (ctx.state === "suspended") ctx.resume();

      const master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);

      const heartGain = ctx.createGain();
      heartGain.gain.value = 0.7;
      heartGain.connect(master);

      const buzzGain = ctx.createGain();
      buzzGain.gain.value = 0.05;
      buzzGain.connect(master);

      // Buzz: dual detuned saws + noise through bandpass
      const buzzA = ctx.createOscillator();
      const buzzB = ctx.createOscillator();
      buzzA.type = "sawtooth";
      buzzB.type = "sawtooth";
      buzzA.frequency.value = 180;
      buzzB.frequency.value = 186;
      const buzzFilter = ctx.createBiquadFilter();
      buzzFilter.type = "bandpass";
      buzzFilter.frequency.value = 1400;
      buzzFilter.Q.value = 4;
      const buzzTrem = ctx.createGain();
      buzzTrem.gain.value = 0.35;
      buzzA.connect(buzzFilter);
      buzzB.connect(buzzFilter);
      buzzFilter.connect(buzzTrem);
      buzzTrem.connect(buzzGain);
      buzzA.start();
      buzzB.start();

      const noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;
      noise.loop = true;
      const nFilter = ctx.createBiquadFilter();
      nFilter.type = "bandpass";
      nFilter.frequency.value = 2200;
      nFilter.Q.value = 1.2;
      const nGain = ctx.createGain();
      nGain.gain.value = 0.2;
      noise.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(buzzGain);
      noise.start();

      // LFO wing flutter on buzz
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 28;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.25;
      lfo.connect(lfoGain);
      lfoGain.connect(buzzTrem.gain);
      lfo.start();

      this.shameBed = {
        ctx,
        master,
        heartGain,
        buzzGain,
        buzzA,
        buzzB,
        noise,
        lfo,
        lastThump: 0,
        stopped: false,
      };
    },

    updateShameBed({ progress, bpm, nerves }) {
      const bed = this.shameBed;
      if (!bed || bed.stopped || !this.audioCtx) return;
      const ctx = this.audioCtx;
      const t = ctx.currentTime;
      // Progress 0→1: heartbeat flushed out, buzz takes over
      const p = Math.max(0, Math.min(1, progress));
      const heartVol = Math.max(0.02, 0.75 * Math.pow(1 - p, 1.6));
      const buzzVol = 0.04 + Math.pow(p, 1.15) * (0.55 + nerves / 200);
      bed.heartGain.gain.setTargetAtTime(heartVol, t, 0.08);
      bed.buzzGain.gain.setTargetAtTime(buzzVol, t, 0.08);
      bed.buzzA.frequency.setTargetAtTime(160 + p * 120 + nerves * 0.6, t, 0.1);
      bed.buzzB.frequency.setTargetAtTime(168 + p * 125 + nerves * 0.55, t, 0.1);

      const interval = 60 / Math.max(50, bpm);
      if (t - bed.lastThump >= interval) {
        bed.lastThump = t;
        this._heartThump(bed.heartGain, t);
      }
    },

    _heartThump(dest, t0) {
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(68, t0);
      osc.frequency.exponentialRampToValueAtTime(28, t0 + 0.12);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.95, t0 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
      osc.connect(g);
      g.connect(dest);
      osc.start(t0);
      osc.stop(t0 + 0.2);
      // second beat of lub-dub
      const osc2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(55, t0 + 0.14);
      osc2.frequency.exponentialRampToValueAtTime(24, t0 + 0.26);
      g2.gain.setValueAtTime(0.0001, t0 + 0.14);
      g2.gain.exponentialRampToValueAtTime(0.55, t0 + 0.155);
      g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
      osc2.connect(g2);
      g2.connect(dest);
      osc2.start(t0 + 0.14);
      osc2.stop(t0 + 0.32);
    },

    stopShameBed() {
      const bed = this.shameBed;
      if (!bed) return;
      bed.stopped = true;
      try {
        bed.buzzA.stop();
        bed.buzzB.stop();
        bed.noise.stop();
        bed.lfo.stop();
      } catch (_) {
        /* ignore */
      }
      try {
        bed.master.disconnect();
      } catch (_) {
        /* ignore */
      }
      this.shameBed = null;
    },
  };

  function flashAnnouncer(text) {
    let el = document.getElementById("announcer-sub");
    if (!el) {
      el = document.createElement("div");
      el.id = "announcer-sub";
      el.setAttribute("aria-live", "polite");
      document.getElementById("app")?.appendChild(el);
    }
    el.textContent = text.toUpperCase();
    el.classList.remove("show");
    void el.offsetWidth;
    el.classList.add("show");
    clearTimeout(flashAnnouncer._t);
    flashAnnouncer._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  if (typeof speechSynthesis !== "undefined") {
    speechSynthesis.addEventListener("voiceschanged", () => announcer.pickVoice());
  }

  window.FlyAnnouncer = announcer;
})();
