import {
  users,
  type User,
  type UpsertUser,
  photographers,
  type Photographer,
  type InsertPhotographer,
  categories,
  photographerCategories,
  portfolioItems,
  type PortfolioItem,
  type InsertPortfolioItem,
  availability,
  type Availability,
  type InsertAvailability,
  bookings,
  type Booking,
  type InsertBooking,
  reviews,
  type Review,
  type InsertReview,
  deliverables,
  type Deliverable,
  type InsertDeliverable,
  messages,
  type Message,
  type InsertMessage
} from "@shared/schema";
import { db } from "./db";
import { and, asc, desc, eq, gte, inArray, lte, or, sql } from "drizzle-orm";
import { format } from "date-fns";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(userId: string, role: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
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
  getAvailability(photographerId: number): Promise<Availability[]>;
  addAvailability(data: InsertAvailability): Promise<Availability>;
  checkAvailability(photographerId: number, date: string, startTime: string, endTime: string): Promise<boolean>;
  
  // Booking operations
  getAllBookings(): Promise<any[]>;
  getCustomerBookings(customerId: string): Promise<any[]>;
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
  // ===== USER OPERATIONS =====
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // ===== PHOTOGRAPHER OPERATIONS =====
  async getPhotographers(filter?: any): Promise<any[]> {
    // Create base query
    const query = db
      .select({
        id: photographers.id,
        userId: photographers.userId,
        bio: photographers.bio,
        city: photographers.city,
        state: photographers.state,
        baseRate: photographers.baseRate,
        isVerified: photographers.isVerified,
        isActive: photographers.isActive,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(photographers)
      .innerJoin(users, eq(photographers.userId, users.id))
      .where(eq(photographers.isActive, true));
    
    // Execute the query
    const photographersData = await query;

    // Fetch additional data for each photographer
    const photographersWithExtras = await Promise.all(
      photographersData.map(async (photographer) => {
        // Get categories
        const categoriesJoin = await db
          .select({
            categoryId: photographerCategories.categoryId,
            name: categories.name,
          })
          .from(photographerCategories)
          .innerJoin(
            categories,
            eq(photographerCategories.categoryId, categories.id)
          )
          .where(eq(photographerCategories.photographerId, photographer.id));

        const photographerCats = categoriesJoin.map((c) => ({
          id: c.categoryId,
          name: c.name,
        }));

        // Filter by category if specified
        if (filter?.category && !photographerCats.some(c => c.name === filter.category)) {
          return null;
        }

        // Get average rating
        const ratingResult = await db
          .select({
            averageRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
            count: sql<number>`COUNT(${reviews.id})`,
          })
          .from(reviews)
          .where(eq(reviews.photographerId, photographer.id));

        // Check availability for date if specified
        if (filter?.date) {
          const availableOnDate = await this.checkPhotographerAvailableOnDate(
            photographer.id,
            filter.date
          );
          
          if (!availableOnDate) {
            return null;
          }
        }

        // Get a sample portfolio item for preview
        const [portfolioSample] = await db
          .select()
          .from(portfolioItems)
          .where(eq(portfolioItems.photographerId, photographer.id))
          .limit(1);

        return {
          ...photographer,
          categories: photographerCategories,
          rating: {
            average: ratingResult[0].averageRating,
            count: ratingResult[0].count,
          },
          portfolioSample: portfolioSample?.imageUrl || null,
        };
      })
    );

    // Filter out nulls (photographers that didn't match category or date filter)
    return photographersWithExtras.filter(Boolean);
  }

  async checkPhotographerAvailableOnDate(photographerId: number, dateStr: string): Promise<boolean> {
    const result = await db
      .select()
      .from(availability)
      .where(
        and(
          eq(availability.photographerId, photographerId),
          eq(availability.date, dateStr),
          eq(availability.isBooked, false)
        )
      );
    
    return result.length > 0;
  }

  async getPhotographerById(id: number): Promise<any | undefined> {
    const [photographer] = await db
      .select()
      .from(photographers)
      .where(eq(photographers.id, id));

    if (!photographer) {
      return undefined;
    }

    const [user] = await db
      .select({
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        email: users.email,
        phone: users.phone,
      })
      .from(users)
      .where(eq(users.id, photographer.userId));

    // Get categories
    const categoriesJoin = await db
      .select({
        categoryId: photographerCategories.categoryId,
        name: categories.name,
      })
      .from(photographerCategories)
      .innerJoin(
        categories,
        eq(photographerCategories.categoryId, categories.id)
      )
      .where(eq(photographerCategories.photographerId, id));

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
      .where(eq(reviews.photographerId, id));

    // Get portfolio preview
    const portfolio = await db
      .select()
      .from(portfolioItems)
      .where(eq(portfolioItems.photographerId, id))
      .limit(6);

    return {
      ...photographer,
      ...user,
      categories: photographerCategories,
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
      .where(eq(photographers.userId, userId));
    return photographer;
  }

  async getPhotographerUserById(photographerId: number): Promise<User | undefined> {
    const [photographer] = await db
      .select()
      .from(photographers)
      .where(eq(photographers.id, photographerId));
    
    if (!photographer) {
      return undefined;
    }
    
    return this.getUser(photographer.userId);
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
        updatedAt: new Date(),
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
        updatedAt: new Date(),
      })
      .where(eq(photographers.id, id))
      .returning();
    return photographer;
  }

  // ===== CATEGORY OPERATIONS =====
  async getCategories(): Promise<any[]> {
    return await db.select().from(categories);
  }

  async getCategoryById(id: number): Promise<any | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return category;
  }

  // ===== PORTFOLIO OPERATIONS =====
  async getPortfolio(photographerId: number): Promise<PortfolioItem[]> {
    return await db
      .select()
      .from(portfolioItems)
      .where(eq(portfolioItems.photographerId, photographerId));
  }

  async addPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem> {
    const [portfolioItem] = await db
      .insert(portfolioItems)
      .values(item)
      .returning();
    return portfolioItem;
  }

  // ===== AVAILABILITY OPERATIONS =====
  async getAvailability(photographerId: number): Promise<Availability[]> {
    return await db
      .select()
      .from(availability)
      .where(eq(availability.photographerId, photographerId))
      .orderBy(availability.date, asc(availability.startTime));
  }

  async addAvailability(data: InsertAvailability): Promise<Availability> {
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
          eq(availability.isBooked, false)
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
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            profileImageUrl: users.profileImageUrl,
          })
          .from(users)
          .where(eq(users.id, booking.customerId));

        const [photographer] = await db
          .select({
            id: photographers.id,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
          })
          .from(photographers)
          .innerJoin(users, eq(photographers.userId, users.id))
          .where(eq(photographers.id, booking.photographerId));

        return {
          ...booking,
          customer,
          photographer,
        };
      })
    );
  }

  async getCustomerBookings(customerId: string): Promise<any[]> {
    const bookingsData = await db
      .select()
      .from(bookings)
      .where(eq(bookings.customerId, customerId))
      .orderBy(desc(bookings.createdAt));

    return Promise.all(
      bookingsData.map(async (booking) => {
        const [photographer] = await db
          .select({
            id: photographers.id,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
          })
          .from(photographers)
          .innerJoin(users, eq(photographers.userId, users.id))
          .where(eq(photographers.id, booking.photographerId));

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
      .orderBy(desc(bookings.createdAt));

    return Promise.all(
      bookingsData.map(async (booking) => {
        const [customer] = await db
          .select({
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            profileImageUrl: users.profileImageUrl,
          })
          .from(users)
          .where(eq(users.id, booking.customerId));

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
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        profileImageUrl: users.profileImageUrl,
      })
      .from(users)
      .where(eq(users.id, booking.customerId));

    const [photographer] = await db
      .select({
        id: photographers.id,
        userId: photographers.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
      .from(photographers)
      .innerJoin(users, eq(photographers.userId, users.id))
      .where(eq(photographers.id, booking.photographerId));

    return {
      ...booking,
      customer,
      photographer,
    };
  }

  async createBooking(data: InsertBooking): Promise<Booking> {
    // Mark availability as booked
    await db
      .update(availability)
      .set({ isBooked: true })
      .where(
        and(
          eq(availability.photographerId, data.photographerId),
          eq(availability.date, data.bookingDate),
          eq(availability.startTime, data.startTime),
          eq(availability.endTime, data.endTime)
        )
      );

    const [booking] = await db
      .insert(bookings)
      .values(data)
      .returning();
    return booking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async updateBookingPaymentIntent(id: number, paymentIntentId: string): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({
        stripePaymentIntentId: paymentIntentId,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  // ===== REVIEW OPERATIONS =====
  async getPhotographerReviews(photographerId: number): Promise<any[]> {
    const reviewsData = await db
      .select()
      .from(reviews)
      .where(eq(reviews.photographerId, photographerId))
      .orderBy(desc(reviews.createdAt));

    return Promise.all(
      reviewsData.map(async (review) => {
        const [customer] = await db
          .select({
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
          })
          .from(users)
          .where(eq(users.id, review.customerId));

        return {
          ...review,
          customer,
        };
      })
    );
  }

  async getReviewByBookingId(bookingId: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.bookingId, bookingId));
    return review;
  }

  async createReview(data: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(data)
      .returning();
    return review;
  }

  // ===== DELIVERABLE OPERATIONS =====
  async getDeliverables(bookingId: number): Promise<Deliverable[]> {
    return await db
      .select()
      .from(deliverables)
      .where(eq(deliverables.bookingId, bookingId))
      .orderBy(desc(deliverables.uploadedAt));
  }

  async addDeliverable(data: InsertDeliverable): Promise<Deliverable> {
    const [deliverable] = await db
      .insert(deliverables)
      .values(data)
      .returning();
    return deliverable;
  }

  // ===== MESSAGE OPERATIONS =====
  async getBookingMessages(bookingId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.bookingId, bookingId))
      .orderBy(asc(messages.sentAt));
  }

  async sendMessage(data: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(data)
      .returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
