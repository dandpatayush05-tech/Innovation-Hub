import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ChatWidget } from './components/chat/ChatWidget';
import { Loader2 } from 'lucide-react';

import { ToastProvider } from './context/ToastContext';
import { TripCartProvider } from './context/TripCartContext';
import { NotificationProvider } from './context/NotificationContext';
import { TripCartModal } from './components/cart/TripCartModal';

// Lazy load components for code splitting
const Hero = React.lazy(() => import('@/components/Hero').then(m => ({ default: m.Hero })));
const Login = React.lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const BusinessDashboard = React.lazy(() => import('./pages/BusinessDashboard').then(m => ({ default: m.BusinessDashboard })));
const Destinations = React.lazy(() => import('./pages/Destinations').then(m => ({ default: m.Destinations })));
const DestinationDetails = React.lazy(() => import('./pages/DestinationDetails').then(m => ({ default: m.DestinationDetails })));
const PlaceDetails = React.lazy(() => import('./pages/PlaceDetails').then(m => ({ default: m.PlaceDetails })));
const GlobalSearch = React.lazy(() => import('./pages/GlobalSearch').then(m => ({ default: m.GlobalSearch })));
const ExploreCountry = React.lazy(() => import('./pages/ExploreCountry').then(m => ({ default: m.ExploreCountry })));
const ItineraryGenerator = React.lazy(() => import('./pages/ItineraryGenerator').then(m => ({ default: m.ItineraryGenerator })));
const ItineraryDetail = React.lazy(() => import('./pages/ItineraryDetail').then(m => ({ default: m.ItineraryDetail })));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const DashboardLayout = React.lazy(() => import('./layouts/DashboardLayout').then(m => ({ default: m.DashboardLayout })));
const HomeLayout = React.lazy(() => import('./layouts/HomeLayout').then(m => ({ default: m.HomeLayout })));
const Hotels = React.lazy(() => import('./pages/Hotels').then(m => ({ default: m.Hotels })));
const HotelDetails = React.lazy(() => import('./pages/HotelDetails').then(m => ({ default: m.HotelDetails })));
const Flights = React.lazy(() => import('./pages/Flights').then(m => ({ default: m.Flights })));
const FlightDetails = React.lazy(() => import('./pages/FlightDetails').then(m => ({ default: m.FlightDetails })));
const Buses = React.lazy(() => import('./pages/Buses').then(m => ({ default: m.Buses })));
const BusDetails = React.lazy(() => import('./pages/BusDetails').then(m => ({ default: m.BusDetails })));
const AutoTransport = React.lazy(() => import('./pages/AutoTransport').then(m => ({ default: m.AutoTransport })));
const Experiences = React.lazy(() => import('./pages/Experiences').then(m => ({ default: m.Experiences })));
const ExperienceDetails = React.lazy(() => import('./pages/ExperienceDetails').then(m => ({ default: m.ExperienceDetails })));
const Bookings = React.lazy(() => import('./pages/Bookings').then(m => ({ default: m.Bookings })));
const UpcomingExperiences = React.lazy(() => import('./pages/UpcomingExperiences').then(m => ({ default: m.UpcomingExperiences })));
const Unauthorized = React.lazy(() => import('./pages/Unauthorized').then(m => ({ default: m.Unauthorized })));
const Payments = React.lazy(() => import('./pages/Payments'));
const PastExperiences = React.lazy(() => import('./pages/PastExperiences'));
const TripDetail = React.lazy(() => import('./pages/TripDetail'));
const Help = React.lazy(() => import('./pages/Help'));
const Contact = React.lazy(() => import('./pages/Contact'));
const TripCart = React.lazy(() => import('./pages/TripCart').then(m => ({ default: m.TripCart })));
const Settings = React.lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const BumperPackages = React.lazy(() => import('./pages/BumperPackages').then(m => ({ default: m.BumperPackages })));
const BumperPackageDetails = React.lazy(() => import('./pages/BumperPackageDetails').then(m => ({ default: m.BumperPackageDetails })));

const SuspenseFallback = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
          <TripCartProvider>
            <Router>
              <Suspense fallback={<SuspenseFallback />}>
                <Routes>
                  <Route path="/" element={<Hero />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/destinations" element={<Destinations />} />
                  <Route path="/destinations/:id" element={<DestinationDetails />} />
                  <Route path="/packages" element={<BumperPackages />} />
                  <Route path="/packages/:id" element={<BumperPackageDetails />} />
                  <Route path="/places/:id" element={<PlaceDetails />} />

                  <Route path="/experiences" element={<Experiences />} />
                  <Route path="/experiences/:id" element={<ExperienceDetails />} />
                  <Route path="/search" element={<GlobalSearch />} />
                  <Route path="/explore/:country" element={<ExploreCountry />} />
                  <Route path="/itineraries/generate" element={<ItineraryGenerator />} />
                  <Route path="/itinerary-generator" element={<ItineraryGenerator />} />
                  <Route path="/itineraries/:id" element={<ItineraryDetail />} />
                  <Route path="/cart" element={<TripCart />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    {/* TopNav Layout for Homepage */}
                    <Route element={<HomeLayout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                    </Route>

                    {/* Sidebar App Shell for Sub-routes */}
                    <Route element={<DashboardLayout />}>
                      <Route path="/dashboard/hotels" element={<Hotels />} />
                      <Route path="/dashboard/hotels/:id" element={<HotelDetails />} />
                      <Route path="/dashboard/flights" element={<Flights />} />
                      <Route path="/dashboard/flights/:id" element={<FlightDetails />} />
                      <Route path="/dashboard/buses" element={<Buses />} />
                      <Route path="/dashboard/buses/:id" element={<BusDetails />} />
                      <Route path="/dashboard/auto" element={<AutoTransport />} />
                      <Route path="/dashboard/bookings" element={<Bookings />} />
                      <Route path="/dashboard/upcoming-experiences" element={<UpcomingExperiences />} />
                      <Route path="/dashboard/payments" element={<Payments />} />
                      <Route path="/dashboard/trips" element={<PastExperiences />} />
                      <Route path="/dashboard/trips/:id" element={<TripDetail />} />
                      <Route path="/dashboard/settings" element={<Settings />} />
                    </Route>
                  </Route>

                  {/* Role-specific Protected Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['business', 'admin']} />}>
                    <Route path="/business-dashboard" element={<BusinessDashboard />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  </Route>

                  {/* Error Routes */}
                  <Route path="/unauthorized" element={<Unauthorized />} />
                </Routes>
                <ChatWidget />
                <TripCartModal />
              </Suspense>
            </Router>
          </TripCartProvider>
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
