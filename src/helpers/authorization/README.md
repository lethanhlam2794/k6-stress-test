# Authorization (extend here)

- Align with `AuthorizationConfig` / `K6Config.authorization` in `../interface.ts`.
- Map `type` to real headers + `tokenEnv` → `__ENV` in the k6 script (`../../../generator/index.ts`).
- Keep secrets in env vars, not in YAML.
