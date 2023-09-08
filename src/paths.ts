import * as path from "node:path";
import * as process from "node:process";
import { exists, isDirectory, isSocket } from "./utils";

export const dataFolder = "/data";
export const backupsFolder = "/backups";
const dockerSocket = "/var/run/docker.sock";
export const configFile = path.join(dataFolder, "config.json");
export const dbFile = path.join(dataFolder, "db.json");

export function validate() {
  const validate = [
    exists(dataFolder),
    isDirectory(dataFolder),
    exists(backupsFolder),
    isDirectory(backupsFolder),
    exists(dockerSocket),
    isSocket(dockerSocket),
  ];

  if (validate.filter((v) => !v).length > 0) {
    process.exit(1);
  }
}
