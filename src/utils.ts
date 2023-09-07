import * as fs from "node:fs";

export function exists(path: string) {
  const doesExist = fs.existsSync(path);
  if (!doesExist) {
    console.error(`${path} was not found!`);
  }

  return doesExist;
}

export function isDirectory(path: string) {
  const isDir = fs.statSync(path).isDirectory();
  if (!isDir) {
    console.error(`${path} is not a directory!`);
  }

  return isDir;
}

export function isSocket(path: string) {
  const isSock = fs.statSync(path).isSocket();
  if (!isSock) {
    console.error(`${path} is not a socket!`);
  }

  return isSock;
}
