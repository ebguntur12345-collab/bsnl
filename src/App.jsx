import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import CustomerContacts from './pages/CustomerContacts';
import CustomerRegistration from './pages/CustomerRegistration';
import Forms from './pages/Forms';
import Charts from './pages/Charts';
import Customers from './pages/Customers';
import Complaints from './pages/Complaints';
import Inbox from './pages/Inbox';
import Search from './pages/Search';
import ShortCode from './pages/ShortCode';
import Tariffs from './pages/Tariffs';
import CCTRegistration from './pages/CCTRegistration';
import LeasedLines from './pages/LeasedLines';
import ILL576Users from './pages/ILL576Users';
import PdfViewer from './pages/PdfViewer';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CategoryPdfs from './pages/CategoryPdfs';
import ServiceUsers from './pages/ServiceUsers';
import Tasks from './pages/Tasks';
import WorkerLogin from './pages/WorkerLogin';

import { useParams } from 'react-router-dom';

const PdfViewerWithParam = () => {
  const { docTitle } = useParams();
  return <PdfViewer title={docTitle.replace(/-/g, ' ')} />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="contacts/eb-contacts" element={<Contacts />} />
          <Route path="contacts/customer-contacts" element={<CustomerContacts />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/enterprise" element={<Customers />} />
          <Route path="customers/retail" element={<Customers />} />
          <Route path="custRegistration" element={<CustomerRegistration />} />
          <Route path="leased-lines/registration" element={<CCTRegistration />} />
          <Route path="leased-lines/users/:serviceType" element={<ServiceUsers />} />
          <Route path="tariffs" element={<Tariffs />} />
          <Route path="tariffs/sip-trunk" element={<PdfViewer module="Tariffs" category="SIP Trunk" title="SIP Trunk Tariff" />} />
          <Route path="tariffs/internet-leased-line" element={<PdfViewer module="Tariffs" category="Internet leased line" title="Internet Leased Line Tariff" />} />
          <Route path="tariffs/mobile-prepaid" element={<PdfViewer module="Tariffs" category="Mobile Prepaid" title="Mobile Prepaid Tariff" />} />
          <Route path="tariffs/mobile-postpaid" element={<PdfViewer module="Tariffs" category="Mobile Postpaid" title="Mobile Postpaid Tariff" />} />
          <Route path="tariffs/mmvc-obd" element={<PdfViewer module="Tariffs" category="MMVC OBD" title="MMVC OBD Tariff" />} />
          <Route path="tariffs/ftth" element={<PdfViewer module="Tariffs" category="FTTH" title="FTTH Tariff" />} />
          <Route path="forms" element={<Forms />} />
          <Route path="forms/ill-caf" element={<PdfViewer module="Forms" category="ILL CAF" title="ILL CAF Form" />} />
          <Route path="forms/sip-trunk" element={<PdfViewer module="Forms" category="SIP Trunk" title="SIP Trunk CAF Form" />} />
          <Route path="forms/ftth-caf" element={<PdfViewer module="Forms" category="FTTH CAF" title="FTTH CAF Form" />} />
          <Route path="forms/mobile" element={<PdfViewer module="Forms" category="Mobile" title="Mobile CAF Form" />} />
          <Route path="charts" element={<Charts />} />
          <Route path="search" element={<Search />} />
          <Route path="documents/:docTitle" element={<PdfViewerWithParam />} />
          <Route path="module-documents/:module/:category" element={<CategoryPdfs />} />
          <Route path="short-code" element={<ShortCode />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="leased-lines" element={<LeasedLines />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="workers-login" element={<WorkerLogin />} />
          <Route path="wokers-login" element={<WorkerLogin />} />
        </Route>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
