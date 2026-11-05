(() => {
  "use strict";

  const DIFFICULTY = {
    easy: {
      label: "Fat housefly",
      size: 28,
      speed: 0.55,
      tempF: 78,
      swarmSeconds: 75,
      replicaInterval: 14,
      maxReplicas: 4,
      hintDuration: 3200,
      hitPadding: 14,
      dwellMin: 2.0,
      dwellMax: 5.0,
      nervesStart: 62,
      stillEase: 28,
      twitchSpike: 38,
    },
    normal: {
      label: "Kitchen menace",
      size: 16,
      speed: 1.05,
      tempF: 64,
      swarmSeconds: 55,
      replicaInterval: 10,
      maxReplicas: 7,
      hintDuration: 2600,
      hitPadding: 10,
      dwellMin: 2.0,
      dwellMax: 5.0,
      nervesStart: 72,
      stillEase: 22,
      twitchSpike: 48,
    },
    hard: {
      label: "Fruit flea hell",
      size: 9,
      speed: 1.65,
      tempF: 52,
      swarmSeconds: 40,
      replicaInterval: 7,
      maxReplicas: 12,
      hintDuration: 2000,
      hitPadding: 8,
      dwellMin: 2.0,
      dwellMax: 5.0,
      nervesStart: 82,
      stillEase: 16,
      twitchSpike: 58,
    },
  };

  const SCENES = [
    {
      id: "kitchen",
      name: "Sunday kitchen (ruined)",
      think: "It’s on the sticky sugar. Or the trash breath. Or the warm stove lip.",
      coldThink: "Cold kitchen — it’ll glue itself to toaster heat and anything sweet left out.",
      attractors: [
        { id: "fruit", x: 0.62, y: 0.58, food: 0.95, light: 0.35, heat: 0.25, label: "fruit bowl" },
        { id: "lamp", x: 0.78, y: 0.28, food: 0.05, light: 0.95, heat: 0.55, label: "pendant lamp" },
        { id: "trash", x: 0.18, y: 0.78, food: 0.8, light: 0.1, heat: 0.15, label: "trash" },
        { id: "stove", x: 0.38, y: 0.48, food: 0.45, light: 0.4, heat: 0.9, label: "stove" },
        { id: "window", x: 0.22, y: 0.22, food: 0.05, light: 0.7, heat: 0.2, label: "window" },
        { id: "sink", x: 0.48, y: 0.62, food: 0.55, light: 0.25, heat: 0.35, label: "sink edge" },
      ],
      svg: kitchenSVG,
    },
    {
      id: "living",
      name: "Living room crust",
      think: "Lamp pools. Snack plate. Sofa crease crumbs. Pick your poison.",
      coldThink: "Drafty — radiator heat or TV glow before bare walls.",
      attractors: [
        { id: "lamp", x: 0.16, y: 0.42, food: 0.05, light: 0.95, heat: 0.7, label: "floor lamp" },
        { id: "plate", x: 0.55, y: 0.62, food: 0.9, light: 0.35, heat: 0.25, label: "snack plate" },
        { id: "tv", x: 0.78, y: 0.38, food: 0.05, light: 0.85, heat: 0.4, label: "TV glow" },
        { id: "radiator", x: 0.88, y: 0.72, food: 0.05, light: 0.1, heat: 0.95, label: "radiator" },
        { id: "plant", x: 0.32, y: 0.55, food: 0.2, light: 0.3, heat: 0.2, label: "plant pot" },
        { id: "sofa", x: 0.42, y: 0.72, food: 0.55, light: 0.2, heat: 0.35, label: "sofa crease" },
      ],
      svg: livingSVG,
    },
    {
      id: "bedroom",
      name: "Bedroom at dusk (don’t think about it)",
      think: "Bedside lamp. Water glass rim. It was near your mouth.",
      coldThink: "Cold flat — laptop exhaust and blanket warmth win.",
      attractors: [
        { id: "bedlamp", x: 0.2, y: 0.48, food: 0.05, light: 0.95, heat: 0.55, label: "bedside lamp" },
        { id: "glass", x: 0.28, y: 0.58, food: 0.35, light: 0.4, heat: 0.2, label: "water glass" },
        { id: "laptop", x: 0.62, y: 0.58, food: 0.1, light: 0.7, heat: 0.85, label: "laptop" },
        { id: "window", x: 0.82, y: 0.28, food: 0.05, light: 0.55, heat: 0.1, label: "window" },
        { id: "hamper", x: 0.88, y: 0.75, food: 0.25, light: 0.1, heat: 0.3, label: "hamper" },
        { id: "nightstand", x: 0.18, y: 0.62, food: 0.4, light: 0.45, heat: 0.25, label: "nightstand crumbs" },
      ],
      svg: bedroomSVG,
    },
    {
      id: "patio",
      name: "Back-porch brunch (contaminated)",
      think: "Open jam. Citrus wedge. The rim is a runway.",
      coldThink: "Chilly porch — grill heat and warm mug before the railing.",
      attractors: [
        { id: "jam", x: 0.48, y: 0.55, food: 1, light: 0.45, heat: 0.3, label: "jam jar" },
        { id: "citrus", x: 0.58, y: 0.58, food: 0.85, light: 0.5, heat: 0.25, label: "citrus" },
        { id: "grill", x: 0.82, y: 0.62, food: 0.4, light: 0.2, heat: 0.95, label: "grill" },
        { id: "string", x: 0.35, y: 0.22, food: 0.05, light: 0.8, heat: 0.35, label: "string lights" },
        { id: "mug", x: 0.38, y: 0.52, food: 0.35, light: 0.3, heat: 0.55, label: "warm mug" },
        { id: "railing", x: 0.15, y: 0.45, food: 0.05, light: 0.4, heat: 0.15, label: "railing" },
      ],
      svg: patioSVG,
    },
  ];

  const state = {
    screen: "title",
    difficulty: "normal",
    sceneIndex: 0,
    score: 0,
    flies: [],
    primaryId: null,
    swarmDeadline: 0,
    replicaAt: 0,
    swarmFrozenLeft: null, // ms remaining while smack freezes the swarm clock
    hinting: false,
    magnifierOn: false,
    phase: "hunt", // hunt | smack
    smackDeadline: 0,
    smackDuration: 0,
    smackTargetId: null,
    nerves: 70,
    stillMs: 0,
    lastPointer: { x: 0.5, y: 0.5 },
    kickNeedle: 0.5,
    kickDir: 1,
    kickPhase: 0,
    smackBusy: false,
    paused: false,
    raf: 0,
    lastTs: 0,
    pointer: { x: 0.5, y: 0.5, over: false },
  };

  const $ = (sel) => document.querySelector(sel);
  const screens = {
    title: $("#screen-title"),
    howto: $("#screen-howto"),
    difficulty: $("#screen-difficulty"),
    play: $("#screen-play"),
  };

  function go(name) {
    state.screen = name;
    Object.entries(screens).forEach(([k, el]) => {
      el.classList.toggle("active", k === name);
    });
  }

  document.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => go(btn.dataset.go));
  });

  document.querySelectorAll("[data-diff]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.difficulty = btn.dataset.diff;
      state.score = 0;
      state.sceneIndex = 0;
      window.FlyAnnouncer?.unlock();
      startRound();
      go("play");
    });
  });

  $("#btn-menu").addEventListener("click", () => {
    stopLoop();
    endSmackUI();
    hideOverlay();
    window.FlyAnnouncer?.stopAmbient();
    state.magnifierOn = false;
    syncGlassBtn();
    go("title");
  });

  const btnAnnouncer = $("#btn-announcer");
  if (btnAnnouncer) {
    btnAnnouncer.addEventListener("click", () => {
      const next = !(window.FlyAnnouncer?.enabled !== false);
      window.FlyAnnouncer?.setEnabled(next);
      btnAnnouncer.setAttribute("aria-pressed", String(next));
      btnAnnouncer.textContent = next ? "VO ON" : "VO OFF";
      if (next && state.screen === "play" && !state.paused) {
        window.FlyAnnouncer?.startAmbient();
        window.FlyAnnouncer?.line("matchStart", { priority: true });
      }
    });
  }

  $("#btn-skip").addEventListener("click", () => {
    if (state.paused) return;
    state.sceneIndex = (state.sceneIndex + 1) % SCENES.length;
    startRound();
  });

  const btnGlass = $("#btn-glass");
  const btnHint = $("#btn-hint");
  const stage = $("#stage");
  const sceneRoot = $("#scene-root");
  const fliesLayer = $("#flies-layer");
  const magnifier = $("#magnifier");
  const magLens = $("#mag-lens");
  const thinkHint = $("#think-hint");
  const overlay = $("#overlay");
  const shamePov = $("#shame-pov");
  const shameZoom = $("#shame-zoom");
  const shameFly = $("#shame-fly");
  const shameArm = $("#shame-arm");
  const shamePulse = $("#shame-pulse");
  const shameCoach = $("#shame-coach");
  const nervesBar = $("#nerves-bar");
  const dwellBar = $("#dwell-bar");
  const kickNeedle = $("#kick-needle");
  const kickSweet = $("#kick-sweet");
  const kickGrade = $("#kick-grade");
  const btnSmack = $("#btn-smack");

  btnGlass.addEventListener("click", () => {
    if (state.phase === "smack") return;
    state.magnifierOn = !state.magnifierOn;
    syncGlassBtn();
    if (!state.magnifierOn) {
      magnifier.hidden = true;
      stage.classList.remove("magnifying");
    } else {
      stage.classList.add("magnifying");
      updateMagnifier();
    }
  });

  btnHint.addEventListener("click", () => {
    if (state.paused || state.hinting || state.phase === "smack") return;
    triggerHint();
  });

  function syncGlassBtn() {
    btnGlass.setAttribute("aria-pressed", String(state.magnifierOn));
    btnGlass.classList.toggle("active", state.magnifierOn);
  }

  function cfg() {
    return DIFFICULTY[state.difficulty];
  }

  function scene() {
    return SCENES[state.sceneIndex];
  }

  function isCold() {
    return cfg().tempF < 68;
  }

  function weightAttractor(a) {
    const cold = isCold();
    const foodW = 1.1;
    const lightW = cold ? 0.85 : 1.25;
    const heatW = cold ? 1.45 : 0.55;
    return a.food * foodW + a.light * lightW + a.heat * heatW + Math.random() * 0.15;
  }

  function pickPerch(excludeIds = []) {
    const attrs = scene().attractors.filter((a) => !excludeIds.includes(a.id));
    const scored = attrs
      .map((a) => ({ a, w: weightAttractor(a) }))
      .sort((x, y) => y.w - x.w);
    const top = scored.slice(0, Math.min(3, scored.length));
    const pick = top[Math.floor(Math.random() * top.length)].a;
    const jitter = 0.035;
    return {
      attractorId: pick.id,
      x: clamp(pick.x + (Math.random() - 0.5) * jitter, 0.06, 0.94),
      y: clamp(pick.y + (Math.random() - 0.5) * jitter, 0.08, 0.9),
      label: pick.label,
    };
  }

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  function flySVGMarkup(size) {
    const s = size;
    return `<svg viewBox="0 0 40 30" width="${s}" height="${s * 0.75}" aria-hidden="true">
      <ellipse class="w" cx="10" cy="14" rx="9" ry="5" fill="rgba(220,200,150,0.4)"/>
      <ellipse class="w" cx="30" cy="14" rx="9" ry="5" fill="rgba(220,200,150,0.4)"/>
      <ellipse cx="20" cy="16" rx="7" ry="5" fill="#1a1208"/>
      <circle cx="25" cy="13.5" r="2.2" fill="#2e2210"/>
      <circle cx="25.7" cy="13" r="0.7" fill="#e8ff3d"/>
    </svg>`;
  }

  function makeFly({ isPrimary, perch }) {
    const id = "f_" + Math.random().toString(36).slice(2, 9);
    const el = document.createElement("button");
    el.type = "button";
    el.className = "fly-target" + (isPrimary ? "" : " replica");
    el.dataset.id = id;
    el.setAttribute("aria-label", isPrimary ? "Suspect fly" : "Replica fly");
    const size = cfg().size * (isPrimary ? 1 : 0.9);
    el.style.width = size + "px";
    el.style.height = size * 0.75 + "px";
    el.innerHTML = flySVGMarkup(size);
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      onFlyClick(id);
    });
    fliesLayer.appendChild(el);
    const fly = {
      id,
      el,
      isPrimary,
      x: perch.x,
      y: perch.y,
      tx: perch.x,
      ty: perch.y,
      attractorId: perch.attractorId,
      label: perch.label,
      flying: false,
      path: null,
      pathT: 0,
      pathSpeed: 0,
      skitterPhase: Math.random() * Math.PI * 2,
    };
    placeFly(fly);
    return fly;
  }

  function placeFly(fly) {
    fly.el.style.left = fly.x * 100 + "%";
    fly.el.style.top = fly.y * 100 + "%";
  }

  function startRound() {
    stopLoop();
    endSmackUI();
    hideOverlay();
    state.paused = false;
    state.hinting = false;
    state.phase = "hunt";
    state.smackTargetId = null;
    state.flies = [];
    state.primaryId = null;
    fliesLayer.innerHTML = "";
    $("#fx-layer").innerHTML = "";
    sceneRoot.innerHTML = scene().svg();

    const perch = pickPerch();
    const primary = makeFly({ isPrimary: true, perch });
    state.flies.push(primary);
    state.primaryId = primary.id;

    const now = performance.now();
    state.swarmDeadline = now + cfg().swarmSeconds * 1000;
    state.replicaAt = now + cfg().replicaInterval * 1000;
    state.lastTs = now;

    $("#scene-label").textContent = scene().name;
    $("#temp-chip").textContent = cfg().tempF + "°F · " + cfg().label;
    $("#score-chip").textContent = state.score + " dead";
    showThink(isCold() ? scene().coldThink : scene().think);

    btnHint.disabled = false;
    btnGlass.disabled = false;
    startLoop();
    updateMagnifier();
    window.FlyAnnouncer?.line("matchStart", { priority: true });
    window.FlyAnnouncer?.startAmbient();
  }

  function showThink(text) {
    thinkHint.textContent = text;
    thinkHint.classList.add("show");
    clearTimeout(showThink._t);
    showThink._t = setTimeout(() => thinkHint.classList.remove("show"), 5200);
  }

  function onFlyClick(id) {
    if (state.paused || state.hinting) return;
    if (state.phase === "smack") return;
    const fly = state.flies.find((f) => f.id === id);
    if (!fly) return;
    if (fly.isPrimary) {
      beginSmack(fly);
    } else {
      fly.el.animate(
        [
          { transform: "translate(-50%,-50%) scale(1)" },
          { transform: "translate(-50%,-50%) scale(1.35)" },
          { transform: "translate(-50%,-50%) scale(1)" },
        ],
        { duration: 220 }
      );
      showThink("Wrong one. That’s a replica. The original is still mocking you.");
      window.FlyAnnouncer?.line("decoy", { priority: true });
    }
  }

  function beginSmack(fly) {
    state.phase = "smack";
    state.smackTargetId = fly.id;
    state.smackBusy = false;
    const now = performance.now();
    const dwell =
      cfg().dwellMin + Math.random() * (cfg().dwellMax - cfg().dwellMin);
    state.smackDuration = dwell * 1000;
    state.smackDeadline = now + state.smackDuration;
    state.swarmFrozenLeft = Math.max(0, state.swarmDeadline - now);
    state.nerves = cfg().nervesStart;
    state.stillMs = 0;
    state.lastPointer = { x: state.pointer.x, y: state.pointer.y };
    state.magnifierOn = false;
    syncGlassBtn();
    magnifier.hidden = true;
    stage.classList.remove("magnifying");
    fly.el.classList.add("spotted");
    btnHint.disabled = true;
    btnGlass.disabled = true;

    // Build zoomed backdrop from scene around the fly
    const rect = stage.getBoundingClientRect();
    shameZoom.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.style.cssText = `position:absolute;width:${rect.width}px;height:${rect.height}px;left:50%;top:50%;transform:translate(-50%,-50%) scale(2.4) translate(${(0.5 - fly.x) * rect.width}px, ${(0.42 - fly.y) * rect.height}px)`;
    const sceneClone = sceneRoot.cloneNode(true);
    sceneClone.style.cssText = "position:absolute;inset:0";
    wrap.appendChild(sceneClone);
    shameZoom.appendChild(wrap);

    shameFly.innerHTML = flySVGMarkup(Math.max(28, cfg().size * 1.8));
    shamePov.hidden = false;
    btnSmack.disabled = false;
    shameArm.classList.remove("swing");
    state.kickPhase = 0;
    state.kickNeedle = 0.15;
    state.kickDir = 1;
    window.FlyAnnouncer?.startShameBed();
    updateShameUI(now);
    showThink("Shame lock. Stay still. Stop the needle in the green.");
    window.FlyAnnouncer?.line("spotted", { priority: true, rate: 1.08 });
    setTimeout(() => window.FlyAnnouncer?.line("smackUrgent", { priority: false }), 750);
  }

  function endSmackUI() {
    if (state.swarmFrozenLeft != null) {
      state.swarmDeadline = performance.now() + state.swarmFrozenLeft;
      state.swarmFrozenLeft = null;
    }
    state.phase = "hunt";
    state.smackTargetId = null;
    state.smackBusy = false;
    window.FlyAnnouncer?.stopShameBed();
    shamePov.hidden = true;
    shameArm.classList.remove("swing");
    shamePov.classList.remove("high-nerves");
    state.flies.forEach((f) => f.el.classList.remove("spotted"));
    btnHint.disabled = false;
    btnGlass.disabled = false;
  }

  /** Sweet-spot width (0–1 of track). Shrinks with time; stillness widens it. */
  function sweetWidth() {
    const elapsed = 1 - Math.max(0, state.smackDeadline - performance.now()) / state.smackDuration;
    const base = 0.34 - elapsed * 0.24; // 34% → 10% as time burns
    const stillBonus = Math.min(0.1, state.stillMs / 16000);
    const nervePenalty = (state.nerves / 100) * 0.08;
    return clamp(base + stillBonus - nervePenalty, 0.06, 0.38);
  }

  function sweetCenter() {
    // Drifts slightly under nerves so it's not a free aim
    return 0.5 + Math.sin(state.kickPhase * 0.35) * (state.nerves / 100) * 0.06;
  }

  function needleSpeed(dt) {
    const elapsed = 1 - Math.max(0, state.smackDeadline - performance.now()) / state.smackDuration;
    // Madden: gets harder — needle races more the longer you wait
    const base = 0.55 + elapsed * 1.35 + (state.nerves / 100) * 0.55;
    const stillSlow = Math.min(0.35, state.stillMs / 4500);
    return Math.max(0.35, base - stillSlow);
  }

  function kickGradeAt(pos) {
    const c = sweetCenter();
    const w = sweetWidth();
    const half = w / 2;
    const dist = Math.abs(pos - c);
    if (dist <= half * 0.35) return { grade: "PERFECT", hit: true, mult: 1 };
    if (dist <= half) return { grade: "GOOD", hit: true, mult: 0.92 };
    if (dist <= half * 1.45) return { grade: "CLOSE", hit: false, mult: 0.25 };
    return { grade: "WIDE", hit: false, mult: 0 };
  }

  function updateShameUI(ts, dt = 0.016) {
    const left = Math.max(0, state.smackDeadline - ts);
    const progress = state.smackDuration ? 1 - left / state.smackDuration : 1;
    dwellBar.style.width = (left / state.smackDuration) * 100 + "%";
    nervesBar.style.width = state.nerves + "%";

    const bpm = 55 + state.nerves * 1.1 + progress * 35;
    shamePulse.style.animationDuration = 60 / bpm + "s";
    shamePov.classList.toggle("high-nerves", state.nerves > 68 || progress > 0.65);

    // Kick needle ping-pong
    if (!state.smackBusy) {
      const speed = needleSpeed(dt);
      state.kickPhase += dt;
      state.kickNeedle += state.kickDir * speed * dt;
      if (state.kickNeedle >= 0.98) {
        state.kickNeedle = 0.98;
        state.kickDir = -1;
      } else if (state.kickNeedle <= 0.02) {
        state.kickNeedle = 0.02;
        state.kickDir = 1;
      }
    }

    const c = sweetCenter();
    const w = sweetWidth();
    kickSweet.style.left = (c - w / 2) * 100 + "%";
    kickSweet.style.width = w * 100 + "%";
    kickNeedle.style.left = state.kickNeedle * 100 + "%";
    const preview = kickGradeAt(state.kickNeedle);
    kickGrade.textContent = preview.grade;

    if (progress > 0.7) {
      shameCoach.textContent = "Buzz is eating your pulse — take the smack!";
    } else if (state.nerves > 75) {
      shameCoach.textContent = "You’re shaking. Freeze. Be stone.";
    } else if (state.nerves > 45) {
      shameCoach.textContent = "Breathing… stop the needle in the green.";
    } else {
      shameCoach.textContent = "Steady. Shame it when the needle kisses green.";
    }

    const j = (state.nerves / 100) * 14 + progress * 6;
    const t = ts / 1000;
    const jx = Math.sin(t * (3 + state.nerves / 20)) * j;
    const jy = Math.cos(t * (2.4 + state.nerves / 25)) * j * 0.75;
    shameFly.style.transform = `translate(${jx}px, ${jy}px)`;
    if (!shameArm.classList.contains("swing")) {
      const sway = (state.nerves / 100) * 2.2 + progress * 1.5;
      shameArm.style.transform = `rotate(${-8 + Math.sin(t * (bpm / 60) * Math.PI * 2) * sway}deg) translateY(${8 + sway}px)`;
    }

    window.FlyAnnouncer?.updateShameBed({
      progress,
      bpm,
      nerves: state.nerves,
    });
  }

  function updateNerves(dt) {
    const dx = state.pointer.x - state.lastPointer.x;
    const dy = state.pointer.y - state.lastPointer.y;
    const move = Math.hypot(dx, dy);
    state.lastPointer = { x: state.pointer.x, y: state.pointer.y };

    // Pointer motion (or any twitch) spikes nerves; stillness calms them
    if (move > 0.004) {
      state.nerves = clamp(state.nerves + move * cfg().twitchSpike * 40 * dt * 60, 0, 100);
      state.stillMs = 0;
    } else {
      state.stillMs += dt * 1000;
      const ease = cfg().stillEase * dt * (1 + Math.min(state.stillMs / 2000, 1.5));
      state.nerves = clamp(state.nerves - ease, 0, 100);
    }
  }

  function attemptSmack() {
    if (state.phase !== "smack" || state.paused || state.smackBusy) return;
    const fly = state.flies.find((f) => f.id === state.smackTargetId);
    if (!fly) return;

    state.smackBusy = true;
    btnSmack.disabled = true;
    shameArm.classList.remove("swing");
    void shameArm.offsetWidth;
    shameArm.classList.add("swing");
    shameArm.style.transform = "";

    const result = kickGradeAt(state.kickNeedle);
    kickGrade.textContent = result.grade;
    // Tiny RNG only on GOOD edge cases; PERFECT always lands, WIDE/CLOSE miss
    const hit =
      result.grade === "PERFECT" ||
      (result.grade === "GOOD" && Math.random() < result.mult);

    setTimeout(() => {
      if (hit) {
        splatKill(fly);
      } else {
        window.FlyAnnouncer?.line("miss", { priority: true });
        showThink(
          result.grade === "CLOSE"
            ? "CLOSE — needle clipped the edge. It bolted."
            : "WIDE — timing shattered. Buzz took your heartbeat."
        );
        smackEscaped();
      }
    }, 220);
  }

  btnSmack?.addEventListener("click", (e) => {
    e.stopPropagation();
    attemptSmack();
  });
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && state.phase === "smack") {
      e.preventDefault();
      attemptSmack();
    }
  });

  function splatKill(fly) {
    state.paused = true;
    stopLoop();
    window.FlyAnnouncer?.stopAmbient();
    state.score += 1;
    $("#score-chip").textContent = state.score + " dead";
    window.FlyAnnouncer?.killCall(state.score);

    const mark = document.createElement("div");
    mark.className = "splat-mark";
    mark.textContent = "SPLAT";
    mark.style.left = fly.x * 100 + "%";
    mark.style.top = fly.y * 100 + "%";
    mark.style.transform = "translate(-50%,-50%) rotate(" + (Math.random() * 20 - 10) + "deg)";
    $("#fx-layer").appendChild(mark);

    // gore blot
    const blot = document.createElement("div");
    blot.style.cssText = `position:absolute;left:${fly.x * 100}%;top:${fly.y * 100}%;width:28px;height:22px;margin:-11px -14px;border-radius:40% 60% 55% 45%;background:radial-gradient(circle at 40% 40%,#a84838,#5a1810 70%);opacity:0.9;pointer-events:none;z-index:7`;
    $("#fx-layer").appendChild(blot);

    fly.el.style.visibility = "hidden";
    endSmackUI();

    showOverlay(
      "Splat",
      `Crushed on the ${fly.label}. ${cfg().label} paste. ${state.score} room${state.score === 1 ? "" : "s"} cleaned.`,
      false
    );
  }

  function smackEscaped() {
    const fly = state.flies.find((f) => f.id === state.smackTargetId);
    endSmackUI();
    if (!fly) return;

    // flee to new perch — you spotted it but choked
    const next = pickPerch([fly.attractorId]);
    fly.el.classList.remove("spotted");
    fly.flying = true;
    fly.path = [
      { x: fly.x, y: fly.y },
      { x: clamp((fly.x + next.x) / 2 + 0.1, 0.08, 0.92), y: clamp(fly.y - 0.12, 0.08, 0.85) },
      { x: clamp((fly.x + next.x) / 2 - 0.08, 0.08, 0.92), y: clamp(next.y - 0.05, 0.08, 0.85) },
      { x: next.x, y: next.y },
    ];
    fly.pathT = 0;
    fly.pathSpeed = 0.9 * cfg().speed;
    fly.tx = next.x;
    fly.ty = next.y;
    fly.attractorId = next.attractorId;
    fly.label = next.label;

    // punish: shave swarm time
    state.swarmDeadline -= 8000;
    showThink("It got away. You hesitated. Now it’s somewhere worse.");
    window.FlyAnnouncer?.line("escaped", { priority: true });
  }

  function loseRound(reason) {
    state.paused = true;
    stopLoop();
    window.FlyAnnouncer?.stopAmbient();
    endSmackUI();
    window.FlyAnnouncer?.line("swarm", { priority: true, rate: 0.95, pitch: 0.65 });
    showOverlay("Swarm", reason, true);
  }

  function showOverlay(title, body, lose) {
    overlay.hidden = false;
    overlay.classList.toggle("lose", lose);
    $("#overlay-title").textContent = title;
    $("#overlay-body").textContent = body;
    $("#btn-next").textContent = lose ? "Try again" : "Next room";
    $("#btn-next").onclick = () => {
      hideOverlay();
      if (lose) startRound();
      else {
        state.sceneIndex = (state.sceneIndex + 1) % SCENES.length;
        startRound();
      }
    };
  }

  function hideOverlay() {
    overlay.hidden = true;
  }

  function triggerHint() {
    const primary = state.flies.find((f) => f.isPrimary);
    if (!primary) return;
    state.hinting = true;
    btnHint.disabled = true;

    const next = pickPerch([primary.attractorId]);
    const mid1 = {
      x: clamp(primary.x + (Math.random() - 0.5) * 0.35, 0.08, 0.92),
      y: clamp(primary.y + (Math.random() - 0.5) * 0.3, 0.1, 0.85),
    };
    const mid2 = {
      x: clamp(next.x + (Math.random() - 0.5) * 0.2, 0.08, 0.92),
      y: clamp(next.y + (Math.random() - 0.5) * 0.2, 0.1, 0.85),
    };

    primary.flying = true;
    primary.path = [{ x: primary.x, y: primary.y }, mid1, mid2, { x: next.x, y: next.y }];
    primary.pathT = 0;
    primary.pathSpeed = (0.35 + cfg().speed * 0.35) / (cfg().hintDuration / 1000);
    primary.tx = next.x;
    primary.ty = next.y;
    primary.attractorId = next.attractorId;
    primary.label = next.label;
    primary.el.classList.add("hinting");
    primary.el.style.zIndex = "6";
    primary.el.querySelectorAll(".w").forEach((w) => {
      w.style.animation = "flap-l 0.08s ease-in-out infinite alternate";
    });

    showThink("Track that disgusting path. Remember the landing.");
    window.FlyAnnouncer?.line("hint", { priority: true });

    const trail = setInterval(() => {
      if (!state.hinting) return;
      spawnTrail(primary.x, primary.y);
    }, 70);

    setTimeout(() => {
      clearInterval(trail);
      primary.flying = false;
      primary.x = primary.tx;
      primary.y = primary.ty;
      placeFly(primary);
      primary.el.classList.remove("hinting");
      primary.el.style.zIndex = "";
      primary.el.querySelectorAll(".w").forEach((w) => {
        w.style.animation = "";
      });
      state.hinting = false;
      if (state.phase !== "smack") btnHint.disabled = false;
      showThink(`It settled on the ${primary.label}. Find it. Then smash it.`);
    }, cfg().hintDuration);
  }

  function spawnTrail(x, y) {
    const d = document.createElement("div");
    d.style.cssText = `position:absolute;left:${x * 100}%;top:${y * 100}%;width:4px;height:4px;margin:-2px;border-radius:50%;background:rgba(214,222,42,0.55);pointer-events:none`;
    $("#fx-layer").appendChild(d);
    d.animate([{ opacity: 0.7, transform: "scale(1)" }, { opacity: 0, transform: "scale(0.2)" }], {
      duration: 420,
    }).onfinish = () => d.remove();
  }

  function bezier(pts, t) {
    const [p0, p1, p2, p3] = pts;
    const u = 1 - t;
    const x =
      u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x;
    const y =
      u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y;
    return { x, y };
  }

  function replicate() {
    const used = state.flies.map((f) => f.attractorId);
    const perch = pickPerch(used.length >= scene().attractors.length ? [] : used);
    const primary = state.flies.find((f) => f.isPrimary);
    const spawn = {
      ...perch,
      x: clamp((primary?.x ?? 0.5) + (Math.random() - 0.5) * 0.08, 0.06, 0.94),
      y: clamp((primary?.y ?? 0.5) + (Math.random() - 0.5) * 0.08, 0.08, 0.9),
    };
    const replica = makeFly({ isPrimary: false, perch: spawn });
    replica.tx = perch.x;
    replica.ty = perch.y;
    replica.flying = true;
    replica.path = [
      { x: replica.x, y: replica.y },
      { x: (replica.x + perch.x) / 2 + 0.05, y: (replica.y + perch.y) / 2 - 0.08 },
      { x: (replica.x + perch.x) / 2 - 0.04, y: (replica.y + perch.y) / 2 + 0.05 },
      { x: perch.x, y: perch.y },
    ];
    replica.pathT = 0;
    replica.pathSpeed = 0.55 * cfg().speed;
    replica.attractorId = perch.attractorId;
    replica.label = perch.label;
    state.flies.push(replica);
    showThink("It split. Kill the original before the room fills with wings.");
    window.FlyAnnouncer?.line("replica", { priority: true });
  }

  function startLoop() {
    cancelAnimationFrame(state.raf);
    const tick = (ts) => {
      if (state.paused) return;
      const dt = Math.min(0.05, (ts - state.lastTs) / 1000 || 0.016);
      state.lastTs = ts;
      updateFlies(dt, ts);
      updateTimer(ts);
      if (state.phase === "smack") {
        updateNerves(dt);
        updateShameUI(ts, dt);
        if (!state.smackBusy && ts >= state.smackDeadline) smackEscaped();
      } else if (state.magnifierOn && state.pointer.over) {
        updateMagnifier();
      }
      state.raf = requestAnimationFrame(tick);
    };
    state.raf = requestAnimationFrame(tick);
  }

  function stopLoop() {
    cancelAnimationFrame(state.raf);
  }

  function updateFlies(dt, ts) {
    for (const fly of state.flies) {
      if (fly.flying && fly.path) {
        fly.pathT += fly.pathSpeed * dt;
        const t = Math.min(1, fly.pathT);
        const p = bezier(fly.path, t);
        fly.x = p.x;
        fly.y = p.y;
        placeFly(fly);
        fly.el.style.transform = `translate(-50%, -50%) translate(${Math.sin(ts / 40) * 1.2}px, ${Math.cos(ts / 33) * 1.2}px)`;
        if (t >= 1) {
          fly.flying = false;
          fly.x = fly.tx;
          fly.y = fly.ty;
          fly.el.style.transform = "translate(-50%, -50%)";
          placeFly(fly);
        }
      }
    }
  }

  function updateTimer(ts) {
    const left =
      state.phase === "smack" && state.swarmFrozenLeft != null
        ? state.swarmFrozenLeft
        : Math.max(0, state.swarmDeadline - ts);
    const sec = Math.ceil(left / 1000);
    const m = Math.floor(sec / 60);
    const s = String(sec % 60).padStart(2, "0");
    const chip = $("#timer-chip");
    chip.textContent = `${m}:${s}`;
    chip.classList.toggle("danger", sec <= 12);
    if (sec <= 12 && sec > 0 && !window.FlyAnnouncer?.spokeTimeLow) {
      if (window.FlyAnnouncer) window.FlyAnnouncer.spokeTimeLow = true;
      window.FlyAnnouncer?.line("timeLow", { priority: true });
    }

    if (state.phase === "smack") return;

    if (left <= 0) {
      loseRound("Too slow — the swarm took the room. That buzzing is forever now.");
      return;
    }

    const replicas = state.flies.length - 1;
    if (ts >= state.replicaAt && replicas < cfg().maxReplicas && !state.hinting) {
      replicate();
      state.replicaAt = ts + cfg().replicaInterval * 1000;
    }
  }

  function updateMagnifier() {
    if (!state.magnifierOn || state.phase === "smack") {
      magnifier.hidden = true;
      return;
    }
    if (!state.pointer.over) {
      magnifier.hidden = true;
      return;
    }
    magnifier.hidden = false;
    const rect = stage.getBoundingClientRect();
    const px = state.pointer.x;
    const py = state.pointer.y;
    magnifier.style.left = px * 100 + "%";
    magnifier.style.top = py * 100 + "%";

    const zoom =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--mag-zoom")) || 2.15;
    const magSize = magLens.clientWidth || 160;

    let inner = magLens.querySelector(".mag-inner");
    if (!inner) {
      magLens.innerHTML = "";
      inner = document.createElement("div");
      inner.className = "mag-inner";
      magLens.appendChild(inner);
    }
    let scaled = inner.querySelector(".mag-scaled");
    if (!scaled) {
      scaled = document.createElement("div");
      scaled.className = "mag-scaled";
      inner.appendChild(scaled);
    }

    scaled.innerHTML = "";
    const sceneClone = sceneRoot.cloneNode(true);
    const fliesClone = fliesLayer.cloneNode(true);
    fliesClone.querySelectorAll("button").forEach((b) => {
      b.disabled = true;
      b.tabIndex = -1;
      b.style.pointerEvents = "none";
    });
    const wrap = document.createElement("div");
    wrap.style.cssText = `position:relative;width:${rect.width}px;height:${rect.height}px`;
    sceneClone.style.cssText = "position:absolute;inset:0";
    fliesClone.style.cssText = "position:absolute;inset:0;pointer-events:none";
    wrap.appendChild(sceneClone);
    wrap.appendChild(fliesClone);
    scaled.appendChild(wrap);

    scaled.style.width = rect.width + "px";
    scaled.style.height = rect.height + "px";
    const ox = magSize / 2 - px * rect.width * zoom;
    const oy = magSize / 2 - py * rect.height * zoom;
    scaled.style.transform = `translate(${ox}px, ${oy}px) scale(${zoom})`;
  }

  function pointerFromEvent(e, el) {
    const target = el || stage;
    const rect = target.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    state.pointer.x = clamp((clientX - rect.left) / rect.width, 0, 1);
    state.pointer.y = clamp((clientY - rect.top) / rect.height, 0, 1);
    state.pointer.over = true;
  }

  stage.addEventListener("pointermove", (e) => {
    if (state.phase === "smack") return;
    pointerFromEvent(e);
    if (state.magnifierOn) updateMagnifier();
  });
  stage.addEventListener("pointerenter", (e) => {
    if (state.phase === "smack") return;
    pointerFromEvent(e);
    if (state.magnifierOn) updateMagnifier();
  });
  stage.addEventListener("pointerleave", () => {
    if (state.phase === "smack") return;
    state.pointer.over = false;
    if (state.magnifierOn) magnifier.hidden = true;
  });

  // During shame lock, any pointer motion spikes nerves
  shamePov.addEventListener("pointermove", (e) => {
    if (state.phase !== "smack") return;
    pointerFromEvent(e, shamePov);
  });

  stage.addEventListener("click", (e) => {
    if (state.paused || state.hinting || state.phase === "smack") return;
    if (!state.magnifierOn) return;
    const rect = stage.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const pad = cfg().hitPadding / rect.width;
    const hit = state.flies.find((f) => {
      const hitR = (cfg().size / rect.width) * 0.6 + pad;
      return Math.hypot(f.x - x, f.y - y) < hitR;
    });
    if (hit) onFlyClick(hit.id);
  });

  window.addEventListener("resize", () => {
    if (state.magnifierOn) updateMagnifier();
  });

  /* ── Scene SVGs (filthier) ── */
  function kitchenSVG() {
    return `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="k-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#c4a878"/>
          <stop offset="100%" stop-color="#a89068"/>
        </linearGradient>
        <radialGradient id="k-lamp" cx="78%" cy="18%" r="35%">
          <stop offset="0%" stop-color="#ffe29a" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#ffe29a" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill="url(#k-wall)"/>
      <rect x="0" y="320" width="800" height="180" fill="#5a4838"/>
      <rect x="0" y="300" width="800" height="28" fill="#3a2e24"/>
      <ellipse cx="420" cy="318" rx="90" ry="12" fill="#6a5040" opacity="0.45"/>
      <ellipse cx="520" cy="312" rx="40" ry="8" fill="#4a3828" opacity="0.35"/>
      <rect x="60" y="40" width="160" height="140" rx="4" fill="#7ab0c0"/>
      <path d="M60 110 H220 M140 40 V180" stroke="#e8dcc0" stroke-width="6"/>
      <rect x="52" y="40" width="176" height="148" fill="none" stroke="#4a3828" stroke-width="8"/>
      <rect x="40" y="328" width="200" height="140" fill="#3a4a32"/>
      <rect x="250" y="328" width="220" height="140" fill="#42543a"/>
      <rect x="480" y="328" width="280" height="140" fill="#3a4a32"/>
      <rect x="260" y="250" width="140" height="55" rx="3" fill="#2a2a2a"/>
      <circle cx="295" cy="275" r="16" fill="#1a1a1a" stroke="#444" stroke-width="3"/>
      <circle cx="365" cy="275" r="16" fill="#1a1a1a" stroke="#444" stroke-width="3"/>
      <ellipse cx="385" cy="310" rx="50" ry="18" fill="#8a9898"/>
      <ellipse cx="500" cy="295" rx="42" ry="14" fill="#5a4030"/>
      <circle cx="485" cy="278" r="14" fill="#c04030"/>
      <circle cx="505" cy="272" r="13" fill="#d8b040"/>
      <circle cx="520" cy="282" r="12" fill="#5a8a30"/>
      <circle cx="498" cy="268" r="3" fill="#2a1810" opacity="0.5"/>
      <rect x="90" y="360" width="55" height="70" rx="4" fill="#283028"/>
      <ellipse cx="117" cy="360" rx="28" ry="8" fill="#3a453a"/>
      <line x1="624" y1="0" x2="624" y2="70" stroke="#333" stroke-width="3"/>
      <path d="M590 70 H658 L644 110 H604 Z" fill="#2a241c"/>
      <circle cx="624" cy="118" r="10" fill="#ffe29a"/>
      <rect width="800" height="500" fill="url(#k-lamp)"/>
      <circle cx="470" cy="312" r="2.5" fill="#5a3a20"/>
      <circle cx="540" cy="308" r="2" fill="#5a3a20"/>
      <circle cx="330" cy="318" r="2.5" fill="#4a3020"/>
      <circle cx="355" cy="305" r="1.5" fill="#3a2818"/>
      <text x="70" y="490" fill="rgba(0,0,0,0.3)" font-size="13" font-family="IBM Plex Mono,monospace">sticky rings · fruit flies dream here · don’t lick the counter</text>
    </svg>`;
  }

  function livingSVG() {
    return `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="l-lamp" cx="16%" cy="40%" r="40%">
          <stop offset="0%" stop-color="#ffd27a" stop-opacity="0.48"/>
          <stop offset="100%" stop-color="#ffd27a" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="l-tv" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#6ab0d8"/>
          <stop offset="100%" stop-color="#2a4a6a"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="#3a4a42"/>
      <rect x="0" y="360" width="800" height="140" fill="#4a3a2c"/>
      <rect x="180" y="280" width="320" height="110" rx="18" fill="#5a3834"/>
      <rect x="200" y="260" width="120" height="40" rx="10" fill="#6a4440"/>
      <rect x="360" y="260" width="120" height="40" rx="10" fill="#6a4440"/>
      <ellipse cx="440" cy="310" rx="36" ry="12" fill="#d8d0c0"/>
      <circle cx="430" cy="305" r="8" fill="#b04030"/>
      <rect x="448" y="300" width="18" height="6" rx="2" fill="#d0a830"/>
      <line x1="120" y1="200" x2="120" y2="380" stroke="#2a241c" stroke-width="6"/>
      <path d="M80 200 Q120 140 160 200" fill="#e8d8b0" opacity="0.9"/>
      <circle cx="120" cy="195" r="8" fill="#ffe29a"/>
      <rect x="560" y="120" width="180" height="110" rx="6" fill="#1a1a1a"/>
      <rect x="570" y="130" width="160" height="90" fill="url(#l-tv)"/>
      <rect x="620" y="230" width="60" height="40" fill="#333"/>
      <rect x="680" y="330" width="90" height="50" rx="4" fill="#7a8080"/>
      <g stroke="#5a6060" stroke-width="3">
        <line x1="695" y1="335" x2="695" y2="375"/><line x1="710" y1="335" x2="710" y2="375"/>
        <line x1="725" y1="335" x2="725" y2="375"/><line x1="740" y1="335" x2="740" y2="375"/>
        <line x1="755" y1="335" x2="755" y2="375"/>
      </g>
      <rect x="240" y="300" width="28" height="32" fill="#7a5a3a"/>
      <ellipse cx="254" cy="285" rx="22" ry="28" fill="#2a5a32"/>
      <rect width="800" height="500" fill="url(#l-lamp)"/>
      <text x="40" y="490" fill="rgba(255,255,255,0.18)" font-size="13" font-family="IBM Plex Mono,monospace">blanket nest · last slice · remote batteries</text>
    </svg>`;
  }

  function bedroomSVG() {
    return `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="b-lamp" cx="20%" cy="45%" r="35%">
          <stop offset="0%" stop-color="#ffcc77" stop-opacity="0.52"/>
          <stop offset="100%" stop-color="#ffcc77" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill="#322c40"/>
      <rect x="0" y="340" width="800" height="160" fill="#221c30"/>
      <rect x="80" y="250" width="380" height="160" rx="8" fill="#4a5a72"/>
      <rect x="100" y="220" width="140" height="50" rx="10" fill="#c8c0b0"/>
      <rect x="260" y="230" width="140" height="40" rx="10" fill="#c0b8a8"/>
      <rect x="40" y="300" width="70" height="70" fill="#3a2e22"/>
      <rect x="62" y="250" width="10" height="50" fill="#2a241c"/>
      <circle cx="67" cy="245" r="22" fill="#e8d8b0"/>
      <circle cx="67" cy="245" r="8" fill="#ffe29a"/>
      <rect x="95" y="285" width="16" height="22" rx="2" fill="#98c4d8" opacity="0.7"/>
      <rect x="420" y="270" width="110" height="70" rx="4" fill="#1a1a1a"/>
      <rect x="428" y="278" width="94" height="54" fill="#5a8ab8"/>
      <rect x="580" y="60" width="160" height="180" fill="#b06848"/>
      <path d="M580 150 H740 M660 60 V240" stroke="#2a2030" stroke-width="8"/>
      <rect x="572" y="52" width="176" height="196" fill="none" stroke="#1a1420" stroke-width="10"/>
      <ellipse cx="700" cy="390" rx="45" ry="20" fill="#5a4a3a"/>
      <path d="M655 390 Q700 300 745 390" fill="#7a6a5a"/>
      <rect width="800" height="500" fill="url(#b-lamp)"/>
      <text x="40" y="490" fill="rgba(255,255,255,0.16)" font-size="13" font-family="IBM Plex Mono,monospace">open book · charging cable · don’t ask about the glass</text>
    </svg>`;
  }

  function patioSVG() {
    return `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="p-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#5a8aa0"/>
          <stop offset="100%" stop-color="#a8c4a8"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#p-sky)"/>
      <rect x="0" y="300" width="800" height="200" fill="#6a7a4a"/>
      <rect x="0" y="300" width="800" height="20" fill="#4a5a38"/>
      <ellipse cx="400" cy="340" rx="180" ry="50" fill="#7a5a3a"/>
      <rect x="280" y="340" width="16" height="90" fill="#5a4028"/>
      <rect x="504" y="340" width="16" height="90" fill="#5a4028"/>
      <rect x="360" y="290" width="36" height="40" rx="3" fill="#7a1818"/>
      <rect x="360" y="286" width="36" height="8" fill="#d8ccb0"/>
      <ellipse cx="378" cy="286" rx="18" ry="5" fill="#e8e0d0"/>
      <circle cx="430" cy="310" r="16" fill="#e09028"/>
      <rect x="310" y="300" width="28" height="32" rx="4" fill="#d8d0c0"/>
      <path d="M338 308 Q352 316 338 328" fill="none" stroke="#d8d0c0" stroke-width="4"/>
      <rect x="620" y="280" width="100" height="70" rx="6" fill="#2a2a2a"/>
      <rect x="630" y="250" width="80" height="30" fill="#444"/>
      <rect x="655" y="350" width="30" height="50" fill="#333"/>
      <path d="M40 80 Q220 140 400 70 Q580 20 760 100" fill="none" stroke="#3a3a3a" stroke-width="2"/>
      <g fill="#ffe29a">
        <circle cx="100" cy="95" r="6"/><circle cx="200" cy="118" r="6"/>
        <circle cx="300" cy="95" r="6"/><circle cx="400" cy="72" r="6"/>
        <circle cx="500" cy="55" r="6"/><circle cx="600" cy="62" r="6"/>
        <circle cx="700" cy="88" r="6"/>
      </g>
      <rect x="20" y="200" width="120" height="12" fill="#4a3a2a"/>
      <rect x="30" y="212" width="8" height="90" fill="#4a3a2a"/>
      <rect x="120" y="212" width="8" height="90" fill="#4a3a2a"/>
      <text x="40" y="490" fill="rgba(0,0,0,0.28)" font-size="13" font-family="IBM Plex Mono,monospace">sticky spoon · open sugar · jam crime scene</text>
    </svg>`;
  }
})();
