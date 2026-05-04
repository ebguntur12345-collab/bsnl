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
import BulkCCTs from './pages/BulkCCTs';
import CCTRegistration from './pages/CCTRegistration';
import LeasedLines from './pages/LeasedLines';
import PdfViewer from './pages/PdfViewer';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CategoryPdfs from './pages/CategoryPdfs';

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
          <Route path="leased-lines/bulk-ccts" element={<BulkCCTs />} />
          <Route path="leased-lines/registration" element={<CCTRegistration />} />
          <Route path="tariffs" element={<Tariffs />} />
          <Route path="tariffs/sip-trunk" element={<PdfViewer title="SIP Trunk Tariff" />} />
          <Route path="tariffs/internet-leased-line" element={<PdfViewer title="Internet Leased Line Tariff" />} />
          <Route path="tariffs/mobile-prepaid" element={<PdfViewer title="Mobile Prepaid Tariff" />} />
          <Route path="tariffs/mobile-postpaid" element={<PdfViewer title="Mobile Postpaid Tariff" />} />
          <Route path="tariffs/mmvc-obd" element={<PdfViewer title="MMVC OBD Tariff" />} />
          <Route path="tariffs/ftth" element={<PdfViewer title="FTTH Tariff" />} />
          <Route path="forms" element={<Forms />} />
          <Route path="forms/ill-caf" element={<PdfViewer title="ILL CAF Form" />} />
          <Route path="forms/sip-trunk" element={<PdfViewer title="SIP Trunk CAF Form" />} />
          <Route path="forms/ftth-caf" element={<PdfViewer title="FTTH CAF Form" />} />
          <Route path="forms/mobile" element={<PdfViewer title="Mobile CAF Form" />} />
          <Route path="charts" element={<Charts />} />
          <Route path="search" element={<Search />} />
          <Route path="documents/:docTitle" element={<PdfViewerWithParam />} />
          <Route path="module-documents/:module/:category" element={<CategoryPdfs />} />
          <Route path="short-code" element={<ShortCode />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="leased-lines" element={<LeasedLines />} />
        </Route>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
