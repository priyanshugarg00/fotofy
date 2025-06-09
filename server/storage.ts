import {
  users,
  photographers,
  portfolios,
  services,
  bookings,
  reviews,
  payouts,
  deliverables,
  messages,
  type User,
  type Photographer,
  type PortfolioItem,
  type Booking,
  type Review,
  type Deliverable,
  type Message,
} from "@shared/schema";
import { db } from "./db";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import type {
  User as UserType,
  Photographer as PhotographerType,
  PortfolioItem as PortfolioItemType,
  Booking as BookingType,
  Review as ReviewType,
  Deliverable as DeliverableType,
  Message as MessageType,
} from "@shared/schema";
type UpsertUser = typeof users.$inferInsert;
type InsertPhotographer = typeof photographers.$inferInsert;
type InsertPortfolioItem = typeof portfolios.$inferInsert;
type InsertAvailability = typeof availability.$inferInsert;
type InsertBooking = typeof bookings.$inferInsert;
type InsertReview = typeof reviews.$inferInsert;
type InsertDeliverable = typeof deliverables.$inferInsert;
type InsertMessage = typeof messages.$inferInsert;
import { type AvailabilityType } from "@shared/availability";
import { availability } from "@shared/availability";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(userId: string, role: string): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // New user operations for email/password auth
  createUserWithEmailAndPassword(user: { email: string; passwordHash: string; name?: string }): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  verifyPassword(password: string, passwordHash: string): Promise<boolean>;

  // Photographer operations
  getPhotographers(filter?: any): Promise<any[]>;
  getPhotographerById(id: number): Promise<any | undefined>;
  getPhotographerByUserId(userId: string): Promise<Photographer | undefined>;
  getPhotographerUserById(photographerId: number): Promise<User | undefined>;
  createPhotographer(data: InsertPhotographer): Promise<Photographer>;
  updatePhotographer(id: number, data: Partial<InsertPhotographer>): Promise<Photographer>;
  updatePhotographerVerification(id: number, isVerified: boolean): Promise<Photographer>;

  // Category operations
  getCategories(): Promise<any[]>;
  getCategoryById(id: number): Promise<any | undefined>;

  // Portfolio operations
  getPortfolio(photographerId: number): Promise<PortfolioItem[]>;
  addPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem>;

  // Availability operations
  getAvailability(photographerId: number): Promise<AvailabilityType[]>;
  addAvailability(data: InsertAvailability): Promise<AvailabilityType>;
  checkAvailability(photographerId: number, date: string, startTime: string, endTime: string): Promise<boolean>;

  // Booking operations
  getAllBookings(): Promise<any[]>;
  getCustomerBookings(customerId: number): Promise<any[]>;
  getPhotographerBookings(photographerId: number): Promise<any[]>;
  getBookingById(id: number): Promise<any | undefined>;
  createBooking(data: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  updateBookingPaymentIntent(id: number, paymentIntentId: string): Promise<Booking>;

  // Review operations
  getPhotographerReviews(photographerId: number): Promise<any[]>;
  getReviewByBookingId(bookingId: number): Promise<Review | undefined>;
  createReview(data: InsertReview): Promise<Review>;

  // Deliverable operations
  getDeliverables(bookingId: number): Promise<Deliverable[]>;
  addDeliverable(data: InsertDeliverable): Promise<Deliverable>;

  // Message operations
  getBookingMessages(bookingId: number): Promise<Message[]>;
  sendMessage(data: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  private saltRounds = 10;

  // ===== USER OPERATIONS =====
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, parseInt(id, 10)));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role: role })
      .where(eq(users.id, parseInt(userId, 10)))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // ===== NEW USER OPERATIONS (EMAIL/PASSWORD AUTH) =====
  async createUserWithEmailAndPassword(user: { email: string; passwordHash: string; name?: string }): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values({
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
        role: 'customer', // Default role
      })
      .returning();
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  // ===== PHOTOGRAPHER OPERATIONS =====
  async getPhotographers(filter?: any): Promise<any[]> {
    // Create base query
    const query = db
      .select({
        id: photographers.id,
        bio: photographers.bio,
        city: photographers.city,
        lat: photographers.lat,
        lng: photographers.lng,
        avgRating: photographers.avgRating,
        totalReviews: photographers.totalReviews,
        isVerified: photographers.isVerified,
      })
      .from(photographers)
      .innerJoin(users, eq(photographers.id, users.id));

    // Execute the query
    const photographersData = await query;

    // Fetch additional data for each photographer
    const photographersWithExtras = await Promise.all(
      photographersData.map(async (photographer) => {
        // Get categories
        const categoriesJoin = await db
          .select({
            categoryId: services.id,
            name: services.shootType,
          })
          .from(services)
          .where(eq(services.photographerId, photographer.id));

        const photographerCats = categoriesJoin.map((c: any) => ({
          id: c.categoryId,
          name: c.name,
        }));

        // Get average rating
        const ratingResult = await db
          .select({
            averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
            count: sql<number>`COUNT(${reviews.id})`,
          })
          .from(reviews)
          .innerJoin(bookings, eq(reviews.bookingId, bookings.id))
          .where(eq(bookings.photographerId, photographer.id));

        // Get portfolio preview
        const portfolio = await db
          .select()
          .from(portfolios)
          .where(eq(portfolios.photographerId, photographer.id))
          .limit(6);

        return {
          ...photographer,
          categories: photographerCats,
          rating: {
            average: ratingResult[0].averageRating,
            count: ratingResult[0].count,
          },
          portfolioSample: portfolio[0]?.s3Url || null,
        };
      })
    );

    // Filter out nulls (photographers that didn't match category or date filter)
    return photographersWithExtras.filter(Boolean);
  }

  async checkPhotographerAvailableOnDate(photographerId: number, dateStr: string): Promise<boolean> {
    const result = await db
      .select()
      .from(services)
      .where(
        and(
          eq(services.photographerId, photographerId),
          eq(services.shootType, dateStr),
        )
      );

    return result.length > 0;
  }

  async getPhotographerById(id: number): Promise<any | undefined> {
    const [photographer] = await db
      .select({
        id: photographers.id,
        bio: photographers.bio,
        city: photographers.city,
        lat: photographers.lat,
        lng: photographers.lng,
        avgRating: photographers.avgRating,
        totalReviews: photographers.totalReviews,
        isVerified: photographers.isVerified,
      })
      .from(photographers)
      .innerJoin(users, eq(photographers.id, users.id));

    if (!photographer) {
      return undefined;
    }

    const [user] = await db
      .select({
        name: users.name,
        email: users.email,
        phone: users.phone,
      })
      .from(users)
      .where(eq(users.id, photographer.id));

    // Get categories
    const categoriesJoin = await db
      .select({
        categoryId: services.id,
        name: services.shootType,
      })
      .from(services)
      .where(eq(services.photographerId, id));

    const photographerCats = categoriesJoin.map((c: any) => ({
      id: c.categoryId,
      name: c.name,
    }));

    // Get average rating
    const ratingResult = await db
      .select({
        averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
        count: sql<number>`COUNT(${reviews.id})`,
      })
      .from(reviews)
      .innerJoin(bookings, eq(reviews.bookingId, bookings.id))
      .where(eq(bookings.photographerId, photographer.id));

    // Get portfolio preview
    const portfolio = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.photographerId, id))
      .limit(6);

    return {
      ...photographer,
      ...user,
      categories: photographerCats,
      rating: {
        average: ratingResult[0].averageRating,
        count: ratingResult[0].count,
      },
      portfolioPreview: portfolio,
    };
  }

  async getPhotographerByUserId(userId: string): Promise<Photographer | undefined> {
    const [photographer] = await db
      .select()
      .from(photographers)
      .innerJoin(users, eq(photographers.id, users.id))
      .where(eq(users.id, parseInt(userId, 10)));

    return photographer.photographers;
  }

  async getPhotographerUserById(photographerId: number): Promise<User | undefined> {
    const [photographer] = await db
      .select({
        id: photographers.id,
        bio: photographers.bio,
        city: photographers.city,
        lat: photographers.lat,
        lng: photographers.lng,
        avgRating: photographers.avgRating,
        totalReviews: photographers.totalReviews,
        isVerified: photographers.isVerified,
      })
      .from(photographers)
      .innerJoin(users, eq(photographers.id, users.id))
      .where(eq(photographers.id, photographerId));

    if (!photographer) {
      return undefined;
    }

    return this.getUser(photographer.id.toString());
  }

  async createPhotographer(data: InsertPhotographer): Promise<Photographer> {
    const [photographer] = await db
      .insert(photographers)
      .values(data)
      .returning();
    return photographer;
  }

  async updatePhotographer(id: number, data: Partial<InsertPhotographer>): Promise<Photographer> {
    const [photographer] = await db
      .update(photographers)
      .set({
        ...data,
      })
      .where(eq(photographers.id, id))
      .returning();
    return photographer;
  }

  async updatePhotographerVerification(id: number, isVerified: boolean): Promise<Photographer> {
    const [photographer] = await db
      .update(photographers)
      .set({
        isVerified,
      })
      .where(eq(photographers.id, id))
      .returning();
    return photographer;
  }

  // ===== CATEGORY OPERATIONS =====
  async getCategories(): Promise<any[]> {
    return await db.select().from(services);
  }

  async getCategoryById(id: number): Promise<any | undefined> {
    const [category] = await db
      .select()
      .from(services)
      .where(eq(services.id, id));
    return category;
  }

  // ===== PORTFOLIO OPERATIONS =====
  async getPortfolio(photographerId: number): Promise<PortfolioItem[]> {
    return await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.photographerId, photographerId));
  }

  async addPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem> {
    const [portfolioItem] = await db
      .insert(portfolios)
      .values(item)
      .returning();
    return portfolioItem;
  }

  // ===== AVAILABILITY OPERATIONS =====
  async getAvailability(photographerId: number): Promise<AvailabilityType[]> {
      return await db
        .select()
        .from(availability)
        .where(eq(availability.photographerId, photographerId))
        .orderBy(asc(availability.id));
  }

  async addAvailability(data: InsertAvailability): Promise<AvailabilityType> {
      const [availabilitySlot] = await db
        .insert(availability)
        .values(data)
        .returning();
    return availabilitySlot;
  }

  async checkAvailability(
      photographerId: number,
      date: string,
      startTime: string,
      endTime: string
    ): Promise<boolean> {
      // Check if the photographer has availability for this time slot
      const availabilitySlots = await db
        .select()
        .from(availability)
        .where(
          and(
            eq(availability.photographerId, photographerId),
            eq(availability.date, date),
            eq(availability.startTime, startTime),
            eq(availability.endTime, endTime),
          )
        );

    return availabilitySlots.length > 0;
  }

  // ===== BOOKING OPERATIONS =====
  async getAllBookings(): Promise<any[]> {
    const bookingsData = await db.select().from(bookings);

    return Promise.all(
      bookingsData.map(async (booking) => {
        const [customer] = await db
          .select({
            name: users.name,
            email: users.email,
          })
          .from(users)
          .where(booking.customerId ? eq(users.id, booking.customerId) : undefined);

        const [photographer] = await db
          .select({
            id: photographers.id,
            name: users.name,
          })
          .from(photographers)
          .innerJoin(users, eq(photographers.id, users.id))
          .where(eq(photographers.id, booking.photographerId as number));

        return {
          ...booking,
          customer,
          photographer,
        };
      })
    );
  }

  async getCustomerBookings(customerId: number): Promise<any[]> {
    const bookingsData = await db
      .select()
      .from(bookings)
      .where(eq(bookings.customerId, customerId))
      .orderBy(desc(bookings.date));

    return Promise.all(
      bookingsData.map(async (booking) => {
        const [photographer] = await db
          .select({
            id: photographers.id,
            name: users.name,
          })
          .from(photographers)
          .innerJoin(users, eq(photographers.id, users.id))
          .where(eq(photographers.id, booking.photographerId as number));

        return {
          ...booking,
          photographer,
        };
      })
    );
  }

  async getPhotographerBookings(photographerId: number): Promise<any[]> {
    const bookingsData = await db
      .select()
      .from(bookings)
      .where(eq(bookings.photographerId, photographerId))
      .orderBy(desc(bookings.date));

    return Promise.all(
      bookingsData.map(async (booking) => {
        const [customer] = await db
          .select({
            name: users.name,
            email: users.email,
          })
          .from(users)
          .where(booking.customerId ? eq(users.id, booking.customerId) : undefined);

        return {
          ...booking,
          customer,
        };
      })
    );
  }

  async getBookingById(id: number): Promise<any | undefined> {

    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));

    if (!booking) {
      return undefined;
    }

    const [customer] = await db
      .select({
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, booking.customerId as number));

    const [photographer] = await db
      .select({
        id: photographers.id,
        name: users.name,
      })
      .from(photographers)
      .innerJoin(users, eq(photographers.id, users.id))
      .where(eq(photographers.id, booking.photographerId as number));

    return {
      ...booking,
      customer,
      photographer,
    };
  }

  async createBooking(data: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(data)
      .returning();
    return booking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async updateBookingPaymentIntent(id: number, paymentIntentId: string): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({ paymentIntentId })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async getPhotographerReviews(photographerId: number): Promise<any[]> {
    const reviewsData = await db
      .select()
      .from(reviews)
      .innerJoin(bookings, eq(reviews.bookingId, bookings.id))
      .where(eq(bookings.photographerId, photographerId));

    return Promise.all(
      reviewsData.map(async (review) => {
        const [customer] = await db
          .select({
            name: users.name,
            email: users.email,
          })
          .from(users)
          .where(eq(users.id, review.bookings.customerId as number));

        return {
          ...review,
          customer,
        };
      })
    );
  }
  async getReviewByBookingId(bookingId: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.bookingId, bookingId));
    return review;
  }
  async createReview(data: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(data).returning();
    return review;
  }

  // Deliverable operations
  async getDeliverables(bookingId: number): Promise<Deliverable[]> {
    return await db
      .select()
      .from(deliverables)
      .where(eq(deliverables.bookingId, bookingId));
  }

  async addDeliverable(data: InsertDeliverable): Promise<Deliverable> {
    const [deliverable] = await db
      .insert(deliverables)
      .values(data)
      .returning();
    return deliverable;
  }

  // Message operations
  async getBookingMessages(bookingId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.bookingId, bookingId))
      .orderBy(asc(messages.id));
  }

  async sendMessage(data: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(data)
      .returning();
    return message;
  }
}

const storage = new DatabaseStorage();
export { storage };
