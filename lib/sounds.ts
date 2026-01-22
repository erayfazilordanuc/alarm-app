// Map sound IDs to require statements
// Note: These files must exist in assets/sounds/ for the bundler to succeed.
export const SOUND_FILES: Record<string, any> = {
  default: require("../assets/sounds/default.mp3"),
  radar: require("../assets/sounds/radar.mp3"),
  beacon: require("../assets/sounds/beacon.mp3"),
  chimes: require("../assets/sounds/chimes.mp3"),
  circuit: require("../assets/sounds/circuit.mp3"),
  reflection: require("../assets/sounds/reflection.mp3"),
  waves: require("../assets/sounds/waves.mp3"),
  sunrise: require("../assets/sounds/sunrise.mp3"),
  pulse: require("../assets/sounds/pulse.mp3"),
  orbit: require("../assets/sounds/orbit.mp3"),
};
