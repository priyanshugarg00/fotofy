import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  real,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(),
  name: text("name"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  email: text("email").notNull(),
  passwordHash: text("password_hash"),
  googleId: text("google_id"), // Add Google OAuth ID
  isVerified: boolean("is_verified").default(false), // Add verification status
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const photographers = pgTable("photographers", {
  id: integer("id")
    .primaryKey()
    .references(() => users.id),
  bio: text("bio"),
  city: text("city"),
  lat: real("lat"),
  lng: real("lng"),
  avgRating: real("avg_rating"),
  totalReviews: integer("total_reviews"),
  isVerified: boolean("is_verified").default(false),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  photographerId: integer("photographer_id").references(() => photographers.id),
  s3Url: text("s3_url").notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  photographerId: integer("photographer_id").references(() => photographers.id),
  shootType: text("shoot_type").notNull(),
  basePrice: integer("base_price").notNull(),
  currency: text("currency").notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => users.id),
  photographerId: integer("photographer_id").references(() => photographers.id),
  serviceId: integer("service_id").references(() => services.id),
  date: timestamp("date").notNull(),
  hours: integer("hours").notNull(),
  address: text("address").notNull(),
  status: text("status").notNull(),
  paymentIntentId: text("payment_intent_id"),
  totalAmount: integer("total_amount").notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payouts = pgTable("payouts", {
  id: serial("id").primaryKey(),
  photographerId: integer("photographer_id").references(() => photographers.id),
  amount: integer("amount").notNull(),
  status: text("status").notNull(),
  stripeTransferId: text("stripe_transfer_id"),
  scheduledFor: timestamp("scheduled_for").notNull(),
});

export const deliverables = pgTable("deliverables", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id),
  s3Url: text("s3_url").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id),
  senderId: integer("sender_id").references(() => users.id),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Photographer = typeof photographers.$inferSelect;
export type PortfolioItem = typeof portfolios.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Deliverable = typeof deliverables.$inferSelect;
export type Message = typeof messages.$inferSelect;
