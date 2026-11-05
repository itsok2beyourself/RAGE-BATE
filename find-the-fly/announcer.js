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
      if (!on) this.stopAmbient();
      else this.unlock();
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
