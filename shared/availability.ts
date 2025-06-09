import {
    pgTable,
    serial,
    integer,
    timestamp,
    text
  } from "drizzle-orm/pg-core";
  
  import { photographers } from "./schema";
 
  export const availability = pgTable("availability", {
    id: serial("id").primaryKey(),
    photographerId: integer("photographer_id").references(() => photographers.id),
    date: text("date").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
  });
  
  export type AvailabilityType = typeof availability.$inferSelect;