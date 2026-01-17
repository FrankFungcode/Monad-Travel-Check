/**
 * @file Main App Component
 * @description Root application component with routing
 */

import { lazy, Suspense } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Loading } from "./components/common/Loading";
import { Layout } from "./components/layout/Layout";
import { ThemeProvider } from "./contexts/ThemeContext";

// Lazy load pages for better performance
const HomePage = lazy(() =>
  import("./pages/HomePage").then((m) => ({ default: m.HomePage }))
);
const MyCheckinsPage = lazy(() =>
  import("./pages/MyCheckinsPage").then((m) => ({ default: m.MyCheckinsPage }))
);
const ProfilePage = lazy(() =>
  import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage }))
);
const StakePage = lazy(() =>
  import("./pages/StakePage").then((m) => ({ default: m.StakePage }))
);
const CheckinPage = lazy(() =>
  import("./pages/CheckinPage").then((m) => ({ default: m.CheckinPage }))
);
const CalendarPage = lazy(() =>
  import("./pages/CalendarPage").then((m) => ({ default: m.CalendarPage }))
);
const AttractionsPage = lazy(() =>
  import("./pages/AttractionsPage").then((m) => ({
    default: m.AttractionsPage
  }))
);
const AttractionCheckinCreatePage = lazy(() =>
  import("./pages/AttractionCheckinCreatePage").then((m) => ({
    default: m.AttractionCheckinCreatePage
  }))
);
const AttractionCheckinPage = lazy(() =>
  import("./pages/AttractionCheckinPage").then((m) => ({
    default: m.AttractionCheckinPage
  }))
);
const RewardsPage = lazy(() =>
  import("./pages/RewardsPage").then((m) => ({ default: m.RewardsPage }))
);

/**
 * Main App Component
 */
export function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Suspense fallback={<Loading size="lg" />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/stake" element={<StakePage />} />
              <Route path="/checkins" element={<MyCheckinsPage />} />
              <Route path="/checkin/:stakeId" element={<CheckinPage />} />
              <Route path="/calendar/:stakeId" element={<CalendarPage />} />
              <Route path="/attractions" element={<AttractionsPage />} />
              <Route
                path="/attraction-checkin/create"
                element={<AttractionCheckinCreatePage />}
              />
              <Route
                path="/attraction-checkin/:taskId"
                element={<AttractionCheckinPage />}
              />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
