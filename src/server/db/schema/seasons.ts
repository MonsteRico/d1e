import {
  pgTable,
  text,
  primaryKey,
  uuid,
  integer,
  timestamp,
  pgEnum,
  boolean,
  index,
  foreignKey,
  PgColumn, // Import foreignKey
} from "drizzle-orm/pg-core";
import { teams } from "./teams";
import {
  relations,
  type ColumnBaseConfig,
  type ColumnDataType,
} from "drizzle-orm";
import { sql } from "drizzle-orm";
import { pgTableCreator } from "drizzle-orm/pg-core";

const createTable = pgTableCreator((name) => `d1e_${name}`);

export const seasonTypeEnum = pgEnum("season_type", [
  "regular_season",
  "tournament",
]);
export const tournamentTypeEnum = pgEnum("tournament_type", [
  "round_robin",
  "single_elimination",
  "double_elimination",
]);
export const seasonStatusEnum = pgEnum("season_status", [
  "pending",
  "active",
  "completed",
]);
export const matchStatusEnum = pgEnum(
  "match_status",
  ["pending", "in_progress", "completed", "canceled", "forfeited"], // Future proof more options
);
export const gameModeEnum = pgEnum("game_mode", ["standard", "custom"]);
export const winningConditionEnum = pgEnum("winning_condition", [
  "score",
  "elimination",
  "objective",
]);

export const seasons = createTable("seasons", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  game: text("game").notNull(),
  gameMode: gameModeEnum("game_mode").default("standard").notNull(), // If game has multiple ways to play
  minPlayers: integer("min_players").notNull(),
  maxPlayers: integer("max_players").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  type: seasonTypeEnum("type").notNull(),
  tournamentType: tournamentTypeEnum("tournament_type"),
  status: seasonStatusEnum("status").default("pending").notNull(),
  rules: text("rules"),
  previousSeasonId: uuid("previousSeasonId").references(
    (): PgColumn<ColumnBaseConfig<ColumnDataType, string>, object, object> =>
      seasons.id,
    { onDelete: "set null" },
  ), // Explicit return type and onDelete
  registrationDeadline: timestamp("registrationDeadline"), // Allow registration until a certain date
  description: text("description"), // Season overview
  isFeatured: boolean("isFeatured").default(false), // Help prioritize certain seasons to display
  prizePool: text("prizePool"), // Details on what the winner gets
});

export const seasonRegistrations = createTable(
  "seasonRegistrations",
  {
    teamId: uuid("teamId")
      .notNull()
      .references(() => teams.id),
    seasonId: uuid("seasonId")
      .notNull()
      .references(() => seasons.id),
    registrationDate: timestamp("registrationDate")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(), // Track when registration happened
    isApproved: boolean("isApproved").default(true), // Future-Proof Registration Approval
  },
  (sr) => [primaryKey({ columns: [sr.teamId, sr.seasonId] })],
);

export const matches = createTable(
  "matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seasonId: uuid("seasonId")
      .notNull()
      .references(() => seasons.id),
    team1Id: uuid("team1Id")
      .notNull()
      .references(() => teams.id),
    team2Id: uuid("team2Id")
      .notNull()
      .references(() => teams.id),
    scheduledTime: timestamp("scheduledTime"),
    result: text("result"), // Store as JSON string.  Consider a separate table for structured results in the future.
    status: matchStatusEnum("status").default("pending").notNull(),
    round: integer("round"),
    vodUrl: text("vodUrl"), // Link to after match video
    reportScoreUrl: text("reportScoreUrl"), // Place for teams to report after a match
    winningCondition: winningConditionEnum("winningCondition"),
  },
  (match) => [
    index("seasonIdIdx").on(match.seasonId),
    index("team1IdIdx").on(match.team1Id),
    index("team2IdIdx").on(match.team2Id),
  ],
);

// SEASON RELATIONS
export const seasonsRelations = relations(seasons, ({ many }) => ({
  seasonRegistrations: many(seasonRegistrations),
  matches: many(matches),
}));

export const seasonRegistrationsRelations = relations(
  seasonRegistrations,
  ({ one }) => ({
    team: one(teams, {
      fields: [seasonRegistrations.teamId],
      references: [teams.id],
    }),
    season: one(seasons, {
      fields: [seasonRegistrations.seasonId],
      references: [seasons.id],
    }),
  }),
);

export const matchesRelations = relations(matches, ({ one }) => ({
  team1: one(teams, {
    fields: [matches.team1Id],
    references: [teams.id],
  }),
  team2: one(teams, {
    fields: [matches.team2Id],
    references: [teams.id],
  }),
  season: one(seasons, {
    fields: [matches.seasonId],
    references: [seasons.id],
  }),
}));
