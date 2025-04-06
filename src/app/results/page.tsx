"use client"

import { ArrowLeft, ChevronRight, DollarSign, Info, MapPin, Phone, Search, Shield } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Hospital, Procedure } from '../../lib/types';
import HospitalFinderModal from "../components/HospitalFinderModal";
import ProcedureSuggestions from "../components/ProcedureSuggestions";

export default function ResultsPage() {
    const searchParams = useSearchParams();
    const [procedures, setProcedures] = useState<Procedure[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showHospitalFinder, setShowHospitalFinder] = useState(false);
    const [selectedProcedure, setSelectedProcedure] = useState<string | null>(null);
    const [insurance, setInsurance] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Get symptoms from URL or localStorage
                const symptomsParam = searchParams.get("symptoms");
                const symptoms = symptomsParam || localStorage.getItem("symptoms") || "";
                
                // Get procedures from localStorage or API
                const storedProcedures = localStorage.getItem("procedureSuggestions");
                if (storedProcedures) {
                    setProcedures(JSON.parse(storedProcedures));
                } else if (symptoms) {
                    // If no stored procedures but we have symptoms, fetch from API
                    const response = await fetch("/api/symptoms", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ symptoms }),
                    });

                    if (!response.ok) {
                        throw new Error("Failed to fetch procedure suggestions");
                    }

                    const data = await response.json();
                    setProcedures(data.procedures);
                    localStorage.setItem("procedureSuggestions", JSON.stringify(data.procedures));
                }

                // Get insurance and zip code from URL or prompt user
                const insuranceParam = searchParams.get("insurance");
                const zipCodeParam = searchParams.get("zipCode");
                
                if (insuranceParam && zipCodeParam) {
                    setInsurance(insuranceParam);
                    setZipCode(zipCodeParam);
                    await fetchHospitals(insuranceParam, zipCodeParam);
                }
                
                // Show procedure suggestions if we have procedures
                if (procedures.length > 0) {
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load procedure suggestions. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams]);

    const fetchHospitals = async (insuranceProvider: string, zipCode: string) => {
        try {
            const response = await fetch(`/api/hospitals?insurance=${insuranceProvider}&zipCode=${zipCode}`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch hospitals");
            }
            
            const data = await response.json();
            // Handle both array and object with hospitals property
            const hospitalsData = Array.isArray(data) ? data : (data.hospitals || []);
            setHospitals(hospitalsData);
        } catch (err) {
            console.error("Error fetching hospitals:", err);
            setError("Failed to load hospitals. Please try again.");
        }
    };

    const handleProcedureSelect = (procedure: Procedure) => {
        setSelectedProcedure(procedure.name);
        // Show hospital finder when a procedure is selected
        setShowHospitalFinder(true);
    };

    const handleHospitalFinderClose = () => {
        setShowHospitalFinder(false);
    };

    const handleHospitalFinderSearch = async (insuranceProvider: string, zipCode: string) => {
        setInsurance(insuranceProvider);
        setZipCode(zipCode);
        await fetchHospitals(insuranceProvider, zipCode);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your results...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="bg-gray-900 p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-800">
                    <div className="text-red-500 text-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-center mb-2 text-white">Something went wrong</h2>
                    <p className="text-gray-400 text-center mb-6">{error}</p>
                    <Link href="/" className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center mb-8">
                    <Link href="/" className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
                        <ArrowLeft className="mr-2" />
                        Back to Home
                    </Link>
                </div>

                <div className="bg-gray-900 rounded-xl shadow-lg p-8 mb-8 border border-gray-800">
                    <h1 className="text-3xl font-bold mb-2 text-white">
                        Procedure Results
                    </h1>
                    <p className="text-gray-400 mb-6">
                        Explore procedures, compare costs, and find hospitals that accept your insurance.
                    </p>
                    
                    {/* Procedure Suggestions */}
                    {showSuggestions && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center text-white">
                                <Search className="mr-2 text-blue-400" />
                                Find More Procedures
                            </h2>
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                                <ProcedureSuggestions />
                            </div>
                        </div>
                    )}
                </div>

                {procedures.length > 0 ? (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
                            <Info className="mr-2 text-blue-400" />
                            Recommended Procedures
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {procedures.map((procedure) => (
                                <div 
                                    key={procedure.id} 
                                    className={`bg-gray-900 rounded-xl shadow-md overflow-hidden transition-all transform hover:scale-[1.02] border border-gray-800 ${
                                        selectedProcedure === procedure.name ? 'ring-2 ring-blue-500' : ''
                                    }`}
                                    onClick={() => handleProcedureSelect(procedure)}
                                >
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold mb-2 text-white">{procedure.name}</h3>
                                        <p className="text-gray-400 mb-4 line-clamp-3">{procedure.description}</p>
                                        
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="flex items-center">
                                                <DollarSign className="h-5 w-5 text-green-400 mr-2" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Match Score</p>
                                                    <p className="font-medium text-white">
                                                        {procedure.matchScore 
                                                            ? `${(procedure.matchScore * 100).toFixed(1)}%` 
                                                            : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Shield className="h-5 w-5 text-blue-400 mr-2" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Category</p>
                                                    <p className="font-medium text-white">
                                                        {procedure.category || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
                                        <button 
                                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProcedure(procedure.name);
                                                setShowHospitalFinder(true);
                                            }}
                                        >
                                            <Search className="w-4 h-4 mr-2" />
                                            Find Hospitals
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-900 border-l-4 border-yellow-500 p-4 rounded-lg mb-8 border border-gray-800">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-400">
                                    No procedures found. Please try a different search.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {selectedProcedure && hospitals.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
                            <MapPin className="mr-2 text-blue-400" />
                            Hospitals for {selectedProcedure}
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {hospitals.map((hospital) => (
                                <div key={hospital.id} className="bg-gray-900 rounded-xl shadow-md overflow-hidden transition-all transform hover:scale-[1.02] border border-gray-800">
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold mb-2 text-white">{hospital.name}</h3>
                                        <div className="flex items-start mb-4">
                                            <MapPin className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                                            <p className="text-gray-400">{hospital.address}</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="flex items-center">
                                                <MapPin className="h-5 w-5 text-blue-400 mr-2" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Distance</p>
                                                    <p className="font-medium text-white">{hospital.distance}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Phone className="h-5 w-5 text-green-400 mr-2" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Phone</p>
                                                    <p className="font-medium text-white">{hospital.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <p className="text-sm text-gray-500 mb-2">Accepted Insurance</p>
                                            <div className="flex flex-wrap gap-2">
                                                {hospital.insurance && hospital.insurance.map((ins: string, index: number) => (
                                                    <span 
                                                        key={index}
                                                        className="bg-blue-900 text-blue-300 text-xs font-medium px-2.5 py-1 rounded-full"
                                                    >
                                                        {ins}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {showHospitalFinder && (
                    <HospitalFinderModal
                        onClose={handleHospitalFinderClose}
                        onSearch={handleHospitalFinderSearch}
                        procedureName={selectedProcedure || undefined}
                    />
                )}
            </div>
        </div>
    );
}