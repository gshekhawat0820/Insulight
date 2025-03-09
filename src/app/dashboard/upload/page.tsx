"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  UploadCloud, 
  FileType, 
  CheckCircle2, 
  AlertCircle, 
  BrainCircuit,
  Sparkles 
} from "lucide-react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [anonymizedCsvUrl, setAnonymizedCsvUrl] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile);
        setUploadStatus(null);
        setParsedData(null);
        setAnonymizedCsvUrl(null);
        setInsights(null);
      } else {
        setUploadStatus({
          success: false,
          message: "Please select a CSV file",
        });
        setFile(null);
      }
    }
  };

  const parseCSV = useCallback(async (fileContent: string) => {
    // Simple CSV parser
    const rows = fileContent.split("\n");
    const headers = rows[0].split(",").map(header => header.trim());
    
    // Check if the CSV has required headers
    const requiredHeaders = ["Timestamp (YYYY-MM-DDThh:mm:ss)", "Glucose Value (mg/dL)", "Insulin Value (u)"];
    const missingHeaders = requiredHeaders.filter(h => 
      !headers.some(header => header.toLowerCase().includes(h.toLowerCase()))
    );
    
    if (missingHeaders.length > 0) {
      setUploadStatus({
        success: false,
        message: `CSV is missing required headers: ${missingHeaders.join(", ")}`,
      });
      return null;
    }
    
    // Parse the data
    const parsedData = [];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].trim() === "") continue;
      
      const values = rows[i].split(",").map(val => val.trim());
      const rowData: Record<string, any> = {};
      
      headers.forEach((header, index) => {
        rowData[header] = values[index] || "";
      });
      
      parsedData.push(rowData);
    }
    
    return parsedData;
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setUploadStatus(null);
    setParsedData(null);
    setAnonymizedCsvUrl(null);
    setInsights(null);
    
    try {
      // Read file content
      const fileContent = await file.text();
      
      // Parse CSV
      const data = await parseCSV(fileContent);
      if (!data) {
        setUploading(false);
        return;
      }
      
      // Get user ID
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setUploadStatus({
          success: false,
          message: "Authentication error. Please log in again.",
        });
        setUploading(false);
        return;
      }
      
      // Process and show data preview
      const processedData = data.map(row => {
        let glucoseValue = 0;
        let timestamp = "";
        let insulinValue = 0;
        
        // TODO: remove quotes from strings here
        for (const key in row) {
          if (key.toLowerCase().includes("glucose")) {
            const value = parseFloat(row[key].slice(1,-1));
            if (!isNaN(value)) {
              glucoseValue = value;
            }
          }
          else if (key.toLowerCase().includes("insulin")) {
            const value = parseFloat(row[key].slice(1,-1));
            if (!isNaN(value)) {
              insulinValue = value;
            }
          }
          else if (key.toLowerCase().includes("timestamp")) {
            timestamp = row[key].slice(1,-1);
          }
        }
    
        return {
          user_id: userData.user.id,
          glucose_level: glucoseValue,
          insulin_value: insulinValue,
          timestamp: timestamp,
          notes: `Imported from ${file.name}`,
          raw_data: JSON.stringify(row),
        };
      });
      
      setParsedData(processedData);
      
      // Create anonymized CSV
      const anonymizedCsv = createAnonymizedCsv(processedData);
      const anonymizedCsvBlob = new Blob([anonymizedCsv], { type: 'text/csv;charset=utf-8;' });
      const anonymizedCsvUrl = URL.createObjectURL(anonymizedCsvBlob);
      setAnonymizedCsvUrl(anonymizedCsvUrl);
      
      setUploadStatus({
        success: true,
        message: `Successfully parsed ${processedData.length} glucose readings. Review the data below and click "Get AI Insights" to receive AI insights.`,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus({
        success: false,
        message: "Error processing CSV file. Please check the format and try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const createAnonymizedCsv = useCallback((data: any[]): string => {
    if (!data || data.length === 0) return "";
    
    // Include only necessary columns for analysis (timestamp, glucose, insulin)
    // and exclude any personally identifiable information
    const headers = ["timestamp", "glucose_level", "insulin_value"];
    let csvContent = headers.join(",") + "\n";
    
    data.forEach(row => {
      const csvRow = [
        row.timestamp,
        row.glucose_level,
        row.insulin_value || 0
      ].join(",");
      csvContent += csvRow + "\n";
    });
    
    return csvContent;
  }, []);

  const getAiInsights = async () => {
    if (!anonymizedCsvUrl || !parsedData || parsedData.length === 0) return;
    
    setLoadingInsights(true);
    setInsights(null);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setUploadStatus({
          success: false,
          message: "Authentication error. Please log in again.",
        });
        setLoadingInsights(false);
        return;
      }

      // Get user profile to get target range
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("target_range_min, target_range_max")
        .eq("user_id", userData.user.id)
        .single();

      const targetMin = profileData?.target_range_min || 70;
      const targetMax = profileData?.target_range_max || 180;

      // Fetch the anonymized CSV content
      const anonymizedContent = await fetch(anonymizedCsvUrl).then(r => r.text());
      
      // Call OpenAI API with the correct absolute path
      const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csvData: anonymizedContent,
          targetRange: {
            min: targetMin,
            max: targetMax
          }
        }),
        // Add these options to help with debugging
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} ${response.statusText}. ${errorText}`);
      }
      
      const result = await response.json();
      setInsights(result.insights);
      
      // Save insights to database
      const timeframeStart = new Date(Math.min(...parsedData.map(d => new Date(d.timestamp).getTime())));
      const timeframeEnd = new Date(Math.max(...parsedData.map(d => new Date(d.timestamp).getTime())));
      
      const { error: insightsError } = await supabase
        .from("ai_insights")
        .insert({
          user_id: userData.user.id,
          insights: result.insights,
          data_timeframe_start: timeframeStart.toISOString(),
          data_timeframe_end: timeframeEnd.toISOString(),
          title: `Insights from ${file?.name || 'uploaded data'}`
        });
      
      if (insightsError) {
        console.error("Error saving insights:", insightsError);
      }
      
    } catch (error: any) {
      console.error("Error getting AI insights:", error);
      setUploadStatus({
        success: false,
        message: `Error getting insights: ${error.message || "Unknown error"}`,
      });
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Upload Glucose Data</h1>
      <p className="mb-4 text-pine-green-600">
        Upload your glucose data from a CSV file. The file should contain columns for timestamps, glucose readings, and insulin.
      </p>
      
      <div className="bg-beige-100 p-6 rounded-lg border border-beige-200 mb-6">
        <div className="mb-4">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
        </div>
        
        {file && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-beige-200 rounded">
            <FileType className="h-5 w-5 text-pine-green-500" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
        )}
        
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-pine-green-600 hover:bg-pine-green-700 text-white"
        >
          {uploading ? "Processing..." : "Upload and Parse CSV"}
          {!uploading && <UploadCloud className="ml-2 h-4 w-4" />}
        </Button>
      </div>
      
      {uploadStatus && (
        <div className={`p-4 mb-6 rounded-md ${
          uploadStatus.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {uploadStatus.success ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>{uploadStatus.message}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{uploadStatus.message}</span>
            </div>
          )}
        </div>
      )}
      
      {parsedData && parsedData.length > 0 && (
        <>
          <div className="flex flex-wrap gap-4 mb-6">
            {anonymizedCsvUrl && (
              <>
                <Button
                  onClick={getAiInsights}
                  disabled={loadingInsights}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loadingInsights ? "Generating..." : "Get AI Insights"}
                  {!loadingInsights && <BrainCircuit className="ml-2 h-4 w-4" />}
                </Button>
              </>
            )}
          </div>
          
          <h2 className="text-xl font-semibold mb-3">Data Preview</h2>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white border border-beige-200 rounded-lg">
              <thead className="bg-beige-100">
                <tr>
                  <th className="px-4 py-2 text-left">Timestamp</th>
                  <th className="px-4 py-2 text-left">Glucose Level</th>
                  <th className="px-4 py-2 text-left">Insulin</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-t border-beige-200">
                    <td className="px-4 py-2">{row.timestamp}</td>
                    <td className="px-4 py-2">{row.glucose_level}</td>
                    <td className="px-4 py-2">{row.insulin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedData.length > 10 && (
              <p className="text-sm italic mt-2 text-gray-600">
                Showing 10 of {parsedData.length} entries
              </p>
            )}
          </div>
        </>
      )}
      
      {insights && (
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-blue-800">AI-Generated Insights</h2>
          </div>
          <div className="prose prose-blue max-w-none">
            <div dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br/>') }} />
          </div>
        </div>
      )}
    </div>
  );
}