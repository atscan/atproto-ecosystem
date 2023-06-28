import { Engine } from "./engine.js";

const engine = new Engine();
await engine.load();

await engine.build();
