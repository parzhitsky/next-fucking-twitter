import { EnvName } from "@@shared/config/env-name.js"

export const defaults = {
  NODE_ENV: EnvName.production,
} satisfies Partial<ConfigDTO>

export class ConfigDTO {
  readonly NODE_ENV: EnvName = defaults.NODE_ENV
}
