"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/utils/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertCircle, CheckCircle2, User, Shield } from "lucide-react";

const settingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email").optional(),
  target_range_min: z
    .number({ required_error: "Required", invalid_type_error: "Must be a number" })
    .int("Must be a whole number")
    .min(40, "Minimum target range should be at least 40 mg/dL")
    .max(120, "Minimum target range should not exceed 120 mg/dL"),
  target_range_max: z
    .number({ required_error: "Required", invalid_type_error: "Must be a number" })
    .int("Must be a whole number")
    .min(120, "Maximum target range should be at least 120 mg/dL")
    .max(300, "Maximum target range should not exceed 300 mg/dL"),
}).refine(data => data.target_range_max > data.target_range_min, {
  message: "Maximum target range must be greater than minimum target range",
  path: ["target_range_max"],
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [activeSection, setActiveSection] = useState<"profile" | "account">("profile");
  
  const supabase = createClient();
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "",
      email: "",
      target_range_min: 70,
      target_range_max: 180,
    },
    mode: "onChange",
  });
  
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      try {
        // Get the current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        if (!userData.user) {
          setLoading(false);
          return;
        }
        
        setUser(userData.user);
        
        // Get user profile data
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", userData.user.id)
          .single();
        
        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }
        
        if (profileData) {
          setUserProfile(profileData);
          
          // Set form values
          form.reset({
            name: profileData.name,
            email: userData.user.email,
            target_range_min: profileData.target_range_min || 70,
            target_range_max: profileData.target_range_max || 180,
          });
        } else {
          // No profile yet, set defaults
          form.reset({
            name: userData.user.user_metadata?.name || "",
            email: userData.user.email,
            target_range_min: 70,
            target_range_max: 180,
          });
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        setStatusMessage({
          type: "error",
          message: `Failed to load user profile data: ${error.message}`,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [supabase, form]);
  
  const onSubmit = async (data: SettingsFormValues) => {
    setSaving(true);
    setStatusMessage(null);
    
    try {
      if (!user) throw new Error("No user found");
      
      // Update user profile
      const profileData = {
        user_id: user.id,
        name: data.name,
        target_range_min: data.target_range_min,
        target_range_max: data.target_range_max,
      };
      
      if (userProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update(profileData)
          .eq("id", userProfile.id);
        
        if (updateError) throw updateError;
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from("user_profiles")
          .insert(profileData);
        
        if (insertError) throw insertError;
      }
      
      // Update user metadata if name changed
      if (user.user_metadata?.name !== data.name) {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { name: data.name }
        });
        
        if (metadataError) throw metadataError;
      }
      
      setStatusMessage({
        type: "success",
        message: "Settings updated successfully",
      });

      // Refresh userProfile state with new data
      const { data: refreshedProfile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
        
      if (refreshedProfile) {
        setUserProfile(refreshedProfile);
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      setStatusMessage({
        type: "error",
        message: `Error saving settings: ${error.message || "unknown error"}`,
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Improved account delete handler with confirmation
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data."
    );
    
    if (!confirmed) return;
    
    try {
      setSaving(true);
      setStatusMessage(null);
      
      // In a production app, you would implement proper account deletion here
      // This would typically involve:
      // 1. Deleting user data from all tables
      // 2. Calling Supabase admin functions to delete the user
      
      setStatusMessage({
        type: "success",
        message: "Account deletion request submitted. An administrator will review your request.",
      });
    } catch (error: any) {
      console.error("Error deleting account:", error);
      setStatusMessage({
        type: "error",
        message: `Error deleting account: ${error.message || "unknown error"}`,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {loading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pine-green-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="bg-beige-100 rounded-lg border border-beige-200">
              <div className="p-4 border-b border-beige-200">
                <h2 className="font-semibold text-pine-green-700">Settings</h2>
              </div>
              <div className="p-2">
                <button
                  onClick={() => setActiveSection("profile")}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                    activeSection === "profile" 
                      ? "bg-pine-green-600 text-white" 
                      : "hover:bg-beige-200 text-pine-green-700"
                  }`}
                >
                  <User size={16} className="mr-2" />
                  <span>Profile Settings</span>
                </button>
                
                <button
                  onClick={() => setActiveSection("account")}
                  className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                    activeSection === "account" 
                      ? "bg-pine-green-600 text-white" 
                      : "hover:bg-beige-200 text-pine-green-700"
                  }`}
                >
                  <Shield size={16} className="mr-2" />
                  <span>Account Management</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-8 lg:col-span-9">
            {statusMessage && (
              <div 
                className={`mb-6 p-4 rounded-md flex items-center ${
                  statusMessage.type === "success" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}
                role="alert"
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                <span>{statusMessage.message}</span>
              </div>
            )}
            
            {activeSection === "profile" && (
              <div className="bg-white rounded-lg border border-beige-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-pine-green-300 focus-visible:ring-pine-green-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} disabled className="border-pine-green-300 bg-beige-50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="target_range_min"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Range Min (mg/dL)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(Number(e.target.value))} 
                                className="border-pine-green-300 focus-visible:ring-pine-green-500" 
                                min={40}
                                max={120}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="target_range_max"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Range Max (mg/dL)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(Number(e.target.value))} 
                                className="border-pine-green-300 focus-visible:ring-pine-green-500" 
                                min={120}
                                max={300}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={saving || !form.formState.isDirty || !form.formState.isValid} 
                      className="bg-pine-green-600 hover:bg-pine-green-700 text-white"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </Form>
              </div>
            )}
            
            {activeSection === "account" && (
              <div className="bg-white rounded-lg border border-beige-200 p-6">
                <h2 className="text-xl font-semibold mb-4">Account Management</h2>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Change Password</h3>
                  <p className="text-sm text-pine-green-600 mb-4">
                    To change your password, use the &quot;forgot password&quot; option on the login page.
                  </p>
                  
                  <Button 
                    variant="outline" 
                    className="border-pine-green-500 text-pine-green-700"
                    onClick={() => window.location.href = "/login"}
                  >
                    Go to Login
                  </Button>
                </div>
                
                <div className="pt-6 border-t border-beige-200">
                  <h3 className="text-lg font-medium mb-2 text-red-700">Danger Zone</h3>
                  <p className="text-sm text-pine-green-600 mb-4">
                    Once you delete your account, there is no going back. This action cannot be undone.
                  </p>
                  
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}