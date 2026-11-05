# Kill the Fly

A repulsive Where’s-Waldo hunt. Spot the vermin, then line up a timed smack before it lifts off and breeds.

## Play

```bash
python3 -m http.server 8765 --directory find-the-fly
```

Visit `http://localhost:8765`.

## Mechanics

- **Think like vermin** — landings bias toward food, light, and heat. Cold rooms pull toward radiators / stoves / laptops.
- **Magnifier** — inspect grease and clutter up close.
- **Force it to fly** — hint mode; track the path, remember the perch.
- **Spot → smack** — finding the fly only starts the swatter clock (5s / 3.5s / 2.2s by difficulty). Line up and crush it while it skitters.
- **Miss or choke** — it flees; swarm timer gets meaner. Wait too long overall and replicas win.
