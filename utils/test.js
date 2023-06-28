import Ajv from "npm:ajv@8.8.2";
import addFormats from "npm:ajv-formats@2.1.1";
import { Engine } from "./engine.js";

const ajv = new Ajv({ strict: false });
addFormats(ajv);

const engine = new Engine();
await engine.load();

const schemas = await engine.schemas();

for (const col of Object.keys(engine.schemaMap)) {
  const schemaName = engine.schemaMap[col];
  for (const item of engine.data[col]) {
    const validator = ajv.compile(schemas[schemaName]);

    Deno.test(`${schemaName} (schema): ${item.id}`, () => {
      if (!validator(item)) {
        throw validator.errors;
      }
    });
  }
}
