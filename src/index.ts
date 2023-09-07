import { $ } from "execa";
import { CronJob } from "cron";
import * as paths from "./paths";
import * as configuration from "./config";

paths.validate();

const config = configuration.parse(paths.configFile);
