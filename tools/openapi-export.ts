import * as fs from 'fs';
import * as path from 'path';
import { load } from 'js-yaml';

// Simple exporter: openapi/openapi-v1.yaml -> openapi/openapi-v1.json
(async () => {
  try {
    const root = process.cwd();
    const yamlPath = path.join(root, 'openapi', 'openapi-v1.yaml');
    const jsonPath = path.join(root, 'openapi', 'openapi-v1.json');

    if (!fs.existsSync(yamlPath)) {
      console.error(`[openapi:export] Spec not found at ${yamlPath}`);
      process.exit(1);
    }

    const yml = fs.readFileSync(yamlPath, 'utf8');
    const doc = load(yml) as unknown;
    fs.writeFileSync(jsonPath, JSON.stringify(doc, null, 2), 'utf8');

    console.log(`[openapi:export] Wrote ${jsonPath}`);
  } catch (err) {
    console.error('[openapi:export] Failed:', err);
    process.exit(1);
  }
})();
