import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminLoginPage = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">Enter your ID and password to access the admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="id">ID</Label>
            <Input id="id" placeholder="Enter your ID" type="text" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" placeholder="Enter your password" type="password" />
          </div>
          <Button>Login</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;