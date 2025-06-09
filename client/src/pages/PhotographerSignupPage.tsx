import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";

const PhotographerSignupPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [typesOfShoot, setTypesOfShoot] = useState('');

  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [digiLockerId, setDigiLockerId] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    console.log('Full Name:', fullName);
    console.log('Email:', email);
    console.log('Contact Number:', contactNumber);
    console.log('Password:', password);
    console.log('Confirm Password:', confirmPassword);
    console.log('Types of Shoot:', typesOfShoot);
    console.log('Experience:', experience);
    console.log('Location:', location);
    console.log('DigiLocker ID:', digiLockerId);
    console.log('Portfolio Link:', portfolioLink);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12">
      <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Photographer Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input
              type="tel"
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="Enter your contact number"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">New Password</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>
          <div>
            <Label htmlFor="typesOfShoot">Types of Shoot</Label>
            <Input
              type="text"
              id="typesOfShoot"
              value={typesOfShoot}
              onChange={(e) => setTypesOfShoot(e.target.value)}
              placeholder="Enter types of shoot (e.g., wedding, portrait)"
              required
            />
          </div>
          <div>
            <Label htmlFor="experience">Experience</Label>
            <Input
              type="text"
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Enter your experience (e.g., 2 years)"
              required
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your location"
              required
            />
          </div>
          <div>
            <Label htmlFor="digiLockerId">DigiLocker ID Proof</Label>
            <Input
              type="file"
              id="digiLockerId"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setDigiLockerId(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="portfolioLink">Portfolio Link</Label>
            <Input
              type="text"
              id="portfolioLink"
              value={portfolioLink}
              onChange={(e) => setPortfolioLink(e.target.value)}
              placeholder="Enter your Portfolio Link"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
          <p className="text-sm text-gray-500">
            Already have an account? <Link href="/login" className="text-primary">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default PhotographerSignupPage;