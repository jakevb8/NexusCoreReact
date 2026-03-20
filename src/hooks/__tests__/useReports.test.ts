import { renderHook, act } from "@testing-library/react-native";
import { useReports } from "../useReports";
import { AssetStatus, ReportsData } from "../../models";

// Mock the api module
jest.mock("../../api", () => ({
  getReports: jest.fn(),
}));

import { getReports } from "../../api";
const mockGetReports = getReports as jest.MockedFunction<typeof getReports>;

const mockReportsData: ReportsData = {
  totalAssets: 10,
  utilizationRate: 0.6,
  byStatus: [
    { status: AssetStatus.AVAILABLE, count: 4 },
    { status: AssetStatus.IN_USE, count: 6 },
  ],
};

describe("useReports", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts with null data, not loading, no error", () => {
    const { result } = renderHook(() => useReports());
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets isLoading during fetch then resolves data", async () => {
    mockGetReports.mockResolvedValue(mockReportsData);
    const { result } = renderHook(() => useReports());

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.data).toEqual(mockReportsData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error and clears data when fetch fails", async () => {
    mockGetReports.mockRejectedValue({
      response: { data: { message: "Unauthorized" } },
    });
    const { result } = renderHook(() => useReports());

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Unauthorized");
    expect(result.current.isLoading).toBe(false);
  });

  it("uses fallback error message when response has no message", async () => {
    mockGetReports.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useReports());

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.error).toBe("Failed to load reports");
  });

  it("clears previous error on subsequent successful load", async () => {
    mockGetReports.mockRejectedValueOnce(new Error("fail"));
    mockGetReports.mockResolvedValueOnce(mockReportsData);
    const { result } = renderHook(() => useReports());

    await act(async () => {
      await result.current.load();
    });
    expect(result.current.error).toBe("Failed to load reports");

    await act(async () => {
      await result.current.load();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual(mockReportsData);
  });
});
