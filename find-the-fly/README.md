# Find the Fly

A Where’s-Waldo-style hunt through lived-in rooms. Spot the fly before it replicates.

## Play

Open `index.html` in a browser, or from the repo root:

```bash
python3 -m http.server 8765 --directory find-the-fly
```

Then visit `http://localhost:8765`.

## Mechanics

- **Think like a fly** — landing spots bias toward food, light, and heat. Cold rooms pull harder toward radiators, stoves, and laptops.
- **Magnifier** — toggle the glass and drag to inspect clutter up close.
- **Get a hint** — the fly lifts off; track the path, then find the new perch.
- **Difficulty** — Housefly (big/slow/warm), Busy bee (medium/drafty), Fruit flea (tiny/frantic/cold). Harder modes shrink the target, speed up flight, and start the swarm earlier.
- **Swarm timer** — wait too long and replicas spawn until you time out.
