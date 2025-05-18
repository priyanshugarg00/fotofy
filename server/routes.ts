import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { eq, inArray } from "drizzle-orm";
import Stripe from "stripe";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" as any }) 
  : undefined;

const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware setup
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (adminEmails.includes(user?.email || '')) {
        await storage.updateUserRole(userId, 'admin');
        if (user) user.role = 'admin';
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ===== CATEGORY ROUTES =====
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // ===== PHOTOGRAPHER ROUTES =====
  app.get('/api/photographers', async (req, res) => {
    try {
      const { category, city, date, minPrice, maxPrice } = req.query;
      
      const filter: any = {
        category: category ? String(category) : undefined,
        city: city ? String(city) : undefined,
        date: date ? String(date) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      };
      
      const photographers = await storage.getPhotographers(filter);
      res.json(photographers);
    } catch (error) {
      console.error("Error fetching photographers:", error);
      res.status(500).json({ message: "Failed to fetch photographers" });
    }
  });

  app.get('/api/photographers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const photographer = await storage.getPhotographerById(id);
      
      if (!photographer) {
        return res.status(404).json({ message: "Photographer not found" });
      }
      
      res.json(photographer);
    } catch (error) {
      console.error("Error fetching photographer:", error);
      res.status(500).json({ message: "Failed to fetch photographer" });
    }
  });

  app.post('/api/photographers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const photographerData = {
        userId,
        ...req.body
      };
      
      const photographer = await storage.createPhotographer(photographerData);
      
      // Update user role to photographer
      await storage.updateUserRole(userId, 'photographer');
      
      res.status(201).json(photographer);
    } catch (error) {
      console.error("Error creating photographer:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data provided", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create photographer" });
    }
  });

  app.put('/api/photographers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const photographerId = parseInt(req.params.id);
      
      const photographer = await storage.getPhotographerById(photographerId);
      
      if (!photographer) {
        return res.status(404).json({ message: "Photographer not found" });
      }
      
      if (photographer.userId !== userId) {
        const user = await storage.getUser(userId);
        if (user?.role !== 'admin') {
          return res.status(403).json({ message: "Not authorized to update this photographer" });
        }
      }
      
      const updatedPhotographer = await storage.updatePhotographer(photographerId, req.body);
      res.json(updatedPhotographer);
    } catch (error) {
      console.error("Error updating photographer:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data provided", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update photographer" });
    }
  });

  // ===== PORTFOLIO ROUTES =====
  app.get('/api/photographers/:id/portfolio', async (req, res) => {
    try {
      const photographerId = parseInt(req.params.id);
      const portfolio = await storage.getPortfolio(photographerId);
      res.json(portfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.post('/api/portfolio', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { photographerId } = req.body;
      
      // Validate photographer ownership
      const photographer = await storage.getPhotographerById(photographerId);
      
      if (!photographer) {
        return res.status(404).json({ message: "Photographer not found" });
      }
      
      if (photographer.userId !== userId) {
        const user = await storage.getUser(userId);
        if (user?.role !== 'admin') {
          return res.status(403).json({ message: "Not authorized to add portfolio items" });
        }
      }
      
      const portfolioItem = await storage.addPortfolioItem(req.body);
      res.status(201).json(portfolioItem);
    } catch (error) {
      console.error("Error adding portfolio item:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data provided", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add portfolio item" });
    }
  });

  // ===== AVAILABILITY ROUTES =====
  app.get('/api/photographers/:id/availability', async (req, res) => {
    try {
      const photographerId = parseInt(req.params.id);
      const availability = await storage.getAvailability(photographerId);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  app.post('/api/availability', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { photographerId } = req.body;
      
      // Validate photographer ownership
      const photographer = await storage.getPhotographerById(photographerId);
      
      if (!photographer) {
        return res.status(404).json({ message: "Photographer not found" });
      }
      
      if (photographer.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to add availability" });
      }
      
      const newAvailability = await storage.addAvailability(req.body);
      res.status(201).json(newAvailability);
    } catch (error) {
      console.error("Error adding availability:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data provided", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add availability" });
    }
  });

  // ===== BOOKING ROUTES =====
  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let bookings;
      
      if (user.role === 'customer') {
        bookings = await storage.getCustomerBookings(userId);
      } else if (user.role === 'photographer') {
        const photographer = await storage.getPhotographerByUserId(userId);
        if (!photographer) {
          return res.status(404).json({ message: "Photographer profile not found" });
        }
        bookings = await storage.getPhotographerBookings(photographer.id);
      } else if (user.role === 'admin') {
        bookings = await storage.getAllBookings();
      } else {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const booking = await storage.getBookingById(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check authorization
      if (
        user.role !== 'admin' && 
        booking.customerId !== userId && 
        !(user.role === 'photographer' && booking.photographerId === (await storage.getPhotographerByUserId(userId))?.id)
      ) {
        return res.status(403).json({ message: "Not authorized to view this booking" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const bookingData = {
        ...req.body,
        customerId: userId,
      };
      
      // Check if the requested time slot is available
      const isAvailable = await storage.checkAvailability(
        bookingData.photographerId, 
        bookingData.bookingDate, 
        bookingData.startTime, 
        bookingData.endTime
      );
      
      if (!isAvailable) {
        return res.status(400).json({ message: "The selected time slot is not available" });
      }
      
      // Create payment intent if Stripe is configured
      if (stripe) {
        try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: bookingData.totalAmount,
            currency: 'usd',
            metadata: {
              customerId: userId,
              photographerId: bookingData.photographerId.toString(),
            },
          });
          
          bookingData.stripePaymentIntentId = paymentIntent.id;
          
          const booking = await storage.createBooking(bookingData);
          
          res.status(201).json({
            booking,
            clientSecret: paymentIntent.client_secret,
          });
        } catch (stripeError) {
          console.error("Stripe error:", stripeError);
          res.status(500).json({ message: "Payment processing failed" });
        }
      } else {
        // If Stripe is not configured, just create the booking
        const booking = await storage.createBooking(bookingData);
        res.status(201).json({ booking });
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data provided", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch('/api/bookings/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const booking = await storage.getBookingById(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check authorization
      if (
        user.role !== 'admin' && 
        !(user.role === 'photographer' && booking.photographerId === (await storage.getPhotographerByUserId(userId))?.id) &&
        !(user.role === 'customer' && booking.customerId === userId && status === 'cancelled')
      ) {
        return res.status(403).json({ message: "Not authorized to update this booking" });
      }
      
      const updatedBooking = await storage.updateBookingStatus(bookingId, status);
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // ===== REVIEW ROUTES =====
  app.get('/api/photographers/:id/reviews', async (req, res) => {
    try {
      const photographerId = parseInt(req.params.id);
      const reviews = await storage.getPhotographerReviews(photographerId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const reviewData = {
        ...req.body,
        customerId: userId,
      };
      
      // Validate that the user booked this photographer and booking is completed
      const booking = await storage.getBookingById(reviewData.bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      if (booking.customerId !== userId || booking.status !== 'completed') {
        return res.status(403).json({ 
          message: "You can only review photographers after a completed booking" 
        });
      }
      
      // Check if already reviewed
      const existingReview = await storage.getReviewByBookingId(reviewData.bookingId);
      
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this booking" });
      }
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data provided", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // ===== DELIVERABLE ROUTES =====
  app.get('/api/bookings/:id/deliverables', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingId = parseInt(req.params.id);
      
      const booking = await storage.getBookingById(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check authorization
      if (
        user.role !== 'admin' && 
        booking.customerId !== userId && 
        !(user.role === 'photographer' && booking.photographerId === (await storage.getPhotographerByUserId(userId))?.id)
      ) {
        return res.status(403).json({ message: "Not authorized to view these deliverables" });
      }
      
      const deliverables = await storage.getDeliverables(bookingId);
      res.json(deliverables);
    } catch (error) {
      console.error("Error fetching deliverables:", error);
      res.status(500).json({ message: "Failed to fetch deliverables" });
    }
  });

  app.post('/api/deliverables', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bookingId } = req.body;
      
      const booking = await storage.getBookingById(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate that the user is the photographer for this booking or an admin
      if (
        user.role !== 'admin' && 
        !(user.role === 'photographer' && booking.photographerId === (await storage.getPhotographerByUserId(userId))?.id)
      ) {
        return res.status(403).json({ message: "Not authorized to add deliverables to this booking" });
      }
      
      const deliverable = await storage.addDeliverable(req.body);
      res.status(201).json(deliverable);
    } catch (error) {
      console.error("Error adding deliverable:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data provided", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add deliverable" });
    }
  });

  // ===== MESSAGE ROUTES =====
  app.get('/api/bookings/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingId = parseInt(req.params.id);
      
      const booking = await storage.getBookingById(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check authorization
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (
        user.role !== 'admin' && 
        booking.customerId !== userId && 
        !(user.role === 'photographer' && booking.photographerId === (await storage.getPhotographerByUserId(userId))?.id)
      ) {
        return res.status(403).json({ message: "Not authorized to view these messages" });
      }
      
      const messages = await storage.getBookingMessages(bookingId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const messageData = {
        ...req.body,
        senderId: userId,
      };
      
      const booking = await storage.getBookingById(messageData.bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check authorization
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const photographer = user.role === 'photographer' 
        ? await storage.getPhotographerByUserId(userId)
        : null;
      
      if (
        user.role !== 'admin' && 
        booking.customerId !== userId && 
        !(photographer && booking.photographerId === photographer.id)
      ) {
        return res.status(403).json({ message: "Not authorized to send messages for this booking" });
      }
      
      // Determine receiver
      if (booking.customerId === userId) {
        const photographerUser = await storage.getPhotographerUserById(booking.photographerId);
        messageData.receiverId = photographerUser.id;
      } else {
        messageData.receiverId = booking.customerId;
      }
      
      const message = await storage.sendMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data provided", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // ===== ADMIN ROUTES =====
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized - Admin access required" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/admin/photographers/:id/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const photographerId = parseInt(req.params.id);
      const { isVerified } = req.body;
      
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized - Admin access required" });
      }
      
      if (typeof isVerified !== 'boolean') {
        return res.status(400).json({ message: "isVerified must be a boolean" });
      }
      
      const photographer = await storage.updatePhotographerVerification(photographerId, isVerified);
      res.json(photographer);
    } catch (error) {
      console.error("Error updating photographer verification:", error);
      res.status(500).json({ message: "Failed to update photographer verification" });
    }
  });

  // ===== PAYMENT ROUTES =====
  app.post('/api/create-payment-intent', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }
    
    try {
      const { bookingId } = req.body;
      const userId = req.user.claims.sub;
      
      const booking = await storage.getBookingById(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      if (booking.customerId !== userId) {
        return res.status(403).json({ message: "Not authorized to pay for this booking" });
      }
      
      if (booking.stripePaymentIntentId) {
        // Retrieve existing payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripePaymentIntentId);
        
        res.json({
          clientSecret: paymentIntent.client_secret,
        });
      } else {
        // Create new payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: booking.totalAmount,
          currency: 'usd',
          metadata: {
            customerId: userId,
            photographerId: booking.photographerId.toString(),
            bookingId: booking.id.toString(),
          },
        });
        
        // Update booking with payment intent id
        await storage.updateBookingPaymentIntent(booking.id, paymentIntent.id);
        
        res.json({
          clientSecret: paymentIntent.client_secret,
        });
      }
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
