import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ACCOMMODATIONS,
  BRAND,
  RESORT_POLICIES,
} from "../data/config.js";

import {
  STORAGE_KEY,
  STATE_VERSION,
  addMaintenanceBlock,
  checkStayAvailability,
  createInitialResortState,
  createReservation,
  getDashboardStats,
  quoteStay,
  removeMaintenanceBlock,
  toggleFavorite,
  updateReservationStatus,
} from "../engine/resortEngine.js";

const ResortContext = createContext(null);

function loadDemoData() {
  if (typeof window === "undefined") {
    return createInitialResortState();
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) return createInitialResortState();

    const data = JSON.parse(stored);

    if (
      data?.version !== STATE_VERSION ||
      !Array.isArray(data.reservations)
    ) {
      return createInitialResortState();
    }

    return {
      ...createInitialResortState(),
      reservations: data.reservations,
      maintenanceBlocks: Array.isArray(data.maintenanceBlocks)
        ? data.maintenanceBlocks
        : [],
      favorites: Array.isArray(data.favorites)
        ? data.favorites
        : [],
      activity: Array.isArray(data.activity)
        ? data.activity
        : [],
    };
  } catch {
    return createInitialResortState();
  }
}

export function ResortProvider({ children }) {
  const [state, setState] = useState(loadDemoData);
  const stateRef = useRef(state);

  stateRef.current = state;

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
      );
    } catch (error) {
      console.warn(
        "YOUR STAY: local demo data could not be saved.",
        error
      );
    }
  }, [state]);

  const commit = useCallback((update) => {
    try {
      const result = update(stateRef.current);
      const next = result?.state || result;

      if (!next || !Array.isArray(next.reservations)) {
        throw new Error("Unable to update resort demo data.");
      }

      stateRef.current = next;
      setState(next);

      return {
        ok: true,
        ...((result && result.state) ? result : {}),
      };
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      };
    }
  }, []);

  const actions = useMemo(
    () => ({
      reserveStay: (input) =>
        commit((current) => createReservation(current, input)),

      cancelReservation: (id) =>
        commit((current) =>
          updateReservationStatus(current, id, "cancelled")
        ),

      checkInGuest: (id) =>
        commit((current) =>
          updateReservationStatus(current, id, "checked_in")
        ),

      checkOutGuest: (id) =>
        commit((current) =>
          updateReservationStatus(current, id, "checked_out")
        ),

      toggleFavorite: (id) =>
        commit((current) => toggleFavorite(current, id)),

      addMaintenanceBlock: (input) =>
        commit((current) => addMaintenanceBlock(current, input)),

      removeMaintenanceBlock: (id) =>
        commit((current) => removeMaintenanceBlock(current, id)),

      resetDemo: () =>
        commit(() => createInitialResortState()),
    }),
    [commit]
  );

  const getQuote = useCallback(
    (input) => quoteStay(stateRef.current, input),
    []
  );

  const getAvailability = useCallback(
    (input) => checkStayAvailability(stateRef.current, input),
    []
  );

  const stats = useMemo(
    () => getDashboardStats(state),
    [state]
  );

  const favoriteStays = useMemo(
    () =>
      ACCOMMODATIONS.filter((stay) =>
        state.favorites.includes(stay.id)
      ),
    [state.favorites]
  );

  const value = useMemo(
    () => ({
      brand: BRAND,
      policies: RESORT_POLICIES,
      accommodations: ACCOMMODATIONS,
      reservations: state.reservations,
      maintenanceBlocks: state.maintenanceBlocks,
      favorites: state.favorites,
      favoriteStays,
      activity: state.activity,
      stats,
      state,
      actions,
      getQuote,
      getAvailability,
      isConcept: true,
    }),
    [
      state,
      stats,
      favoriteStays,
      actions,
      getQuote,
      getAvailability,
    ]
  );

  return (
    <ResortContext.Provider value={value}>
      {children}
    </ResortContext.Provider>
  );
}

export function useResort() {
  const value = useContext(ResortContext);

  if (!value) {
    throw new Error(
      "useResort() must be called inside <ResortProvider>."
    );
  }

  return value;
}