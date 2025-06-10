import React from "react";

export default function About() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <h1 className="text-4xl font-bold mb-8 text-center">About Fotofy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="lead mb-8">
          Fotofy was founded with a simple yet powerful vision: to make professional photography accessible to everyone while creating opportunities for talented photographers to showcase their work and grow their business.
        </p>
        
        <h2 className="text-2xl font-semibold mt-10 mb-4">Our Mission</h2>
        <p>
          Our mission is to bridge the gap between customers looking for quality photography services and the talented photographers who can deliver exceptional results. We believe that every moment is worth capturing professionally, and our platform makes this possible by providing a seamless, transparent booking experience.
        </p>
        
        <h2 className="text-2xl font-semibold mt-10 mb-4">What We Offer</h2>
        <div className="grid md:grid-cols-2 gap-8 my-8">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-3">For Customers</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Easy search and discovery of photographers by location, specialization, and price range</li>
              <li>Verified photographer profiles with portfolio samples</li>
              <li>Secure booking and payment system</li>
              <li>Direct communication with photographers</li>
              <li>Review system to ensure quality service</li>
            </ul>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-3">For Photographers</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Professional profile to showcase your work</li>
              <li>Flexible booking management system</li>
              <li>Direct payment processing</li>
              <li>Exposure to a wide customer base</li>
              <li>Tools to grow your photography business</li>
            </ul>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold mt-10 mb-4">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-6 my-8">
          <div className="text-center p-4">
            <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Quality</h3>
            <p className="text-gray-600 mt-2">We maintain high standards for photographers on our platform to ensure customers get exceptional service.</p>
          </div>
          
          <div className="text-center p-4">
            <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Fairness</h3>
            <p className="text-gray-600 mt-2">We believe in fair pricing and transparent terms for both customers and photographers.</p>
          </div>
          
          <div className="text-center p-4">
            <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Community</h3>
            <p className="text-gray-600 mt-2">We foster a community of passionate photographers and clients who value the art of photography.</p>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold mt-10 mb-4">Our Team</h2>
        <p>
          Fotofy is powered by a passionate team of photographers, tech enthusiasts, and business professionals who understand both the art of photography and the needs of customers. Our diverse team brings together expertise in technology, customer service, and the photography industry to create a platform that truly serves the needs of our users.
        </p>
        
        <h2 className="text-2xl font-semibold mt-10 mb-4">Join Us</h2>
        <p className="mb-8">
          Whether you're a customer looking for a photographer or a photographer looking to grow your business, Fotofy is the platform for you. Join our growing community today and be part of the photography revolution.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
          <a href="/photographers" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            Find a Photographer
          </a>
          <a href="/join-photographer" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            Join as a Photographer
          </a>
        </div>
      </div>
    </div>
  );
}