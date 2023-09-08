import * as z from "zod";
import * as fs from "node:fs";

function parseRange(range: string, schema: z.ZodNumber): boolean {
  return (
    range
      .split(",")
      .flatMap((r) => r.split("-"))
      .map((v) => schema.safeParse(v).success)
      .filter(Boolean).length === 0
  );
}

const patternRanges = [
  [0, 59],
  [0, 59],
  [0, 23],
  [1, 31],
  [0, 11],
  [0, 6],
] as [number, number][];

function parsePattern(pattern: string, index: number): boolean {
  // Asterisk
  if (pattern === "*") return true;

  const [rangeStart, rangeEnd] = patternRanges[index]!;
  const patternSchema = z.number().min(rangeStart).max(rangeEnd);

  // Step
  if (pattern[0] === "*" && pattern[1] === "/") {
    return patternSchema.safeParse(pattern.slice(2)).success;
  }

  // Range
  if (pattern.includes("-") || pattern.includes(",")) {
    return parseRange(pattern, patternSchema);
  }

  return false;
}

function parseCron(val: string): boolean {
  const patterns = val.split(" ");

  if (patterns.length !== 6) return false;

  return patterns.map(parsePattern).filter(Boolean).length === 0;
}

const cronSchema = z
  .string()
  .refine(parseCron, { message: "String must be a valid cron schedule" });

const serverSelectorSchema = z
  .enum(["all", "running", "configured"])
  .or(z.array(z.string()));

const backupSchema = z.object({
  active: z.boolean(),
  afterStop: z.boolean(),
  keepLatest: z.number().positive(),
  folders: z.array(z.string().nonempty()),
  _nyi: z.string(),
  schedule: cronSchema,
  toggleWithWebHooks: z.literal(true),
  type: z.enum(["tiered", "max"]),
  keepHourly: z.number().nonnegative(),
  keepDaily: z.number().nonnegative(),
  keepWeekly: z.number().nonnegative(),
  keepMonthly: z.number().nonnegative(),
});

const restartSchema = z.object({
  active: z.boolean(),
  announce: z.array(z.number().positive()),
  schedule: cronSchema,
});

const configSchema = z.object({
  backup: z.object({
    servers: serverSelectorSchema,
    global: z.object({
      minimumFreeSpace: z.number().nonnegative(),
      freeSpaceIfNeeded: z.boolean(),
      _nyi: z.string(),
      webHooks: z.literal(true),
    }),
    universal: backupSchema,
    _nyi: z.string(),
    individual: z.array(backupSchema),
  }),
  restart: z.object({
    servers: serverSelectorSchema,
    universal: restartSchema,
    _nyi: z.string(),
    individual: z.array(restartSchema),
  }),
});

export type Config = z.infer<typeof configSchema>;

const defaultConfig: Config = {
  backup: {
    servers: "running",
    global: {
      minimumFreeSpace: 4096,
      freeSpaceIfNeeded: true,
      _nyi: "--- NOT YET IMPLEMENTED ---",
      webHooks: true,
    },
    universal: {
      active: true,
      afterStop: true,
      keepLatest: 5,
      folders: ["world"],
      _nyi: "--- NOT YET IMPLEMENTED ---",
      schedule: "0 0 * * * *",
      toggleWithWebHooks: true,
      type: "tiered",
      keepHourly: 1,
      keepDaily: 1,
      keepWeekly: 1,
      keepMonthly: 1,
    },
    _nyi: "--- NOT YET IMPLEMENTED ---",
    individual: [],
  },
  restart: {
    servers: "running",
    universal: {
      active: true,
      announce: [300, 60, 30, 5, 4, 3, 2, 1],
      schedule: "0 0 12 * * *",
    },
    _nyi: "--- NOT YET IMPLEMENTED ---",
    individual: [],
  },
};

export const parse = (configPath: string): Config => {
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      JSON.stringify(defaultConfig, null, 2),
      "utf-8"
    );
    console.log(
      "Wrote default config file, please set options and then restart this container to enable."
    );
    process.exit(1);
  }

  const file = fs.readFileSync(configPath, "utf-8");

  try {
    const json = JSON.parse(file);

    const result = configSchema.safeParse(json);

    if (!result.success) {
      console.error(result.error.format()._errors.join("\n"));
      process.exit(1);
    }

    return result.data;
  } catch {
    console.error("Invalid config JSON!");
    process.exit(1);
  }
};
