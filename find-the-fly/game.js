(() => {
  "use strict";

  const DIFFICULTY = {
    easy: {
      label: "Housefly",
      size: 28,
      speed: 0.55,
      tempF: 78,
      swarmSeconds: 75,
      replicaInterval: 14,
      maxReplicas: 4,
      hintDuration: 3200,
      hitPadding: 14,
    },
    normal: {
      label: "Busy bee",
      size: 16,
      speed: 1.05,
      tempF: 64,
      swarmSeconds: 55,
      replicaInterval: 10,
      maxReplicas: 7,
      hintDuration: 2600,
      hitPadding: 10,
    },
    hard: {
      label: "Fruit flea",
      size: 9,
      speed: 1.65,
      tempF: 52,
      swarmSeconds: 40,
      replicaInterval: 7,
      maxReplicas: 12,
      hintDuration: 2000,
      hitPadding: 8,
    },
  };

  /** Attractors weight how a fly chooses a perch */
  const SCENES = [
    {
      id: "kitchen",
      name: "Sunday kitchen",
      think: "Warm crumbs beat a cold windowsill. Check the fruit bowl and the sticky counter under the lamp.",
      coldThink: "Cold kitchen — it will hug the toaster glow and anything sweet left out.",
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
      name: "Messy living room",
      think: "Lamp pools and snack plates are magnets. Sofa crumbs are a classic.",
      coldThink: "Drafty room — expect radiator heat or the TV glow before bare walls.",
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
      name: "Bedroom at dusk",
      think: "Bedside lamp and the water glass. Flies love damp rims.",
      coldThink: "Cold flat — laptop exhaust and under-blanket warmth win over open windows.",
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
      name: "Back-porch brunch",
      think: "Open jam jar and the citrus wedge. Shade vs sun — flies often sit the rim.",
      coldThink: "Chilly porch — grill residual heat and warm drinks beat the railing.",
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
    hinting: false,
    magnifierOn: false,
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
      startRound();
      go("play");
    });
  });

  $("#btn-menu").addEventListener("click", () => {
    stopLoop();
    hideOverlay();
    state.magnifierOn = false;
    syncGlassBtn();
    go("title");
  });

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

  btnGlass.addEventListener("click", () => {
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
    if (state.paused || state.hinting) return;
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

  /** Score attractors for current climate */
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
    // Soft-max-ish: bias top choices but allow variety
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
      <ellipse class="w" cx="10" cy="14" rx="9" ry="5" fill="rgba(220,230,210,0.45)"/>
      <ellipse class="w" cx="30" cy="14" rx="9" ry="5" fill="rgba(220,230,210,0.45)"/>
      <ellipse cx="20" cy="16" rx="7" ry="5" fill="#1a1612"/>
      <circle cx="25" cy="13.5" r="2.2" fill="#2a241c"/>
      <circle cx="25.7" cy="13" r="0.7" fill="#c8f06a"/>
    </svg>`;
  }

  function makeFly({ isPrimary, perch }) {
    const id = "f_" + Math.random().toString(36).slice(2, 9);
    const el = document.createElement("button");
    el.type = "button";
    el.className = "fly-target" + (isPrimary ? "" : " replica");
    el.dataset.id = id;
    el.setAttribute("aria-label", isPrimary ? "Possible fly" : "Replica fly");
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
    hideOverlay();
    state.paused = false;
    state.hinting = false;
    state.flies = [];
    state.primaryId = null;
    fliesLayer.innerHTML = "";
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
    $("#score-chip").textContent = state.score + " found";
    showThink(isCold() ? scene().coldThink : scene().think);

    btnHint.disabled = false;
    startLoop();
    updateMagnifier();
  }

  function showThink(text) {
    thinkHint.textContent = text;
    thinkHint.classList.add("show");
    clearTimeout(showThink._t);
    showThink._t = setTimeout(() => thinkHint.classList.remove("show"), 5200);
  }

  function onFlyClick(id) {
    if (state.paused || state.hinting) return;
    const fly = state.flies.find((f) => f.id === id);
    if (!fly) return;
    if (fly.isPrimary) {
      winRound(fly);
    } else {
      // Decoy buzz
      fly.el.animate(
        [{ transform: "translate(-50%,-50%) scale(1)" }, { transform: "translate(-50%,-50%) scale(1.35)" }, { transform: "translate(-50%,-50%) scale(1)" }],
        { duration: 220 }
      );
      showThink("Decoy. The original is still hiding — follow the heat and the crumbs.");
    }
  }

  function winRound(fly) {
    state.paused = true;
    stopLoop();
    state.score += 1;
    $("#score-chip").textContent = state.score + " found";
    flashCatch(fly);
    showOverlay(
      "Caught it",
      `Pinned on the ${fly.label}. ${cfg().label} down — ${state.score} room${state.score === 1 ? "" : "s"} cleared.`,
      false
    );
  }

  function loseRound(reason) {
    state.paused = true;
    stopLoop();
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

  function flashCatch(fly) {
    const ring = document.createElement("div");
    ring.style.cssText = `position:absolute;left:${fly.x * 100}%;top:${fly.y * 100}%;width:40px;height:40px;margin:-20px;border:2px solid #c8f06a;border-radius:50%;pointer-events:none;z-index:5`;
    $("#fx-layer").appendChild(ring);
    ring.animate(
      [{ transform: "scale(0.4)", opacity: 1 }, { transform: "scale(2.2)", opacity: 0 }],
      { duration: 500, easing: "ease-out" }
    ).onfinish = () => ring.remove();
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
    primary.path = [ { x: primary.x, y: primary.y }, mid1, mid2, { x: next.x, y: next.y } ];
    primary.pathT = 0;
    primary.pathSpeed = (0.35 + cfg().speed * 0.35) / (cfg().hintDuration / 1000);
    primary.tx = next.x;
    primary.ty = next.y;
    primary.attractorId = next.attractorId;
    primary.label = next.label;
    primary.el.classList.add("hinting");
    primary.el.style.zIndex = "6";

    // Wing flap amp while hinting
    primary.el.querySelectorAll(".w").forEach((w) => {
      w.style.animation = "flap-l 0.08s ease-in-out infinite alternate";
    });

    showThink("Track it — then guess the landing. Light, food, or warmth?");

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
      btnHint.disabled = false;
      showThink(`Settled near the ${primary.label}. Use the glass if you need a closer look.`);
    }, cfg().hintDuration);
  }

  function spawnTrail(x, y) {
    const d = document.createElement("div");
    d.style.cssText = `position:absolute;left:${x * 100}%;top:${y * 100}%;width:4px;height:4px;margin:-2px;border-radius:50%;background:rgba(200,240,106,0.55);pointer-events:none`;
    $("#fx-layer").appendChild(d);
    d.animate([{ opacity: 0.7, transform: "scale(1)" }, { opacity: 0, transform: "scale(0.2)" }], {
      duration: 420,
    }).onfinish = () => d.remove();
  }

  function bezier(pts, t) {
    // De Casteljau for 4 points
    const [p0, p1, p2, p3] = pts;
    const u = 1 - t;
    const x =
      u * u * u * p0.x +
      3 * u * u * t * p1.x +
      3 * u * t * t * p2.x +
      t * t * t * p3.x;
    const y =
      u * u * u * p0.y +
      3 * u * u * t * p1.y +
      3 * u * t * t * p2.y +
      t * t * t * p3.y;
    return { x, y };
  }

  function replicate() {
    const used = state.flies.map((f) => f.attractorId);
    const perch = pickPerch(used.length >= scene().attractors.length ? [] : used);
    // Spawn near primary then drift
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
    showThink("It split. Find the original before the room fills up.");
  }

  function startLoop() {
    cancelAnimationFrame(state.raf);
    const tick = (ts) => {
      if (state.paused) return;
      const dt = Math.min(0.05, (ts - state.lastTs) / 1000 || 0.016);
      state.lastTs = ts;
      updateFlies(dt);
      updateTimer(ts);
      if (state.magnifierOn && state.pointer.over) updateMagnifier();
      state.raf = requestAnimationFrame(tick);
    };
    state.raf = requestAnimationFrame(tick);
  }

  function stopLoop() {
    cancelAnimationFrame(state.raf);
  }

  function updateFlies(dt) {
    for (const fly of state.flies) {
      if (!fly.flying || !fly.path) continue;
      fly.pathT += fly.pathSpeed * dt;
      const t = Math.min(1, fly.pathT);
      const p = bezier(fly.path, t);
      fly.x = p.x;
      fly.y = p.y;
      placeFly(fly);
      // Micro buzz
      fly.el.style.transform = `translate(-50%, -50%) translate(${Math.sin(performance.now() / 40) * 1.2}px, ${Math.cos(performance.now() / 33) * 1.2}px)`;
      if (t >= 1) {
        fly.flying = false;
        fly.x = fly.tx;
        fly.y = fly.ty;
        fly.el.style.transform = "translate(-50%, -50%)";
        placeFly(fly);
      }
    }
  }

  function updateTimer(ts) {
    const left = Math.max(0, state.swarmDeadline - ts);
    const sec = Math.ceil(left / 1000);
    const m = Math.floor(sec / 60);
    const s = String(sec % 60).padStart(2, "0");
    const chip = $("#timer-chip");
    chip.textContent = `${m}:${s}`;
    chip.classList.toggle("danger", sec <= 12);

    if (left <= 0) {
      loseRound("Too slow — the swarm took the room. Next time, think where the fly wants to be.");
      return;
    }

    const replicas = state.flies.length - 1;
    if (ts >= state.replicaAt && replicas < cfg().maxReplicas && !state.hinting) {
      replicate();
      state.replicaAt = ts + cfg().replicaInterval * 1000;
    }
  }

  /* ── Magnifier: clone scene+flies into lens, scale around pointer ── */
  function updateMagnifier() {
    if (!state.magnifierOn) {
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

    const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--mag-zoom")) || 2.15;
    const magSize = magLens.clientWidth || 160;

    // Build / refresh clone
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

    // Snapshot approach: clone current scene root + flies as HTML
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

  function pointerFromEvent(e) {
    const rect = stage.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    state.pointer.x = clamp((clientX - rect.left) / rect.width, 0, 1);
    state.pointer.y = clamp((clientY - rect.top) / rect.height, 0, 1);
    state.pointer.over = true;
  }

  stage.addEventListener("pointermove", (e) => {
    pointerFromEvent(e);
    if (state.magnifierOn) updateMagnifier();
  });
  stage.addEventListener("pointerenter", (e) => {
    pointerFromEvent(e);
    if (state.magnifierOn) updateMagnifier();
  });
  stage.addEventListener("pointerleave", () => {
    state.pointer.over = false;
    if (state.magnifierOn) magnifier.hidden = true;
  });

  // Click through magnifier: hit-test primary by distance in stage space
  stage.addEventListener("click", (e) => {
    if (!state.magnifierOn || state.paused || state.hinting) return;
    const rect = stage.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const pad = cfg().hitPadding / rect.width;
    const hit = state.flies.find((f) => {
      const dx = f.x - x;
      const dy = f.y - y;
      const hitR = (cfg().size / rect.width) * 0.6 + pad;
      return Math.hypot(dx, dy) < hitR;
    });
    if (hit) onFlyClick(hit.id);
  });

  /* ── Scene SVGs ── */
  function kitchenSVG() {
    return `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="k-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d8c4a4"/>
          <stop offset="100%" stop-color="#c4ad88"/>
        </linearGradient>
        <radialGradient id="k-lamp" cx="78%" cy="18%" r="35%">
          <stop offset="0%" stop-color="#ffe29a" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="#ffe29a" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill="url(#k-wall)"/>
      <rect x="0" y="320" width="800" height="180" fill="#6b5844"/>
      <rect x="0" y="300" width="800" height="28" fill="#4a3b2e"/>
      <!-- window -->
      <rect x="60" y="40" width="160" height="140" rx="4" fill="#8ec4d4"/>
      <path d="M60 110 H220 M140 40 V180" stroke="#fff8e8" stroke-width="6"/>
      <rect x="52" y="40" width="176" height="148" fill="none" stroke="#5a4636" stroke-width="8"/>
      <!-- cabinets -->
      <rect x="40" y="328" width="200" height="140" fill="#3d4f3a"/>
      <rect x="250" y="328" width="220" height="140" fill="#455843"/>
      <rect x="480" y="328" width="280" height="140" fill="#3d4f3a"/>
      <circle cx="220" cy="400" r="4" fill="#c8b48a"/>
      <circle cx="450" cy="400" r="4" fill="#c8b48a"/>
      <!-- stove -->
      <rect x="260" y="250" width="140" height="55" rx="3" fill="#2a2a2a"/>
      <circle cx="295" cy="275" r="16" fill="#1a1a1a" stroke="#444" stroke-width="3"/>
      <circle cx="365" cy="275" r="16" fill="#1a1a1a" stroke="#444" stroke-width="3"/>
      <rect x="300" y="220" width="60" height="30" fill="#888" opacity="0.35"/>
      <!-- sink -->
      <ellipse cx="385" cy="310" rx="50" ry="18" fill="#9aa8b0"/>
      <rect x="370" y="280" width="10" height="30" fill="#777"/>
      <!-- fruit bowl -->
      <ellipse cx="500" cy="295" rx="42" ry="14" fill="#5a4030"/>
      <circle cx="485" cy="278" r="14" fill="#d4553a"/>
      <circle cx="505" cy="272" r="13" fill="#e8c84a"/>
      <circle cx="520" cy="282" r="12" fill="#6a9e3a"/>
      <!-- trash -->
      <rect x="90" y="360" width="55" height="70" rx="4" fill="#303830"/>
      <ellipse cx="117" cy="360" rx="28" ry="8" fill="#3a453a"/>
      <!-- pendant -->
      <line x1="624" y1="0" x2="624" y2="70" stroke="#333" stroke-width="3"/>
      <path d="M590 70 H658 L644 110 H604 Z" fill="#2a241c"/>
      <circle cx="624" cy="118" r="10" fill="#ffe29a"/>
      <rect width="800" height="500" fill="url(#k-lamp)"/>
      <!-- clutter crumbs -->
      <circle cx="470" cy="312" r="2" fill="#8a6a40"/>
      <circle cx="540" cy="308" r="1.5" fill="#8a6a40"/>
      <circle cx="330" cy="318" r="2" fill="#6a5a40"/>
      <text x="70" y="490" fill="rgba(0,0,0,0.25)" font-size="14" font-family="IBM Plex Sans,sans-serif">crumbs · sticky rings · last night's plates</text>
    </svg>`;
  }

  function livingSVG() {
    return `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="l-lamp" cx="16%" cy="40%" r="40%">
          <stop offset="0%" stop-color="#ffd27a" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#ffd27a" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="l-tv" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#7ec8ff"/>
          <stop offset="100%" stop-color="#3a6a9a"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="#4a5a52"/>
      <rect x="0" y="360" width="800" height="140" fill="#5c4a38"/>
      <!-- sofa -->
      <rect x="180" y="280" width="320" height="110" rx="18" fill="#6b3f3a"/>
      <rect x="200" y="260" width="120" height="40" rx="10" fill="#7a4a44"/>
      <rect x="360" y="260" width="120" height="40" rx="10" fill="#7a4a44"/>
      <!-- plate -->
      <ellipse cx="440" cy="310" rx="36" ry="12" fill="#e8e0d0"/>
      <circle cx="430" cy="305" r="8" fill="#c45"/>
      <rect x="448" y="300" width="18" height="6" rx="2" fill="#e8c84a"/>
      <!-- floor lamp -->
      <line x1="120" y1="200" x2="120" y2="380" stroke="#2a241c" stroke-width="6"/>
      <path d="M80 200 Q120 140 160 200" fill="#f5e6c0" opacity="0.9"/>
      <circle cx="120" cy="195" r="8" fill="#ffe29a"/>
      <!-- TV -->
      <rect x="560" y="120" width="180" height="110" rx="6" fill="#1a1a1a"/>
      <rect x="570" y="130" width="160" height="90" fill="url(#l-tv)"/>
      <rect x="620" y="230" width="60" height="40" fill="#333"/>
      <!-- radiator -->
      <rect x="680" y="330" width="90" height="50" rx="4" fill="#8a9090"/>
      <g stroke="#6a7070" stroke-width="3">
        <line x1="695" y1="335" x2="695" y2="375"/><line x1="710" y1="335" x2="710" y2="375"/>
        <line x1="725" y1="335" x2="725" y2="375"/><line x1="740" y1="335" x2="740" y2="375"/>
        <line x1="755" y1="335" x2="755" y2="375"/>
      </g>
      <!-- plant -->
      <rect x="240" y="300" width="28" height="32" fill="#8a5a3a"/>
      <ellipse cx="254" cy="285" rx="22" ry="28" fill="#2f6b3a"/>
      <rect width="800" height="500" fill="url(#l-lamp)"/>
      <text x="40" y="490" fill="rgba(255,255,255,0.2)" font-size="14" font-family="IBM Plex Sans,sans-serif">remote batteries · blanket nest · last slice</text>
    </svg>`;
  }

  function bedroomSVG() {
    return `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="b-lamp" cx="20%" cy="45%" r="35%">
          <stop offset="0%" stop-color="#ffcc77" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="#ffcc77" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill="#3a3550"/>
      <rect x="0" y="340" width="800" height="160" fill="#2a2438"/>
      <!-- bed -->
      <rect x="80" y="250" width="380" height="160" rx="8" fill="#5a6a8a"/>
      <rect x="100" y="220" width="140" height="50" rx="10" fill="#d8d0c0"/>
      <rect x="260" y="230" width="140" height="40" rx="10" fill="#d0c8b8"/>
      <!-- nightstand + lamp -->
      <rect x="40" y="300" width="70" height="70" fill="#4a3a2a"/>
      <rect x="62" y="250" width="10" height="50" fill="#2a241c"/>
      <circle cx="67" cy="245" r="22" fill="#f5e6c0"/>
      <circle cx="67" cy="245" r="8" fill="#ffe29a"/>
      <!-- glass -->
      <rect x="95" y="285" width="16" height="22" rx="2" fill="#a8d4e8" opacity="0.7"/>
      <!-- laptop -->
      <rect x="420" y="270" width="110" height="70" rx="4" fill="#1a1a1a"/>
      <rect x="428" y="278" width="94" height="54" fill="#6a9ecc"/>
      <!-- window dusk -->
      <rect x="580" y="60" width="160" height="180" fill="#c47a5a"/>
      <path d="M580 150 H740 M660 60 V240" stroke="#3a2a40" stroke-width="8"/>
      <rect x="572" y="52" width="176" height="196" fill="none" stroke="#2a2030" stroke-width="10"/>
      <!-- hamper -->
      <ellipse cx="700" cy="390" rx="45" ry="20" fill="#6a5a4a"/>
      <path d="M655 390 Q700 300 745 390" fill="#8a7a6a"/>
      <rect width="800" height="500" fill="url(#b-lamp)"/>
      <text x="40" y="490" fill="rgba(255,255,255,0.18)" font-size="14" font-family="IBM Plex Sans,sans-serif">sock under the bed · open book · charging cable</text>
    </svg>`;
  }

  function patioSVG() {
    return `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="p-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#6a9eb8"/>
          <stop offset="100%" stop-color="#b8d4c0"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#p-sky)"/>
      <rect x="0" y="300" width="800" height="200" fill="#7a8a5a"/>
      <rect x="0" y="300" width="800" height="20" fill="#5a6a45"/>
      <!-- table -->
      <ellipse cx="400" cy="340" rx="180" ry="50" fill="#8a6a48"/>
      <rect x="280" y="340" width="16" height="90" fill="#6a4e34"/>
      <rect x="504" y="340" width="16" height="90" fill="#6a4e34"/>
      <!-- jam -->
      <rect x="360" y="290" width="36" height="40" rx="3" fill="#8B1E1E"/>
      <rect x="360" y="286" width="36" height="8" fill="#e8dcc8"/>
      <ellipse cx="378" cy="286" rx="18" ry="5" fill="#f5efe0"/>
      <!-- citrus -->
      <circle cx="430" cy="310" r="16" fill="#f0a030"/>
      <path d="M430 294 L430 326 M414 310 H446" stroke="#e89020" stroke-width="2"/>
      <!-- mug -->
      <rect x="310" y="300" width="28" height="32" rx="4" fill="#e8e0d0"/>
      <path d="M338 308 Q352 316 338 328" fill="none" stroke="#e8e0d0" stroke-width="4"/>
      <!-- grill -->
      <rect x="620" y="280" width="100" height="70" rx="6" fill="#2a2a2a"/>
      <rect x="630" y="250" width="80" height="30" fill="#444"/>
      <rect x="655" y="350" width="30" height="50" fill="#333"/>
      <!-- string lights -->
      <path d="M40 80 Q220 140 400 70 Q580 20 760 100" fill="none" stroke="#3a3a3a" stroke-width="2"/>
      <g fill="#ffe29a">
        <circle cx="100" cy="95" r="6"/><circle cx="200" cy="118" r="6"/>
        <circle cx="300" cy="95" r="6"/><circle cx="400" cy="72" r="6"/>
        <circle cx="500" cy="55" r="6"/><circle cx="600" cy="62" r="6"/>
        <circle cx="700" cy="88" r="6"/>
      </g>
      <!-- railing -->
      <rect x="20" y="200" width="120" height="12" fill="#5a4a3a"/>
      <rect x="30" y="212" width="8" height="90" fill="#5a4a3a"/>
      <rect x="120" y="212" width="8" height="90" fill="#5a4a3a"/>
      <text x="40" y="490" fill="rgba(0,0,0,0.25)" font-size="14" font-family="IBM Plex Sans,sans-serif">sticky spoon · napkin corners · open sugar</text>
    </svg>`;
  }

  // Resize refreshes magnifier metrics
  window.addEventListener("resize", () => {
    if (state.magnifierOn) updateMagnifier();
  });
})();
