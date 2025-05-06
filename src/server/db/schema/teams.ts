import {
  pgTable,
  text,
  primaryKey,
  uuid,
  foreignKey,
  index,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { pgTableCreator } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

const createTable = pgTableCreator((name) => `d1e_${name}`);

export const teams = createTable(
  "teams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    captainId: text("captain_id")
      .notNull()
      .references(() => user.id),
    inviteCode: text("invite_code").notNull().unique(),
    logoUrl: text("logo_url"), // Store logos for teams in the future
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(), // Tracks when teams are created
    description: text("description"), // Can be useful for finding teams later
    region: text("region"), // Useful for teams in different locations
    isVerified: boolean("is_verified").default(false), // Admin Verification
    averageRank: integer("average_rank"), // Future use with rank
  },
  (table) => [
    index("team_name_idx").on(table.name), // Index for searching teams by name
  ],
);

export const teamMembers = createTable(
  "team_members",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id),
    joinedAt: timestamp("joined_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(), // Track when users join
    role: text("role").default("member"), // e.g., 'member', 'substitute', 'coach'
  },
  (tm) => [
    primaryKey({ columns: [tm.userId, tm.teamId] }),
    index("team_id_idx").on(tm.teamId), // Speed up team member lookups by team ID
    index("user_id_idx").on(tm.userId), // Speed up team member lookups by user ID
  ],
);

// TEAM RELATIONS
export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(user, {
    fields: [teamMembers.userId],
    references: [user.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));
