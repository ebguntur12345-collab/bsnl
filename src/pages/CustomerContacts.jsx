import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Trash2, ChevronDown, ChevronRight, Info, Loader2, FileDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

const CustomerContacts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allContacts, setAllContacts] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [expandedDetails, setExpandedDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const parseAddressForExport = (fullAddress) => {
    if (!fullAddress) return { address: '—', wanIp: '—', dateOfCommission: '—' };
    let cleanAddress = fullAddress;
    let wanIp = '—';
    let dateOfCommission = '—';
    const ipMatch = cleanAddress.match(/\(WAN IP:\s*([^\)]+)\)/i);
    if (ipMatch) { wanIp = ipMatch[1].trim(); cleanAddress = cleanAddress.replace(/\s*\(WAN IP:\s*[^\)]+\)/i, '').trim(); }
    const docMatch = cleanAddress.match(/\(DOC:\s*([^\)]+)\)/i);
    if (docMatch) { dateOfCommission = docMatch[1].trim(); cleanAddress = cleanAddress.replace(/\s*\(DOC:\s*[^\)]+\)/i, '').trim(); }
    return { address: cleanAddress || '—', wanIp, dateOfCommission };
  };

  const downloadExcel = async () => {
    if (filtered.length === 0) {
      alert("No contacts available to export");
      return;
    }

    // Fetch all service tables in parallel to resolve technical details
    const [illRes, priRes, sipRes, mmvcRes, mplsRes] = await Promise.all([
      supabase.from('ill_data').select('*'),
      supabase.from('pri_data').select('*'),
      supabase.from('sip_data').select('*'),
      supabase.from('mmvc_data').select('*'),
      supabase.from('mpls_data').select('*'),
    ]);

    const illData  = illRes.data  || [];
    const priData  = priRes.data  || [];
    const sipData  = sipRes.data  || [];
    const mmvcData = mmvcRes.data || [];
    const mplsData = mplsRes.data || [];

    const exportData = filtered.map((row, index) => {
      const nameClean = (row.companyName || '').trim().toLowerCase();

      let serviceType = '—', plan = '—', circuitId = '—', billingAccountNo = '—';
      let address = '—', wanIp = '—', dateOfCommission = '—';

      // Resolve service details by matching company name
      const illMatch  = illData.find(d  => (d.customer_name  || '').trim().toLowerCase() === nameClean);
      const priMatch  = priData.find(d  => (d.customer_name  || '').trim().toLowerCase() === nameClean);
      const sipMatch  = sipData.find(d  => (d.customer_name  || '').trim().toLowerCase() === nameClean);
      const mmvcMatch = mmvcData.find(d => (d.customer_name  || '').trim().toLowerCase() === nameClean);
      const mplsMatch = mplsData.find(d => (d.customer_name  || '').trim().toLowerCase() === nameClean);

      if (illMatch) {
        const parsed = parseAddressForExport(illMatch.address);
        serviceType = 'Internet Leased Line (ILL)';
        plan = illMatch.bandwidth || '—';
        circuitId = illMatch.lc_id || '—';
        billingAccountNo = illMatch.billing_account_no || '—';
        dateOfCommission = (illMatch.service_start_date && illMatch.service_start_date !== 'NULL') ? illMatch.service_start_date : parsed.dateOfCommission;
        address = parsed.address;
        wanIp = parsed.wanIp;
      } else if (priMatch) {
        const parsed = parseAddressForExport(priMatch.address);
        serviceType = 'PRI Data'; plan = priMatch.pri_plan || '—'; circuitId = priMatch.telephone_no || '—';
        billingAccountNo = priMatch.billing_account_no || '—'; address = parsed.address; wanIp = parsed.wanIp; dateOfCommission = parsed.dateOfCommission;
      } else if (sipMatch) {
        const parsed = parseAddressForExport(sipMatch.address);
        serviceType = 'SIP Data'; plan = sipMatch.sip_plan || '—'; circuitId = sipMatch.telephone_no || '—';
        billingAccountNo = sipMatch.billing_account_no || '—'; address = parsed.address; wanIp = parsed.wanIp; dateOfCommission = parsed.dateOfCommission;
      } else if (mmvcMatch) {
        const parsed = parseAddressForExport(mmvcMatch.address);
        serviceType = 'MMVC Data'; plan = mmvcMatch.mmv_plan || '—'; circuitId = mmvcMatch.telephone_no || '—';
        billingAccountNo = mmvcMatch.billing_account_no || '—'; address = parsed.address; wanIp = parsed.wanIp; dateOfCommission = parsed.dateOfCommission;
      } else if (mplsMatch) {
        const parsed = parseAddressForExport(mplsMatch.address);
        serviceType = 'MPLS Data'; plan = mplsMatch.bandwidth || '—'; circuitId = mplsMatch.telephone_no || '—';
        billingAccountNo = mplsMatch.billing_account_no || '—'; address = parsed.address; wanIp = parsed.wanIp; dateOfCommission = parsed.dateOfCommission;
      }

      return {
        "#": index + 1,
        "Company Name": row.companyName || '—',
        "Location": row.location || '—',
        "Contact Name": row.contactName || '—',
        "Designation": row.designation || '—',
        "Contact No": row.contactNo || '—',
        "Mail ID": row.mailId || '—',
        "Service Type": serviceType,
        "Bandwidth / Plan": plan,
        "Circuit ID": circuitId,
        "Billing Account No": billingAccountNo,
        "Date of Commission": dateOfCommission,
        "Installation Address": address,
        "WAN IP Address": wanIp,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customer_Contacts");
    
    // Auto-fit column widths
    const maxLens = {};
    exportData.forEach(row => {
      Object.keys(row).forEach(key => {
        const valStr = String(row[key]);
        maxLens[key] = Math.max(maxLens[key] || key.length, valStr.length);
      });
    });
    worksheet['!cols'] = Object.keys(maxLens).map(key => ({
      wch: Math.min(maxLens[key] + 3, 50)
    }));

    XLSX.writeFile(workbook, "Customer_Contacts.xlsx");
  };

  // Load registered contacts from Supabase
  const loadContacts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers_data')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error loading contacts:', error.message);
      } else {
        const mapped = (data || []).map(r => ({
          id: r.id,
          companyName: r.company_name || '—',
          location: r.location || '—',
          contactName: r.contact_name || '—',
          designation: r.designation || '—',
          contactNo: r.contact_no || '—',
          mailId: r.mail_id || '—',
        }));
        setAllContacts(mapped);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const parseAddressAndIP = (fullAddress) => {
    if (!fullAddress) return { address: '—', wanIp: '—', dateOfCommission: '—' };
    
    let cleanAddress = fullAddress;
    let wanIp = '—';
    let dateOfCommission = '—';

    const ipMatch = cleanAddress.match(/\(WAN IP:\s*([^\)]+)\)/i);
    if (ipMatch) {
      wanIp = ipMatch[1].trim();
      cleanAddress = cleanAddress.replace(/\s*\(WAN IP:\s*[^\)]+\)/i, '').trim();
    }

    const docMatch = cleanAddress.match(/\(DOC:\s*([^\)]+)\)/i);
    if (docMatch) {
      dateOfCommission = docMatch[1].trim();
      cleanAddress = cleanAddress.replace(/\s*\(DOC:\s*[^\)]+\)/i, '').trim();
    }

    return { address: cleanAddress || '—', wanIp, dateOfCommission };
  };

  const toggleRow = async (row) => {
    const rowId = row.id;
    const isExpanding = !expandedRows[rowId];
    
    setExpandedRows(prev => ({ ...prev, [rowId]: isExpanding }));

    if (isExpanding && !expandedDetails[rowId]) {
      setLoadingDetails(prev => ({ ...prev, [rowId]: true }));
      try {
        const nameClean = row.companyName.trim();
        const contactNoClean = row.contactNo.trim();

        // 1. Try EXACT Name Match first across all tables to avoid incorrect phone-only matches
        let foundDetails = null;

        if (nameClean) {
          // A. Try ILL exact name match
          const { data: illExact } = await supabase
            .from('ill_data')
            .select('*')
            .ilike('customer_name', nameClean)
            .limit(1);
          if (illExact && illExact.length > 0) {
            const { address: cleanAddr, wanIp, dateOfCommission } = parseAddressAndIP(illExact[0].address);
            foundDetails = {
              service: 'Internet Leased Line (ILL)',
              plan: illExact[0].bandwidth || '—',
              circuitId: illExact[0].lc_id || '—',
              billingAccountNo: illExact[0].billing_account_no || '—',
              dateOfCommission: (illExact[0].service_start_date && illExact[0].service_start_date !== 'NULL') ? illExact[0].service_start_date : dateOfCommission,
              address: cleanAddr,
              wanIp
            };
          }

          // B. Try PRI exact name match
          if (!foundDetails) {
            const { data: priExact } = await supabase
              .from('pri_data')
              .select('*')
              .ilike('customer_name', nameClean)
              .limit(1);
            if (priExact && priExact.length > 0) {
              const { address: cleanAddr, wanIp, dateOfCommission } = parseAddressAndIP(priExact[0].address);
              foundDetails = {
                service: 'PRI Data',
                plan: priExact[0].pri_plan || '—',
                circuitId: priExact[0].telephone_no || '—',
                billingAccountNo: priExact[0].billing_account_no || '—',
                dateOfCommission,
                address: cleanAddr,
                wanIp
              };
            }
          }

          // C. Try SIP exact name match
          if (!foundDetails) {
            const { data: sipExact } = await supabase
              .from('sip_data')
              .select('*')
              .ilike('customer_name', nameClean)
              .limit(1);
            if (sipExact && sipExact.length > 0) {
              const { address: cleanAddr, wanIp, dateOfCommission } = parseAddressAndIP(sipExact[0].address);
              foundDetails = {
                service: 'SIP Data',
                plan: sipExact[0].sip_plan || '—',
                circuitId: sipExact[0].telephone_no || '—',
                billingAccountNo: sipExact[0].billing_account_no || '—',
                dateOfCommission,
                address: cleanAddr,
                wanIp
              };
            }
          }

          // D. Try MMVC exact name match
          if (!foundDetails) {
            const { data: mmvcExact } = await supabase
              .from('mmvc_data')
              .select('*')
              .ilike('customer_name', nameClean)
              .limit(1);
            if (mmvcExact && mmvcExact.length > 0) {
              const { address: cleanAddr, wanIp, dateOfCommission } = parseAddressAndIP(mmvcExact[0].address);
              foundDetails = {
                service: 'MMVC Data',
                plan: mmvcExact[0].mmv_plan || '—',
                circuitId: mmvcExact[0].telephone_no || '—',
                billingAccountNo: mmvcExact[0].billing_account_no || '—',
                dateOfCommission,
                address: cleanAddr,
                wanIp
              };
            }
          }

          // E. Try MPLS exact name match
          if (!foundDetails) {
            const { data: mplsExact } = await supabase
              .from('mpls_data')
              .select('*')
              .ilike('customer_name', nameClean)
              .limit(1);
            if (mplsExact && mplsExact.length > 0) {
              const { address: cleanAddr, wanIp, dateOfCommission } = parseAddressAndIP(mplsExact[0].address);
              foundDetails = {
                service: 'MPLS Data',
                plan: mplsExact[0].bandwidth || '—',
                circuitId: mplsExact[0].telephone_no || '—',
                billingAccountNo: mplsExact[0].billing_account_no || '—',
                dateOfCommission,
                address: cleanAddr,
                wanIp
              };
            }
          }
        }

        if (foundDetails) {
          setExpandedDetails(prev => ({
            ...prev,
            [rowId]: foundDetails
          }));
          return;
        }

        // 2. If no exact name match, fallback to the original loose .or() queries
        // 1. Try ILL
        let { data: ill } = await supabase
          .from('ill_data')
          .select('*')
          .or(`customer_name.ilike.%${nameClean}%,phone_no.eq.${contactNoClean}`)
          .limit(1);

        if (ill && ill.length > 0) {
          const { address: cleanAddr, wanIp, dateOfCommission } = parseAddressAndIP(ill[0].address);
          setExpandedDetails(prev => ({
            ...prev,
            [rowId]: {
              service: 'Internet Leased Line (ILL)',
              plan: ill[0].bandwidth || '—',
              circuitId: ill[0].lc_id || '—',
              billingAccountNo: ill[0].billing_account_no || '—',
              dateOfCommission: (ill[0].service_start_date && ill[0].service_start_date !== 'NULL') ? ill[0].service_start_date : dateOfCommission,
              address: cleanAddr,
              wanIp
            }
          }));
          return;
        }

        // 2. Try PRI
        let { data: pri } = await supabase
          .from('pri_data')
          .select('*')
          .or(`customer_name.ilike.%${nameClean}%,telephone_no.eq.${contactNoClean}`)
          .limit(1);

        if (pri && pri.length > 0) {
          const { address: cleanAddr, wanIp, dateOfCommission } = parseAddressAndIP(pri[0].address);
          setExpandedDetails(prev => ({
            ...prev,
            [rowId]: {
              service: 'PRI Data',
              plan: pri[0].pri_plan || '—',
              circuitId: pri[0].telephone_no || '—',
              billingAccountNo: pri[0].billing_account_no || '—',
              dateOfCommission,
              address: cleanAddr,
              wanIp
            }
          }));
          return;
        }

        // 3. Try SIP
        let { data: sip } = await supabase
          .from('sip_data')
          .select('*')
          .or(`customer_name.ilike.%${nameClean}%,telephone_no.eq.${contactNoClean}`)
          .limit(1);

        if (sip && sip.length > 0) {
          const { address: cleanAddr, wanIp, dateOfCommission } = parseAddressAndIP(sip[0].address);
          setExpandedDetails(prev => ({
            ...prev,
            [rowId]: {
              service: 'SIP Data',
              plan: sip[0].sip_plan || '—',
              circuitId: sip[0].telephone_no || '—',
              billingAccountNo: sip[0].billing_account_no || '—',
              dateOfCommission,
              address: cleanAddr,
              wanIp
            }
          }));
          return;
        }

        // 4. Try MMVC
        let { data: mmvc } = await supabase
          .from('mmvc_data')
          .select('*')
          .or(`customer_name.ilike.%${nameClean}%,telephone_no.eq.${contactNoClean}`)
          .limit(1);

        if (mmvc && mmvc.length > 0) {
          const { address: cleanAddr, wanIp, dateOfCommission } = parseAddressAndIP(mmvc[0].address);
          setExpandedDetails(prev => ({
            ...prev,
            [rowId]: {
              service: 'MMVC Data',
              plan: mmvc[0].mmv_plan || '—',
              circuitId: mmvc[0].telephone_no || '—',
              billingAccountNo: mmvc[0].billing_account_no || '—',
              dateOfCommission,
              address: cleanAddr,
              wanIp
            }
          }));
          return;
        }

        // 5. Try MPLS
        let { data: mpls } = await supabase
          .from('mpls_data')
          .select('*')
          .or(`customer_name.ilike.%${nameClean}%,telephone_no.eq.${contactNoClean}`)
          .limit(1);

        if (mpls && mpls.length > 0) {
          const { address: cleanAddr, wanIp, dateOfCommission } = parseAddressAndIP(mpls[0].address);
          setExpandedDetails(prev => ({
            ...prev,
            [rowId]: {
              service: 'MPLS Data',
              plan: mpls[0].bandwidth || '—',
              circuitId: mpls[0].telephone_no || '—',
              billingAccountNo: mpls[0].billing_account_no || '—',
              dateOfCommission,
              address: cleanAddr,
              wanIp
            }
          }));
          return;
        }

        // Fallback
        setExpandedDetails(prev => ({
          ...prev,
          [rowId]: {
            service: 'None / General Contact',
            plan: '—',
            circuitId: '—',
            billingAccountNo: '—',
            dateOfCommission: '—',
            address: '—'
          }
        }));

      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoadingDetails(prev => ({ ...prev, [rowId]: false }));
      }
    }
  };

  const handleDelete = async (contact) => {
    if (!window.confirm(`Are you sure you want to delete this customer (${contact.companyName})?` + 
      '\nThis will also delete their matching technical service details (ILL, MPLS, PRI, MMVC, SIP) if any.')) return;
    try {
      const nameClean = (contact.companyName || '').trim();
      const contactNoClean = (contact.contactNo || '').trim();

      // 1. Delete from customers_data
      const { error: custError } = await supabase
        .from('customers_data')
        .delete()
        .eq('id', contact.id);

      if (custError) {
        console.error('Error deleting contact:', custError.message);
        alert('Failed to delete contact: ' + custError.message);
        return;
      }

      // 2. Cascade delete from service tables matching strictly
      if (nameClean && nameClean !== '—') {
        let illOr = `customer_name.ilike.${nameClean}`;
        if (contactNoClean && contactNoClean !== '—') {
          illOr += `,phone_no.eq.${contactNoClean}`;
        }
        await supabase.from('ill_data').delete().or(illOr);

        let otherOr = `customer_name.ilike.${nameClean}`;
        if (contactNoClean && contactNoClean !== '—') {
          otherOr += `,telephone_no.eq.${contactNoClean}`;
        }

        await supabase.from('pri_data').delete().or(otherOr);
        await supabase.from('sip_data').delete().or(otherOr);
        await supabase.from('mmvc_data').delete().or(otherOr);
        await supabase.from('mpls_data').delete().or(otherOr);
      } else if (contactNoClean && contactNoClean !== '—') {
        await supabase.from('ill_data').delete().eq('phone_no', contactNoClean);
        await supabase.from('pri_data').delete().eq('telephone_no', contactNoClean);
        await supabase.from('sip_data').delete().eq('telephone_no', contactNoClean);
        await supabase.from('mmvc_data').delete().eq('telephone_no', contactNoClean);
        await supabase.from('mpls_data').delete().eq('telephone_no', contactNoClean);
      }

      loadContacts();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = searchTerm.trim()
    ? allContacts.filter(item =>
        item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contactNo.includes(searchTerm) ||
        item.mailId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allContacts;

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const renderPaginationButtons = () => {
    const pages = [];
    if (totalPages <= 8) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1); // Always show first page
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        end = 4;
      }
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      pages.push(totalPages); // Always show last page
    }
    
    return pages.map((p, idx) => {
      if (p === '...') {
        return (
          <span key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-600 text-sm font-bold">
            ...
          </span>
        );
      }
      return (
        <button
          key={p}
          onClick={() => setCurrentPage(p)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all ${
            p === currentPage 
              ? 'bg-primary text-white shadow-[0_0_15px_rgba(0,180,216,0.3)]' 
              : 'bg-dark-card border border-dark-border text-gray-400 hover:border-primary hover:text-white'
          }`}
        >
          {p}
        </button>
      );
    });
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 bg-dark-bg min-h-screen">

      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3b3598] to-[#00bfff] flex items-center justify-center shadow">
            <UserPlus size={16} className="text-white" />
          </span>
          <div>
            <h3 className="text-white font-black text-lg uppercase tracking-tight">Customer Directory</h3>
            <p className="text-gray-400 text-xs">
              {loading ? 'Loading…' : `${filtered.length} contact${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={downloadExcel}
            className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] h-[38px]"
            title="Download Excel"
          >
            <FileDown size={14} />
            <span>Export</span>
          </button>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name, contact, email…"
              className="pl-9 pr-4 py-2 w-72 bg-dark-card border border-dark-border rounded-md outline-none focus:ring-2 focus:ring-[#00bfff]/20 transition-all text-gray-300 text-sm shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl shadow-xl border border-dark-border bg-dark-card animate-in slide-in-from-bottom-4 duration-500">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark-bg/60 border-b border-dark-border text-gray-400">
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">#</th>
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Company Name</th>
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Contact Name</th>
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Designation</th>
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Contact No</th>
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Mail ID</th>
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Action</th>
              <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border/20">
            {loading ? (
              <tr>
                <td colSpan="9" className="px-6 py-20 text-center">
                  <Loader2 size={32} className="animate-spin text-primary mx-auto" />
                </td>
              </tr>
            ) : paginated.length > 0 ? (
              paginated.map((item, index) => {
                const rowId = item.id;
                const details = expandedDetails[rowId];
                const isDetailsLoading = loadingDetails[rowId];

                return (
                  <React.Fragment key={rowId}>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                      <td className="px-6 py-4 text-sm text-white font-bold">{item.companyName}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.contactName}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.designation}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.contactNo}</td>
                      <td className="px-6 py-4 text-sm text-gray-300 truncate max-w-[200px]">{item.mailId}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete contact"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => toggleRow(item)} 
                          className="p-1.5 text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center justify-center mx-auto"
                          title="View Details"
                        >
                          {expandedRows[rowId] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                      </td>
                    </tr>
                    {expandedRows[rowId] && (
                      <tr className="bg-dark-bg/40">
                        <td colSpan="9" className="p-0 border-b border-dark-border/20">
                          <div className="px-10 py-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-2 mb-4 border-b border-dark-border pb-2 inline-flex">
                              <Info size={16} className="text-primary" />
                              <h4 className="font-black text-white text-xs uppercase tracking-wider">Circuit & Technical Details</h4>
                            </div>

                            {isDetailsLoading ? (
                              <div className="flex items-center gap-3 py-4 text-gray-500 text-sm">
                                <Loader2 size={16} className="animate-spin text-primary" />
                                <span>Matching with active circuits…</span>
                              </div>
                            ) : details ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-dark-card p-5 rounded-xl border border-dark-border shadow-sm">
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Service Type</p>
                                  <p className="text-sm font-semibold text-primary">{details.service || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Plan / Bandwidth</p>
                                  <p className="text-sm font-semibold text-gray-300">{details.plan || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Circuit ID / Phone</p>
                                  <p className="text-sm font-semibold text-gray-300">{details.circuitId || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Billing Account No</p>
                                  <p className="text-sm font-semibold text-gray-300">{details.billingAccountNo || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Date of Commission</p>
                                  <p className="text-sm font-semibold text-gray-300">{details.dateOfCommission || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">WAN IP Address</p>
                                  <p className="text-sm font-semibold text-gray-300">{details.wanIp || '—'}</p>
                                </div>
                                <div className="md:col-span-3 lg:col-span-2">
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Customer Address</p>
                                  <p className="text-sm font-semibold text-gray-300">{details.address || '—'}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 py-2">
                                No active circuit match found in service sheets.
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-20 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">
                  {searchTerm ? `No contacts found for "${searchTerm}"` : 'No customers yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Dynamic sliding window pagination footer */}
        <div className="px-8 py-6 bg-dark-bg/30 border-t border-dark-border flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Showing {paginated.length} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 bg-dark-card border border-dark-border rounded-xl text-gray-400 hover:text-primary hover:border-primary disabled:opacity-30 transition-all"
            ><ChevronRight size={18} className="rotate-180" /></button>
            
            <div className="flex gap-2">
              {renderPaginationButtons()}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 bg-dark-card border border-dark-border rounded-xl text-gray-400 hover:text-primary hover:border-primary disabled:opacity-30 transition-all"
            ><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CustomerContacts;
