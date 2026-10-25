import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
const app = process.env.CALIFNCO_APP || "admin";
if (!["admin", "storefront", "automation"].includes(app))
  throw new Error("CALIFNCO_APP must be admin, storefront or automation");
if (!process.env.npm_execpath)
  throw new Error("Run this script through npm run build:deployment");
execFileSync(
  process.execPath,
  [process.env.npm_execpath, "run", "build", "--workspace", `apps/${app}`],
  { stdio: "inherit" },
);
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
cpSync(`apps/${app}/dist`, "dist", { recursive: true });
console.log(`Prepared ${app} in the root dist directory.`);
