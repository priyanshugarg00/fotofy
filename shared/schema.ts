import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  real,
  boolean,
  date,
  time,
  primaryKey
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// ======= USERS =======
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("customer"),
  phone: varchar("phone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  stripeCustomerId: varchar("stripe_customer_id"),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// ======= PHOTOGRAPHERS =======
export const photographers = pgTable("photographers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  bio: text("bio"),
  city: varchar("city"),
  state: varchar("state"),
  baseRate: integer("base_rate"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const photographerInsertSchema = createInsertSchema(photographers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true,
  isActive: true,
});

export type InsertPhotographer = z.infer<typeof photographerInsertSchema>;
export type Photographer = typeof photographers.$inferSelect;

// ======= PHOTOGRAPHER CATEGORIES =======
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  imageUrl: varchar("image_url"),
});

export const photographerCategories = pgTable("photographer_categories", {
  photographerId: integer("photographer_id").notNull().references(() => photographers.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.photographerId, table.categoryId] }),
}));

// ======= PORTFOLIO ITEMS =======
export const portfolioItems = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  photographerId: integer("photographer_id").notNull().references(() => photographers.id),
  title: varchar("title").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const portfolioItemInsertSchema = createInsertSchema(portfolioItems).omit({
  id: true,
  createdAt: true,
});

export type InsertPortfolioItem = z.infer<typeof portfolioItemInsertSchema>;
export type PortfolioItem = typeof portfolioItems.$inferSelect;

// ======= AVAILABILITY =======
export const availability = pgTable("availability", {
  id: serial("id").primaryKey(),
  photographerId: integer("photographer_id").notNull().references(() => photographers.id),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  isBooked: boolean("is_booked").default(false),
});

export const availabilityInsertSchema = createInsertSchema(availability).omit({
  id: true,
  isBooked: true,
});

export type InsertAvailability = z.infer<typeof availabilityInsertSchema>;
export type Availability = typeof availability.$inferSelect;

// ======= BOOKINGS =======
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  photographerId: integer("photographer_id").notNull().references(() => photographers.id),
  categoryId: integer("category_id").references(() => categories.id),
  bookingDate: date("booking_date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  location: varchar("location"),
  notes: text("notes"),
  status: varchar("status").notNull().default("pending"), // pending, confirmed, completed, cancelled
  totalAmount: integer("total_amount").notNull(), // in cents
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookingInsertSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  stripePaymentIntentId: true,
});

export type InsertBooking = z.infer<typeof bookingInsertSchema>;
export type Booking = typeof bookings.$inferSelect;

// ======= REVIEWS =======
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  photographerId: integer("photographer_id").notNull().references(() => photographers.id),
  rating: real("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviewInsertSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export type InsertReview = z.infer<typeof reviewInsertSchema>;
export type Review = typeof reviews.$inferSelect;

// ======= DELIVERABLES =======
export const deliverables = pgTable("deliverables", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  title: varchar("title").notNull(),
  description: text("description"),
  fileUrl: varchar("file_url").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const deliverableInsertSchema = createInsertSchema(deliverables).omit({
  id: true,
  uploadedAt: true,
});

export type InsertDeliverable = z.infer<typeof deliverableInsertSchema>;
export type Deliverable = typeof deliverables.$inferSelect;

// ======= MESSAGES =======
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at").defaultNow(),
});

export const messageInsertSchema = createInsertSchema(messages).omit({
  id: true,
  sentAt: true,
  isRead: true,
});

export type InsertMessage = z.infer<typeof messageInsertSchema>;
export type Message = typeof messages.$inferSelect;
