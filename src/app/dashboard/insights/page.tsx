"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase-browser";
import { Button } from "@/components/ui/button";
import { 
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function InsightsPage() {
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: new Date(new Date().setDate(new Date().getDate() - 7)),
    end: new Date()
  });
  
  const supabase = createClient();
  
  const fetchAiInsights = useCallback(async () => {
    setLoadingInsights(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setLoadingInsights(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', sessionData.session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setAiInsights(data);
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      setAiInsights([]);
    } finally {
      setLoadingInsights(false);
    }
  }, [supabase]);
  
  useEffect(() => {
    fetchAiInsights();
  }, [dateRange, fetchAiInsights]);

  const moveTimeRange = (days: number) => {
    setDateRange(prev => {
      const newStart = new Date(prev.start);
      newStart.setDate(newStart.getDate() + days);
      
      const newEnd = new Date(prev.end);
      newEnd.setDate(newEnd.getDate() + days);
      
      return {
        start: newStart,
        end: newEnd
      };
    });
  };
  
  const setTimeRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    
    setDateRange({ start, end });
  };
  
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const toggleInsight = (insightId: string) => {
    if (selectedInsight === insightId) {
      setSelectedInsight(null);
    } else {
      setSelectedInsight(insightId);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Glucose Insights</h1>
      
      {/* Time range selector */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => moveTimeRange(-7)}
            className="border-pine-green-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium px-2">
            {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
          </span>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => moveTimeRange(7)}
            disabled={dateRange.end >= new Date()}
            className="border-pine-green-300"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant={dateRange.end.getTime() - dateRange.start.getTime() === 6 * 24 * 60 * 60 * 1000 ? "default" : "outline"}
            size="sm" 
            onClick={() => setTimeRange(7)}
            className={dateRange.end.getTime() - dateRange.start.getTime() === 6 * 24 * 60 * 60 * 1000 
              ? "bg-pine-green-600 hover:bg-pine-green-700" 
              : "border-pine-green-300"}
          >
            Week
          </Button>
          <Button 
            variant={dateRange.end.getTime() - dateRange.start.getTime() === 13 * 24 * 60 * 60 * 1000 ? "default" : "outline"}
            size="sm" 
            onClick={() => setTimeRange(14)}
            className={dateRange.end.getTime() - dateRange.start.getTime() === 13 * 24 * 60 * 60 * 1000 
              ? "bg-pine-green-600 hover:bg-pine-green-700" 
              : "border-pine-green-300"}
          >
            2 Weeks
          </Button>
          <Button 
            variant={dateRange.end.getTime() - dateRange.start.getTime() === 29 * 24 * 60 * 60 * 1000 ? "default" : "outline"}
            size="sm" 
            onClick={() => setTimeRange(30)}
            className={dateRange.end.getTime() - dateRange.start.getTime() === 29 * 24 * 60 * 60 * 1000 
              ? "bg-pine-green-600 hover:bg-pine-green-700" 
              : "border-pine-green-300"}
          >
            Month
          </Button>
        </div>
      </div>
      
      {/* AI Insights Section */}
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-pine-green-700">AI-Generated Insights</h2>
        </div>
        
        {loadingInsights ? (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {aiInsights.length > 0 ? (
              <div className="space-y-4">
                {aiInsights.map((insight) => (
                  <div 
                    key={insight.id}
                    className="bg-white border border-beige-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleInsight(insight.id)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <div>
                        <h3 className="font-medium text-pine-green-700">{insight.title}</h3>
                        <p className="text-sm text-pine-green-500">
                          {formatDate(insight.data_timeframe_start)} to {formatDate(insight.data_timeframe_end)}
                        </p>
                      </div>
                      {selectedInsight === insight.id ? (
                        <ChevronUp className="h-5 w-5 text-pine-green-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-pine-green-600" />
                      )}
                    </button>
                    
                    {selectedInsight === insight.id && (
                      <div className="p-4 bg-blue-50 border-t border-beige-200">
                        <div className="prose prose-blue max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: insight.insights.replace(/\n/g, '<br/>') }} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-beige-100 rounded-lg">
                <p className="text-pine-green-600 mb-4">
                  You haven&apos;t received any AI insights yet.
                </p>
                <Link href="/dashboard/upload">
                  <Button className="bg-pine-green-600 hover:bg-pine-green-700 text-white">
                    Upload Data to Get Insights
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}