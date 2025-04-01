import {
  getWeatherByCoordinates,
  getWeatherByCityName,
  getWeatherData,
} from "@/lib/weather-service";

describe("Weather Service", () => {
  describe("getWeatherByCoordinates", () => {
    it("should return structured weather data", async () => {
      // API calls currently return mock data since we don't have a real API key in tests
      const result = await getWeatherByCoordinates(1.3521, 103.8198);

      // Basic structure checks
      expect(result).toBeDefined();
      expect(result.location).toBeDefined();
      expect(result.current).toBeDefined();
      expect(result.current.temp).toBeDefined();
      expect(result.current.humidity).toBeDefined();
      expect(result.current.condition).toBeDefined();
      expect(result.forecast).toBeDefined();
      expect(result.forecast.length).toBe(7);
      expect(result.units).toBe("metric");
    });
  });

  describe("getWeatherByCityName", () => {
    it("should handle city name lookup", async () => {
      // Find a city in our database
      const result = await getWeatherByCityName("Singapore");

      // Basic structure checks
      expect(result).toBeDefined();
      expect(result.location).toBeDefined();
      expect(result.current).toBeDefined();
      expect(result.current.temp).toBeDefined();
      expect(result.current.humidity).toBeDefined();
      expect(result.current.condition).toBeDefined();
      expect(result.forecast).toBeDefined();
      expect(result.forecast.length).toBe(7);
    });
  });

  describe("getWeatherData", () => {
    it("should provide weather data with city", async () => {
      const result = await getWeatherData("Singapore");

      // Basic structure checks
      expect(result).toBeDefined();
      expect(result.location).toBeDefined();
      expect(result.current).toBeDefined();
      expect(result.current.temp).toBeDefined();
      expect(result.current.humidity).toBeDefined();
      expect(result.current.condition).toBeDefined();
      expect(result.forecast).toBeDefined();
      expect(result.forecast.length).toBe(7);
    });
  });
});
