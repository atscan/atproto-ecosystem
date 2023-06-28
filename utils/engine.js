import { parse } from "https://deno.land/std@0.192.0/yaml/mod.ts";
import { join } from "https://deno.land/std@0.192.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.192.0/fs/ensure_dir.ts";

const DATA_PATH = "./data";
const SCHEMA_PATH = "./schema";
const SCHEMA_MAP = {
  clients: "client",
  federations: "federation",
};

async function loadYAML(fn) {
  return parse(await Deno.readTextFile(fn));
}
async function saveJSON(fn, data) {
  return Deno.writeTextFile(fn, JSON.stringify(data, null, 2));
}

export class Engine {
  constructor() {
    this.data = {};
    this.schemasData = {};
    this.schemaMap = SCHEMA_MAP;
  }

  async load() {
    for await (const cat of Deno.readDir(DATA_PATH)) {
      this.data[cat.name] = [];
      for await (const pkg of Deno.readDir(join(DATA_PATH, cat.name))) {
        const base = await loadYAML(
          join(DATA_PATH, cat.name, pkg.name, "index.yaml"),
        );
        this.data[cat.name].push(Object.assign({ id: pkg.name }, base));
      }
    }
    console.log("Engine loaded");
  }

  async build(path = "./dist") {
    await ensureDir(path);

    // write index
    const fn = join(path, "index.json");
    await saveJSON(fn, {
      data: this.data,
      time: new Date(),
    });
    console.log(`Build done: ${fn}`);
  }

  async schemas() {
    if (Object.keys(this.schemasData).length === 0) {
      for await (const sf of Deno.readDir(SCHEMA_PATH)) {
        const name = sf.name.match(/^(\w+)\./)[1];
        const schema = await loadYAML(join(SCHEMA_PATH, sf.name));
        this.schemasData[name] = schema;
      }
    }
    return this.schemasData;
  }
}
