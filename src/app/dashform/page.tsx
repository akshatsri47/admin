"use client";
import React, { useState } from "react";
import Link from "next/link";
import { CropTable } from "../../components/CropTable";
import { DiseaseTable } from "../../components/DiseaseTable";
import { RecommendationTable } from "../../components/RecommendationTable";

export default function Dashboard() {
  // Tabs: "crop", "disease", "recommendation"
  const [activeTab, setActiveTab] = useState<"crop" | "disease" | "recommendation">("crop");

  // Helper to generate tab classes
  const getTabClasses = (tab: "crop" | "disease" | "recommendation") => {
    const baseClasses = "px-4 py-2 rounded-t-md font-semibold focus:outline-none";
    const activeClasses = "bg-white border-x border-t border-gray-300";
    const inactiveClasses = "text-gray-500 hover:bg-gray-100";

    return `${baseClasses} ${activeTab === tab ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Navigation + "Go to Form" button */}
      <div className="flex items-center justify-between mb-4">
        {/* Tabs */}
        <div className="flex space-x-1">
          <button className={getTabClasses("crop")} onClick={() => setActiveTab("crop")}>
            Crop
          </button>
          <button className={getTabClasses("disease")} onClick={() => setActiveTab("disease")}>
            Disease
          </button>
          <button
            className={getTabClasses("recommendation")}
            onClick={() => setActiveTab("recommendation")}
          >
            Recommendation
          </button>
        </div>

        {/* Navigation button to the form route */}
        <Link href="/form">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
            Go to Form
          </button>
        </Link>
      </div>

      {/* Tab content container (optional border box to highlight active tab) */}
      <div className="border border-gray-300 rounded-b-md p-4 bg-white">
        {activeTab === "crop" && <CropTable />}
        {activeTab === "disease" && <DiseaseTable />}
        {activeTab === "recommendation" && <RecommendationTable />}
      </div>
    </div>
  );
}
