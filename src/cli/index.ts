import "./load-env.js";
import { program } from "commander";
import { spawnSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import yaml from "yaml";
import { K6Config } from "../helpers/interface.js";
import { validateConfig } from "../helpers/validate-config.js";
import { generateK6Script } from "../generator/index.js";

program.name("stress-test").version("1.0.0");

program
  .command("run")
  .option("--scenario <name>", "smoke | load | spike", "load")
  .option("--config <path>", "path to config file", "./k6.config.yml")
  .action((opts: { scenario: string; config: string }) => {
    if (!existsSync(opts.config)) {
      console.error(`Error: Config file not found: ${opts.config}`);
      process.exit(1);
    }

    const raw = readFileSync(opts.config, "utf8");
    const config = yaml.parse(raw) as K6Config;
    if (!config) {
      console.error("Error: Invalid config file");
      process.exit(1);
    }

    const errors = validateConfig(config);
    if (errors.length) {
      errors.forEach((error) => console.error(`Error: ${error}`));
      process.exit(1);
    }
    const scriptPath = "generated/test.js";
    generateK6Script(config, opts.scenario, scriptPath);
    const result = spawnSync(
      "k6",
      ["run", "--out", "influxdb=http://localhost:8086/k6", scriptPath],
      {
        stdio: "inherit",
        env: process.env,
      },
    );

    if (result.error) {
      console.error("Error: Failed to start k6:", result.error.message);
      process.exit(1);
    }

    if (result.status !== 0) {
      console.error(`Error: Stress test failed (exit code ${result.status})`);
      process.exit(result.status ?? 1);
    }

    console.log("Success: Stress test completed successfully");
  });

program.parse();
