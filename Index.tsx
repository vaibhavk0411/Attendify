
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scan, Cloud, BarChart3, Users, Shield, Clock, CheckCircle } from "lucide-react";
import img from '../img.png';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: CheckCircle,
      title: "Face Recognition",
      description: "Advanced AI-powered facial recognition for accurate attendance tracking"
    },
    {
      icon: Cloud,
      title: "Serverless AWS",
      description: "Reliable, scalable cloud infrastructure with AWS Rekognition"
    },
    {
      icon: BarChart3,
      title: "Attendance Analytics",
      description: "Comprehensive reports and analytics for attendance management"
    }
  ];

  const handleLogin = (type: 'user' | 'admin') => {
    navigate('/login', { state: { type } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-bold text-gray-900">Attendify</span>
          </div>
          <div className="flex space-x-3">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/register')}>
              Register
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Smart Attendance,{" "}
              <span className="block">Seamlessly</span>
              <span className="text-blue-600">Cloud-Powered</span>
            </h1>
            
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-lg text-gray-700">{feature.title}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                onClick={() => handleLogin('user')}
              >
                Login as User
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3"
                onClick={() => handleLogin('admin')}
              >
                Login as Admin
              </Button>
            </div>
          </div>
          
          <div className="hidden lg:flex justify-center">
            <img src={img} alt="Attendify" className="w-[400px] h-[400px] object-contain rounded-lg shadow-lg" />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500">
          <p>&copy;Attendify. Built with modern technology for the future of work.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
