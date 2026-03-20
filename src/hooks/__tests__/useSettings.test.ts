import { renderHook, act } from "@testing-library/react-native";
import { useSettings } from "../useSettings";
import { AuthUser, BackendChoice, Role, OrgStatus } from "../../models";

// Mock api
jest.mock("../../api", () => ({
  getMe: jest.fn(),
  deleteAccount: jest.fn(),
  resetApiClient: jest.fn(),
}));

// Mock store
jest.mock("../../store/backend", () => ({
  getBackendChoice: jest.fn(),
  setBackendChoice: jest.fn(),
}));

// Mock Firebase auth
const mockSignOut = jest.fn();
jest.mock("@react-native-firebase/auth", () => () => ({
  signOut: mockSignOut,
}));

import { getMe, deleteAccount, resetApiClient } from "../../api";
import { getBackendChoice, setBackendChoice } from "../../store/backend";

const mockGetMe = getMe as jest.MockedFunction<typeof getMe>;
const mockDeleteAccount = deleteAccount as jest.MockedFunction<typeof deleteAccount>;
const mockResetApiClient = resetApiClient as jest.MockedFunction<typeof resetApiClient>;
const mockGetBackendChoice = getBackendChoice as jest.MockedFunction<typeof getBackendChoice>;
const mockSetBackendChoice = setBackendChoice as jest.MockedFunction<typeof setBackendChoice>;

const mockUser: AuthUser = {
  id: "u1",
  email: "test@example.com",
  role: Role.ORG_MANAGER,
  organizationId: "org1",
  organization: { id: "org1", status: OrgStatus.ACTIVE },
};

describe("useSettings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignOut.mockResolvedValue(undefined);
    mockSetBackendChoice.mockResolvedValue(undefined);
  });

  it("starts with null user, isLoading true, JS backend", () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.me).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.selectedBackend).toBe(BackendChoice.JS);
    expect(result.current.error).toBeNull();
  });

  it("loads user and backend choice", async () => {
    mockGetMe.mockResolvedValue(mockUser);
    mockGetBackendChoice.mockResolvedValue(BackendChoice.DOTNET);
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.me).toEqual(mockUser);
    expect(result.current.selectedBackend).toBe(BackendChoice.DOTNET);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error on load failure", async () => {
    mockGetMe.mockRejectedValue({ response: { data: { message: "Forbidden" } } });
    mockGetBackendChoice.mockResolvedValue(BackendChoice.JS);
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.error).toBe("Forbidden");
    expect(result.current.isLoading).toBe(false);
  });

  it("handleSelectBackend updates selectedBackend and resets api client", async () => {
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await result.current.handleSelectBackend(BackendChoice.DOTNET);
    });

    expect(result.current.selectedBackend).toBe(BackendChoice.DOTNET);
    expect(mockSetBackendChoice).toHaveBeenCalledWith(BackendChoice.DOTNET);
    expect(mockResetApiClient).toHaveBeenCalled();
  });

  it("handleSignOut calls resetApiClient and signs out", async () => {
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await result.current.handleSignOut();
    });

    expect(mockResetApiClient).toHaveBeenCalled();
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("handleDeleteAccount returns true and signs out on success", async () => {
    mockDeleteAccount.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSettings());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.handleDeleteAccount();
    });

    expect(success).toBe(true);
    expect(mockDeleteAccount).toHaveBeenCalled();
    expect(mockResetApiClient).toHaveBeenCalled();
    expect(mockSignOut).toHaveBeenCalled();
    expect(result.current.isDeletingAccount).toBe(false);
  });

  it("handleDeleteAccount returns false and sets error on failure", async () => {
    mockDeleteAccount.mockRejectedValue({
      response: { data: { message: "Cannot delete" } },
    });
    const { result } = renderHook(() => useSettings());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.handleDeleteAccount();
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe("Cannot delete");
    expect(result.current.isDeletingAccount).toBe(false);
  });

  it("setShowDeleteConfirm toggles the confirm dialog state", () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.showDeleteConfirm).toBe(false);

    act(() => {
      result.current.setShowDeleteConfirm(true);
    });

    expect(result.current.showDeleteConfirm).toBe(true);
  });
});
