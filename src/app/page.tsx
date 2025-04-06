// app/page.tsx
"use client";

import { CostComparison as CostComparisonType, Hospital, Procedure, ProcedureCost } from '@/lib/types';
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronRight, Heart, LineChart, MessageSquare, Shield, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar';

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [costComparison, setCostComparison] = useState<CostComparisonType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const proceduresRes = await fetch('/api/procedures');

        if (!proceduresRes.ok) {
          throw new Error('Failed to fetch procedures');
        }

        const proceduresData = await proceduresRes.json();
        setProcedures(proceduresData);
      } catch (err) {
        setError('Failed to load procedures. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProcedureSelect = async (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    try {
      // Fetch hospitals only when a procedure is selected
      const [costsRes, hospitalsRes] = await Promise.all([
        fetch(`/api/procedure-costs?procedure=${encodeURIComponent(procedure.name)}`),
        fetch('/api/hospitals')
      ]);

      if (!costsRes.ok || !hospitalsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [costs, hospitalsData] = await Promise.all([
        costsRes.json(),
        hospitalsRes.json()
      ]);

      setHospitals(hospitalsData.hospitals);
      
      // Create cost comparison data
      const comparison: CostComparisonType = {
        procedure,
        hospitalCosts: (costs as ProcedureCost[]).map((cost: ProcedureCost) => ({
          hospital: hospitalsData.hospitals.find((h: Hospital) => h.zip_code === cost.zip_code)!,
          cost
        }))
      };
      
      setCostComparison(comparison);
    } catch (err) {
      setError('Failed to load cost comparison. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <motion.section 
        style={{ y, opacity }}
        className="relative min-h-screen flex items-center justify-center"
      >
        {/* Dynamic Grid Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px]"></div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-purple-900/20"
          />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center space-x-2 text-blue-400 mb-6">
                <div className="h-px w-8 bg-blue-400"></div>
                <span className="text-sm font-medium tracking-wider uppercase">Healthcare Intelligence Platform</span>
              </div>
              <h1 className="text-5xl sm:text-7xl font-bold mb-8 leading-tight">
                Transform Healthcare
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                  Cost Analysis
                </span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                Leverage AI-powered insights to understand healthcare costs, make informed decisions, and optimize your healthcare spending with unprecedented precision.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-start gap-6 mt-12"
            >
              <Link 
                href="/chat" 
                className="group relative px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-500 ease-out"></div>
                <span className="relative flex items-center">
                  Start Analysis
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link 
                href="/about" 
                className="group px-8 py-4 border border-white/20 hover:bg-white/5 rounded-lg"
              >
                <span className="flex items-center">
                  Learn More
                  <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute right-0 top-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute left-0 bottom-1/4 w-64 h-64 bg-purple-500/10 rounded-full filter blur-2xl"></div>
      </motion.section>

      {/* Features Grid */}
      <section className="relative py-32 bg-[#0A0A0A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Enterprise-Grade
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Healthcare Analytics
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Unlock the power of data-driven healthcare cost management with our comprehensive suite of tools.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Predictive Cost Analysis",
                description: "AI-powered algorithms analyze historical data to predict and optimize healthcare costs with unprecedented accuracy.",
                icon: LineChart,
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                title: "Insurance Coverage Optimization",
                description: "Real-time analysis of insurance policies to maximize coverage and minimize out-of-pocket expenses.",
                icon: Shield,
                gradient: "from-purple-500 to-pink-500"
              },
              {
                title: "Healthcare Provider Intelligence",
                description: "Comprehensive data on healthcare providers, including cost comparisons and quality metrics.",
                icon: Stethoscope,
                gradient: "from-indigo-500 to-blue-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-white/5 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-6`}>
                  <div className="w-full h-full bg-[#0A0A0A] rounded-xl flex items-center justify-center">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-8">
                Ready to Transform Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Healthcare Cost Management?
                </span>
              </h2>
              <p className="text-xl text-gray-400 mb-12">
                Join leading healthcare organizations in leveraging our AI-powered platform for optimal cost efficiency.
              </p>
              <Link 
                href="/chat" 
                className="group relative inline-flex items-center px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-500 ease-out"></div>
                <span className="relative flex items-center text-lg font-semibold">
                  Begin Your Transformation
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How PriceAware+ Helps You</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/5 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Medical Advice</h3>
              <p className="text-gray-400 mb-4">
                Describe your symptoms and get intelligent suggestions for medical procedures,
                along with detailed explanations and cost estimates.
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center text-blue-500 hover:text-blue-400"
              >
                Try it now
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <LineChart className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cost Comparison</h3>
              <p className="text-gray-400 mb-4">
                Compare procedure costs across different hospitals, view historical trends,
                and get forecasts to help you plan your healthcare expenses.
              </p>
              <Link
                href="/compare"
                className="inline-flex items-center text-blue-500 hover:text-blue-400"
              >
                Compare costs
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Insurance Coverage</h3>
              <p className="text-gray-400 mb-4">
                Understand your insurance coverage, find in-network providers,
                and estimate your out-of-pocket costs for different procedures.
              </p>
              <Link
                href="/insurance"
                className="inline-flex items-center text-blue-500 hover:text-blue-400"
              >
                View coverage
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Make Better Healthcare Decisions?</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Start by describing your symptoms to our AI assistant, or explore our cost comparison tools
            to find the most affordable healthcare options.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            Get Started
            <Heart className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}