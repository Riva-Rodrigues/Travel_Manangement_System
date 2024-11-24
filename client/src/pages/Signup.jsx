import React, { useState } from "react";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
    const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    address: "",
    phone: "",
  });
  // console.log(formData);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/api/auth/signup`, formData);
      if (res?.data?.success) {
        alert(res?.data?.message);
        navigate("/login");
      } else {
        alert(res?.data?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative bg-[url('https://images.unsplash.com/photo-1505954137021-b6bf5a131a7b?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center"
    >
      <div className="absolute inset-0 bg-black/20" />

      <div className="grid lg:grid-cols-2 w-full max-w-6xl gap-8 relative z-10">
      <div className="hidden lg:flex flex-col items-center justify-center text-white p-8">
          <h2 className="text-4xl font-bold text-center mb-8 leading-tight">
            THE GOAL OF LIFE IS LIVING IN AGREEMENT WITH NATURE.
          </h2>

          {/* Social Media Icons */}
          <div className="flex space-x-6">
            <a href="#" className="hover:scale-110 transition-transform">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="#" className="hover:scale-110 transition-transform">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="#" className="hover:scale-110 transition-transform">
              <Linkedin className="w-6 h-6" />
            </a>
            <a href="#" className="hover:scale-110 transition-transform">
              <Twitter className="w-6 h-6" />
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
        <div className="backdrop-blur-md bg-white/10 p-8 py-8 rounded-xl shadow-2xl">
          <div className="w-full max-w-md mx-auto space-y-6">
            <h1 className="text-2xl font-semibold text-white mb-8">
              Signup
            </h1>

            <div className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="username" className="text-white text-sm">Username</label>
                <input
                  type="username"
                  id="username"
                  placeholder="Enter your username"
                  className="w-full p-3 rounded bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white"
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-white text-sm">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="w-full p-3 rounded bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white"
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-white text-sm">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  className="w-full p-3 rounded bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white"
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-white text-sm">Phone</label>
                <input
                  type="text"
                  id="phone"
                  placeholder="Enter your phone number"
                  className="w-full p-3 rounded bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white"
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="text-white text-sm">Address</label>
                <textarea
                maxLength={200}
                type="text"
                id="address"
                className="w-full p-3 rounded bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white"
                onChange={handleChange}
              />
              </div>

              <button className="w-full p-3 rounded bg-white text-black font-semibold hover:bg-white/90 transition">
                SIGNUP
              </button>

              <div className="text-center text-white">
               Already have an account? <Link to={`/login`} className="underline">Login</Link>
              </div>
            </div>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
}


