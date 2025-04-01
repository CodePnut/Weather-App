import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CitySearch } from "@/components/ui/city-search";
import { filterCities, POPULAR_CITIES } from "@/lib/cities-data";

// Mock the cities-data module
jest.mock("@/lib/cities-data", () => ({
  POPULAR_CITIES: [
    { name: "Singapore", country: "Singapore", lat: 1.29, lon: 103.85 },
    { name: "New York", country: "USA", lat: 40.71, lon: -74.01 },
    { name: "London", country: "UK", lat: 51.51, lon: -0.13 },
    { name: "Tokyo", country: "Japan", lat: 35.68, lon: 139.76 },
    { name: "Sydney", country: "Australia", lat: -33.87, lon: 151.21 },
  ],
  filterCities: jest.fn((input) => {
    // Simple mock implementation of filterCities
    const mockCities = [
      { name: "Singapore", country: "Singapore", lat: 1.29, lon: 103.85 },
      { name: "New York", country: "USA", lat: 40.71, lon: -74.01 },
    ];
    return input.toLowerCase().includes("sin")
      ? [mockCities[0]]
      : input.toLowerCase().includes("new")
      ? [mockCities[1]]
      : [];
  }),
}));

describe("CitySearch Component", () => {
  const mockCitySelect = jest.fn();
  const mockCoordinatesSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the search input correctly", () => {
    render(<CitySearch onCitySelect={mockCitySelect} />);

    const searchInput = screen.getByPlaceholderText(/enter city name/i);
    expect(searchInput).toBeInTheDocument();

    const searchButton = screen.getByRole("button", { name: /search/i });
    expect(searchButton).toBeInTheDocument();
  });

  it("shows suggestions when typing and filters correctly", async () => {
    render(
      <CitySearch
        onCitySelect={mockCitySelect}
        onCoordinatesSelect={mockCoordinatesSelect}
      />
    );

    const searchInput = screen.getByPlaceholderText(/enter city name/i);

    // Type in the search input
    await userEvent.type(searchInput, "Sin");

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(filterCities).toHaveBeenCalledWith("Sin");
      // Use queryAllByText instead of getByText to handle multiple elements
      const singaporeElements = screen.queryAllByText("Singapore");
      expect(singaporeElements.length).toBeGreaterThan(0);
    });
  });

  it("selects a city when clicking on a suggestion", async () => {
    render(
      <CitySearch
        onCitySelect={mockCitySelect}
        onCoordinatesSelect={mockCoordinatesSelect}
      />
    );

    const searchInput = screen.getByPlaceholderText(/enter city name/i);

    // Type in the search input to show suggestions
    await userEvent.type(searchInput, "Sin");

    // Wait for suggestions to appear
    await waitFor(() => {
      const singaporeElements = screen.queryAllByText("Singapore");
      expect(singaporeElements.length).toBeGreaterThan(0);
    });

    // Click on the option element containing Singapore (safer approach)
    const optionElement = screen.getByRole("option");
    await userEvent.click(optionElement);

    // Check that the coordinates select handler was called
    expect(mockCoordinatesSelect).toHaveBeenCalledWith(1.29, 103.85);

    // Check that the input was updated with the selected city
    expect(searchInput).toHaveValue("Singapore");
  });

  it("submits the form with the current input value", async () => {
    render(
      <CitySearch
        onCitySelect={mockCitySelect}
        onCoordinatesSelect={mockCoordinatesSelect}
      />
    );

    const searchInput = screen.getByPlaceholderText(/enter city name/i);
    const searchButton = screen.getByRole("button", { name: /search/i });

    // Type in the search input
    await userEvent.type(searchInput, "New York");

    // Submit the form
    await userEvent.click(searchButton);

    // Check that the coordinates select handler was called
    expect(mockCoordinatesSelect).toHaveBeenCalledWith(40.71, -74.01);
  });

  it("clears the input when clicking the clear button", async () => {
    render(<CitySearch onCitySelect={mockCitySelect} />);

    const searchInput = screen.getByPlaceholderText(/enter city name/i);

    // Type in the search input
    await userEvent.type(searchInput, "Singapore");

    // Check that the input has a value
    expect(searchInput).toHaveValue("Singapore");

    // Click the clear button (× character)
    const clearButton = screen.getByRole("button", { name: /clear search/i });
    await userEvent.click(clearButton);

    // Check that the input was cleared
    expect(searchInput).toHaveValue("");
  });

  it("handles loading state correctly", () => {
    render(<CitySearch onCitySelect={mockCitySelect} isLoading={true} />);

    // Check that the search button is disabled when loading
    const searchButton = screen.getByRole("button", { name: /search/i });
    expect(searchButton).toBeDisabled();

    // Check that the loading spinner is shown
    const loadingSpinner = document.querySelector(".animate-spin");
    expect(loadingSpinner).toBeTruthy();
  });

  it("submits with an exact city match", async () => {
    // Mock filterCities to return an exact match
    (filterCities as jest.Mock).mockImplementationOnce(() => [
      { name: "Tokyo", country: "Japan", lat: 35.68, lon: 139.76 },
    ]);

    render(
      <CitySearch
        onCitySelect={mockCitySelect}
        onCoordinatesSelect={mockCoordinatesSelect}
      />
    );

    const searchInput = screen.getByPlaceholderText(/enter city name/i);
    const searchButton = screen.getByRole("button", { name: /search/i });

    // Type exact city name
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, "Tokyo");

    // Submit the form
    await userEvent.click(searchButton);

    // Should use coordinates
    expect(mockCoordinatesSelect).toHaveBeenCalledWith(35.68, 139.76);
  });

  it("falls back to city name when no match is found", async () => {
    // Mock filterCities to return no matches
    (filterCities as jest.Mock).mockImplementationOnce(() => []);

    render(
      <CitySearch
        onCitySelect={mockCitySelect}
        onCoordinatesSelect={mockCoordinatesSelect}
      />
    );

    const searchInput = screen.getByPlaceholderText(/enter city name/i);
    const searchButton = screen.getByRole("button", { name: /search/i });

    // Type a city not in our database
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, "Unknown City");

    // Submit the form
    await userEvent.click(searchButton);

    // Should use the city name
    expect(mockCitySelect).toHaveBeenCalledWith("Unknown City");
  });
});
