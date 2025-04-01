"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { filterCities, CityData, POPULAR_CITIES } from "@/lib/cities-data";

interface CitySearchProps {
  onCitySelect: (city: string) => void;
  onCoordinatesSelect?: (lat: number, lon: number) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function CitySearch({
  onCitySelect,
  onCoordinatesSelect,
  isLoading = false,
  error = null,
}: CitySearchProps) {
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState<CityData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  // Clear local error when external error or loading status changes
  useEffect(() => {
    if (error) {
      setLocalError(error);
    } else if (!isLoading) {
      setLocalError(null);
    }
  }, [error, isLoading]);

  // Filter suggestions based on input
  useEffect(() => {
    if (searchInput.trim().length > 1) {
      const filteredCities = filterCities(searchInput);
      setSuggestions(filteredCities);
      setShowSuggestions(filteredCities.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchInput]);

  // Handle clicks outside the suggestions box
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Direct approach to handle suggestion click
  const handleSuggestionClick = (city: CityData) => {
    console.log("City selected:", city);

    // Update input immediately for visual feedback
    setSearchInput(city.name);
    setShowSuggestions(false);
    setLocalError(null);

    // Directly call the handler with coordinate data
    if (onCoordinatesSelect) {
      try {
        console.log("Calling onCoordinatesSelect with:", city.lat, city.lon);
        onCoordinatesSelect(city.lat, city.lon);
      } catch (error) {
        console.error("Error in onCoordinatesSelect:", error);
        setLocalError("Error loading weather data. Please try again.");
        // Fallback to city name if coordinates fail
        onCitySelect(city.name);
      }
    } else {
      onCitySelect(city.name);
    }

    // Force blur input to hide mobile keyboard
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  // Clear form and reset
  const clearSearch = () => {
    setSearchInput("");
    setSuggestions([]);
    setShowSuggestions(false);
    setLocalError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle form submission with improved error handling
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchInput.trim()) return;

    console.log("Form submitted with search input:", searchInput);
    setLocalError(null);

    try {
      // Find exact match first
      const exactMatch = POPULAR_CITIES.find(
        (city) => city.name.toLowerCase() === searchInput.toLowerCase().trim()
      );

      // Find partial match if no exact match
      const partialMatch = !exactMatch
        ? POPULAR_CITIES.find((city) =>
            city.name.toLowerCase().includes(searchInput.toLowerCase().trim())
          )
        : null;

      // Use exact match, partial match, or just the text input
      if (exactMatch && onCoordinatesSelect) {
        console.log("Found exact match with coordinates:", exactMatch);
        setShowSuggestions(false);
        onCoordinatesSelect(exactMatch.lat, exactMatch.lon);
      } else if (partialMatch && onCoordinatesSelect) {
        console.log("Found partial match with coordinates:", partialMatch);
        setShowSuggestions(false);
        // Update input to show the full city name
        setSearchInput(partialMatch.name);
        onCoordinatesSelect(partialMatch.lat, partialMatch.lon);
      } else {
        console.log("No matching city found, using city name");
        setShowSuggestions(false);
        onCitySelect(searchInput.trim());
      }

      // Force blur input to hide mobile keyboard
      if (inputRef.current) {
        inputRef.current.blur();
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      setLocalError("Error processing search. Please try again.");
      // Fallback to city name on error
      onCitySelect(searchInput.trim());
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2 w-full">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Enter city name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={`flex-1 pr-8 ${
              localError ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            autoComplete="off"
            onFocus={() =>
              searchInput.trim().length > 1 &&
              setSuggestions(filterCities(searchInput))
            }
          />
          {searchInput.trim().length > 0 && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <Button
          ref={searchButtonRef}
          type="submit"
          variant="default"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Search
        </Button>
      </form>

      {/* Error message */}
      {localError && (
        <div className="mt-2 text-sm text-red-500 dark:text-red-400">
          {localError}
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionRef}
          className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto"
          role="listbox"
          aria-label="City suggestions"
        >
          {suggestions.map((city, index) => (
            <div
              key={`${city.name}-${city.country}-${index}`}
              onClick={() => handleSuggestionClick(city)}
              className={cn(
                "px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-between",
                index === 0 && "rounded-t-md",
                index === suggestions.length - 1 && "rounded-b-md"
              )}
              role="option"
              aria-selected="false"
            >
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                <span>{city.name}</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {city.country}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
