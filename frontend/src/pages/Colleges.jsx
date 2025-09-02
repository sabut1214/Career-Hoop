
import React, { useState, useEffect, useCallback } from "react";
import { College } from "@/entities/College";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin,
  Star,
  DollarSign,
  ExternalLink,
  Search,
  Filter,
  BookOpen,
  Award
} from "lucide-react";

export default function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");

  const filterColleges = useCallback(() => {
    let filtered = [...colleges];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(college =>
        college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.courses_offered.some(course =>
          course.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter(college => college.type === filterType);
    }

    // Location filter
    if (filterLocation !== "all") {
      filtered = filtered.filter(college =>
        college.location.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }

    setFilteredColleges(filtered);
  }, [colleges, searchTerm, filterType, filterLocation]);

  useEffect(() => {
    loadColleges();
  }, []);

  useEffect(() => {
    filterColleges();
  }, [filterColleges]);

  const loadColleges = async () => {
    try {
      const data = await College.list();
      setColleges(data);
    } catch (error) {
      console.error("Error loading colleges:", error);
    }
    setIsLoading(false);
  };

  const getUniqueLocations = () => {
    const locations = colleges.map(college => college.location);
    return [...new Set(locations)].sort();
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-200 h-80 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Colleges & Universities</h1>
          <p className="text-gray-600">
            Discover top institutions that match your career goals
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search colleges, courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="College Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="deemed">Deemed University</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {getUniqueLocations().map((location) => (
                    <SelectItem key={location} value={location.toLowerCase()}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                  setFilterLocation("all");
                }}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear Filters
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredColleges.length}</span> colleges
          </p>
        </motion.div>

        {/* Colleges Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredColleges.map((college, index) => (
            <motion.div
              key={college.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">{college.name}</CardTitle>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{college.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {renderStars(college.rating)}

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${
                          college.type === "government"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : college.type === "private"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}
                      >
                        {college.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">Fees:</span>
                    <span className="text-sm font-medium">{college.fees_range}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Courses:</h4>
                    <div className="flex flex-wrap gap-2">
                      {college.courses_offered.slice(0, 3).map((course, courseIndex) => (
                        <Badge key={courseIndex} variant="secondary" className="text-xs">
                          {course}
                        </Badge>
                      ))}
                      {college.courses_offered.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{college.courses_offered.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex gap-2">
                      {college.website && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 flex items-center gap-2"
                          onClick={() => window.open(college.website, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4" />
                          Website
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                      >
                        <Award className="w-4 h-4 mr-2" />
                        Apply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredColleges.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No colleges found</h3>
            <p className="text-gray-600">Try adjusting your search filters to see more results.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
