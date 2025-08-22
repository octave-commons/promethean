var config = require("./config"),
    entities = require("./entities");
var settings1 = QuickSettings.create(800, 0, "settings 1");
var settings2 = QuickSettings.create(1000, 0, "settings 2");
var settings3 = QuickSettings.create(1200, 0, "settings 3");
settings1.addRange("Options amplitude", 1, 100, config.optionsAmplitude, 0.01, ((val) => {
	
  return config.optionsAmplitude = val;

}));
settings1.addRange("Angle Zoom", 1, 99, config.angleZoom, 1, ((val) => {
	
  return config.angleZoom = (val / config.optionsAmplitude);

}));
settings1.addRange("Noise Z", 1, 99, config.noiseZ, 1, ((val) => {
	
  return config.noiseZ = (val / config.optionsAmplitude);

}));
settings1.addRange("Noise Force", 1, 99, config.fieldForce, 0.1, ((val) => {
	
  return config.fieldForce = (val / config.optionsAmplitude);

}));
settings1.addRange("Signal Decay", 0, 99, config.decay, 0.1, ((val) => {
	
  return config.decay = (val / config.optionsAmplitude);

}));
settings1.addRange("Max P Vector Length", 0, 99, config.maxLength, 0.1, ((val) => {
	
  return config.maxLength = (val / config.optionsAmplitude);

}));
settings1.addRange("Max Trail", 10, 999, config.maxTrail, 1, ((val) => {
	
  return config.maxTrail = val;

}));
settings1.addRange("Min Trail", 10, 99, config.minTrail, 1, ((val) => {
	
  return config.minTrail = val;

}));
settings2.addBoolean("Decay on collision", config.decayOnCollision, ((val) => {
	
  return config.decayOnCollision = val;

}));
settings2.addBoolean("Limit the number of decay blocks per cycle", config.limitDecay, ((val) => {
	
  return config.limitDecay = val;

}));
settings3.addRange("Ant Influence", 0, 99, config.antInfluence, 1, ((val) => {
	
  return config.antInfluence = val;

}));
settings3.addRange("friction", 2, 128, config.friction, 1, ((val) => {
	
  return config.friction = val;

}));
settings3.addRange("Collision Static", 0, 99, config.collisionStatic, 1, ((val) => {
	
  return config.collisionStatic = val;

}));
settings3.addRange("Spawn Static", 0, 99, config.spawnStatic, 1, ((val) => {
	
  return config.spawnStatic = val;

}));
settings3.addRange("Spawn Rate", 1, 999, config.spawnRate, 0.01, ((val) => {
	
  return config.spawnRate = val;

}));
settings3.addRange("Game speed", 0.1, 5, config.gameSpeed, 0.1, ((val) => {
	
  return config.gameSpeed = val;

}));
settings3.addButton("Clear ants", entities.clearAnts);