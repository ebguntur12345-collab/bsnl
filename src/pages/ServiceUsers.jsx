import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Laptop, ChevronRight, ChevronDown, Info, ArrowLeft, Users, Zap, Phone, Globe, Loader2, RefreshCw, FileDown, FileUp, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { downloadServiceExcel } from '../lib/excelExport';
import { importExcelData } from '../lib/excelImport';

const getTableInfo = (serviceName) => {
  const target = serviceName.toLowerCase();
  let table = 'eb_contacts';
  const isDOJ = target.includes('doj');
  const isElection = target.includes('election');
  const isCollector = target.includes('collector');
  const isNHM = target.includes('nhm');
  
  if (isDOJ) table = 'ill_data';
  else if (isElection) table = 'toll_free';
  else if (isCollector) table = 'ill_data';
  else if (isNHM) table = 'ill_data';
  else if (target.includes('ill') || target.includes('leased line')) table = 'ill_data';
  else if (target.includes('pri')) table = 'pri_data';
  else if (target.includes('sip')) table = 'sip_data';
  else if (target.includes('mmvc')) table = 'mmvc_data';
  else if (target.includes('mpls')) table = 'mpls_data';
  else if (target.includes('nmect')) table = 'nmect_data';
  else if (target.includes('cggb')) table = 'cggb';
  else if (target.includes('tobacco')) table = 'tobacco_board';
  else if (target.includes('nregs')) table = 'nregs';
  else if (target.includes('ftth')) table = 'ftth_data';
  else if (target.includes('toll')) table = 'toll_free';

  return { table, isDOJ, isElection, isCollector, isNHM };
};

const getFieldsForTable = (table, serviceName) => {
  if (table === 'ill_data') {
    return [
      { key: 'customer_name', label: 'Company / Customer Name', required: true },
      { key: 'billing_ssa', label: 'Location (SSA)', required: true },
      { key: 'lc_id', label: 'Circuit ID (LC ID)' },
      { key: 'bandwidth', label: 'Plan / Bandwidth' },
      { key: 'billing_account_no', label: 'Billing Account No' },
      { key: 'phone_no', label: 'Contact No' },
      { key: 'email_address', label: 'Mail ID' },
      { key: 'service_start_date', label: 'Date of Commission' },
      { key: 'last_mile', label: 'Last Mile' },
      { key: 'address', label: 'Installation Address' },
    ];
  }
  if (table === 'pri_data') {
    return [
      { key: 'customer_name', label: 'Company / Customer Name', required: true },
      { key: 'telephone_no', label: 'Telephone No', required: true },
      { key: 'pri_plan', label: 'PRI Plan' },
      { key: 'billing_account_no', label: 'Billing Account No' },
      { key: 'address', label: 'Installation Address' },
    ];
  }
  if (table === 'sip_data') {
    return [
      { key: 'customer_name', label: 'Company / Customer Name', required: true },
      { key: 'telephone_no', label: 'Telephone No', required: true },
      { key: 'sip_plan', label: 'SIP Plan' },
      { key: 'billing_account_no', label: 'Billing Account No' },
      { key: 'address', label: 'Installation Address' },
    ];
  }
  if (table === 'mmvc_data') {
    return [
      { key: 'customer_name', label: 'Company / Customer Name', required: true },
      { key: 'telephone_no', label: 'Telephone No', required: true },
      { key: 'mmv_plan', label: 'MMV Plan' },
      { key: 'billing_account_no', label: 'Billing Account No' },
      { key: 'address', label: 'Installation Address' },
    ];
  }
  if (table === 'mpls_data') {
    return [
      { key: 'customer_name', label: 'Company / Customer Name', required: true },
      { key: 'telephone_no', label: 'Telephone No' },
      { key: 'bandwidth', label: 'Bandwidth' },
      { key: 'billing_account_no', label: 'Billing Account No' },
      { key: 'address', label: 'Installation Address' },
    ];
  }
  if (table === 'nmect_data') {
    return [
      { key: 'customer_name', label: 'Company / Customer Name', required: true },
      { key: 'telephone_no', label: 'Telephone No', required: true },
      { key: 'bandwidth', label: 'Bandwidth' },
      { key: 'nmect_plan', label: 'NMECT Plan' },
      { key: 'billing_account_no', label: 'Billing Account No' },
      { key: 'address', label: 'Installation Address' },
    ];
  }
  if (table === 'cggb') {
    return [
      { key: 'name', label: 'Company / Customer Name', required: true },
      { key: 'oa', label: 'Location (OA)' },
      { key: 'circuit_id', label: 'Circuit ID' },
      { key: 'bandwidth', label: 'Bandwidth' },
      { key: 'billing_account', label: 'Billing Account' },
      { key: 'wan_ip', label: 'WAN IP' },
      { key: 'field_incharge_name', label: 'Field Incharge Name' },
      { key: 'field_incharge_number', label: 'Field Incharge Number' },
    ];
  }
  if (table === 'tobacco_board') {
    return [
      { key: 'location', label: 'Tobacco Board Location', required: true },
      { key: 'circle', label: 'Circle' },
      { key: 'ba_name', label: 'BA Name' },
      { key: 'lc_id', label: 'LC ID' },
      { key: 'bandwidth', label: 'Bandwidth' },
      { key: 'billing_account', label: 'Billing Account' },
      { key: 'contact_no', label: 'Contact No' },
      { key: 'eb_incharge', label: 'EB Incharge' },
      { key: 'bbm_incharge', label: 'BBM Incharge' },
      { key: 'bbm_contact', label: 'BBM Contact' },
    ];
  }
  if (table === 'nregs') {
    return [
      { key: 'computer_operator_name', label: 'Computer Operator Name', required: true },
      { key: 'mandal', label: 'Mandal' },
      { key: 'district', label: 'District' },
      { key: 'telephone_no', label: 'Telephone No' },
      { key: 'contact_no', label: 'Contact No' },
      { key: 'bbm_no', label: 'BBM No' },
      { key: 'tip_no', label: 'TIP No' },
      { key: 'drp_contact_no', label: 'DRP Contact No' },
    ];
  }
  if (table === 'ftth_data') {
    return [
      { key: 'customer_name', label: 'Customer Name', required: true },
      { key: 'phone_no', label: 'Phone No', required: true },
      { key: 'billing_account_no', label: 'Billing Account No' },
      { key: 'ftth_plan', label: 'FTTH Plan' },
      { key: 'ont_id', label: 'ONT ID' },
      { key: 'area', label: 'Area / Location' },
      { key: 'email_address', label: 'Email Address' },
      { key: 'service_start_date', label: 'Service Start Date' },
      { key: 'address', label: 'Installation Address' },
    ];
  }
  if (table === 'toll_free') {
    return [
      { key: 'customer_name', label: 'Company / Customer Name', required: true },
      { key: 'telephone_no', label: 'Telephone No', required: true },
      { key: 'billing_account_no', label: 'Billing Account No' },
      { key: 'address', label: 'Installation Address' },
    ];
  }
  return [
    { key: 'enterprise_name', label: 'Enterprise/Company Name', required: true },
    { key: 'name', label: 'Contact Person Name', required: true },
    { key: 'designation', label: 'Designation' },
    { key: 'mobile', label: 'Contact/Mobile No', required: true },
    { key: 'mail_id', label: 'Email ID' },
    { key: 'circle', label: 'Circle/Location' },
    { key: 'ba_name', label: 'BA Name/District' },
    { key: 'service_type', label: 'Service Category', required: true, value: serviceName, readOnly: true },
  ];
};

const ServiceUsers = () => {
  const { serviceType } = useParams();
  const navigate = useNavigate();
  
  // Human-readable title mapping
  const decodedService = decodeURIComponent(serviceType);

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [importing, setImporting] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const rowsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalData, setModalData] = useState({});
  const [saving, setSaving] = useState(false);

  const { table } = getTableInfo(decodedService);
  const fields = getFieldsForTable(table, decodedService);

  const handleAddClick = () => {
    setEditingId(null);
    const initial = {};
    fields.forEach(f => {
      initial[f.key] = f.value !== undefined ? f.value : '';
    });
    setModalData(initial);
    setIsModalOpen(true);
  };

  const handleEditClick = (user) => {
    setEditingId(user.id);
    setModalData({ ...user._raw });
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (user) => {
    if (!window.confirm(`Are you sure you want to delete this connection?`)) return;
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', user.id);
      if (error) {
        alert('Error deleting connection: ' + error.message);
      } else {
        setReloadTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...modalData };
      delete payload.id;
      delete payload.created_at;

      if (table === 'eb_contacts') {
        payload.service_type = decodedService;
      }

      let res;
      if (editingId) {
        // Simulate update using DELETE + INSERT with the same ID because RLS blocks direct UPDATEs
        const deleteRes = await supabase.from(table).delete().eq('id', editingId);
        if (deleteRes.error) {
          res = deleteRes;
        } else {
          res = await supabase.from(table).insert([{ id: editingId, ...payload }]);
        }
      } else {
        res = await supabase.from(table).insert([payload]);
      }

      if (res.error) {
        alert('Error saving connection: ' + res.error.message);
      } else {
        setIsModalOpen(false);
        setReloadTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const result = await importExcelData(file, 'service_users', decodedService);
      alert(`Successfully imported ${result.count} connections and registered ${result.customerCount} customer contacts!`);
      setReloadTrigger(prev => prev + 1);
    } catch (err) {
      console.error(err);
      alert(`Import failed: ${err.message || err}`);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  
  
  useEffect(() => {
    setCurrentPage(1);
    const fetchServiceData = async () => {
      setLoading(true);
      try {
        const target = decodedService.toLowerCase();
        let table = 'eb_contacts';
        const isDOJ = target.includes('doj');
        const isElection = target.includes('election');
        const isCollector = target.includes('collector');
        const isNHM = target.includes('nhm');
        
        if (isDOJ) table = 'ill_data';
        else if (isElection) table = 'toll_free';
        else if (isCollector) table = 'ill_data';
        else if (isNHM) table = 'ill_data';
        else if (target.includes('ill') || target.includes('leased line')) table = 'ill_data';
        else if (target.includes('pri')) table = 'pri_data';
        else if (target.includes('sip')) table = 'sip_data';
        else if (target.includes('mmvc')) table = 'mmvc_data';
        else if (target.includes('mpls')) table = 'mpls_data';
        else if (target.includes('nmect')) table = 'nmect_data';
        else if (target.includes('cggb')) table = 'cggb';
        else if (target.includes('tobacco')) table = 'tobacco_board';
        else if (target.includes('nregs')) table = 'nregs';
        else if (target.includes('ftth')) table = 'ftth_data';
        else if (target.includes('toll')) table = 'toll_free';

        let query = supabase.from(table).select('*');
        
        if (isDOJ) {
          query = query.or('customer_name.ilike.%doj%,customer_name.ilike.%justice%,customer_name.ilike.%court%');
        } else if (isElection) {
          query = query.or('customer_name.ilike.%election%,customer_name.ilike.%commission%');
        } else if (isCollector) {
          query = query.or('customer_name.ilike.%collector%,customer_name.ilike.%collectorate%');
        } else if (isNHM) {
          query = query.or('customer_name.ilike.%nhm%,customer_name.ilike.%health%');
        } else if (table === 'eb_contacts') {
          query = query.eq('service_type', decodedService);
        }

        const { data, error } = await query.order('id', { ascending: true });

        if (error) {
          console.error(error);
          setUsers([]);
        } else if (data) {
          // Map to uniform UI format
          const mapped = data.map(r => {
            if (table === 'ill_data') {
              const displayServiceType = isDOJ ? 'DOJ' : (isCollector ? 'Collectorates' : (isNHM ? 'NHM' : 'Internet Leased Line (ILL)'));
              return {
                id: r.id,
                companyName: r.customer_name || '—',
                mailId: r.email_address || '—',
                location: r.billing_ssa || '—',
                circuitId: r.lc_id || '—',
                plan: r.bandwidth || '—',
                contactNo: r.phone_no || '—',
                billingAccountNo: r.billing_account_no || '—',
                dateOfCommission: r.service_start_date || '—',
                address: r.address || '—',
                serviceType: displayServiceType,
                detailFields: [
                  { label: 'Service Category', value: displayServiceType },
                  { label: 'Billing Account', value: r.billing_account_no || '—' },
                  { label: 'Commission Date', value: r.service_start_date || '—' },
                  { label: 'Installation SSA', value: r.billing_ssa || '—' },
                  { label: 'Last Mile', value: r.last_mile || '—' },
                  { label: 'Full Site Address', value: r.address || '—' },
                ]
              };
            } else if (table === 'pri_data') {
              return {
                id: r.id,
                companyName: r.customer_name || '—',
                mailId: '—',
                location: '—',
                circuitId: r.telephone_no || '—',
                plan: r.pri_plan || '—',
                contactNo: r.telephone_no || '—',
                billingAccountNo: r.billing_account_no || '—',
                dateOfCommission: '—',
                address: r.address || '—',
                serviceType: 'ISDN PRI',
                detailFields: [
                  { label: 'Service Category', value: 'ISDN PRI' },
                  { label: 'Billing Account', value: r.billing_account_no || '—' },
                  { label: 'Telephone No', value: r.telephone_no || '—' },
                  { label: 'PRI Plan', value: r.pri_plan || '—' },
                  { label: 'Full Site Address', value: r.address || '—' },
                ]
              };
            } else if (table === 'sip_data') {
              return {
                id: r.id,
                companyName: r.customer_name || '—',
                mailId: '—',
                location: '—',
                circuitId: r.telephone_no || '—',
                plan: r.sip_plan || '—',
                contactNo: r.telephone_no || '—',
                billingAccountNo: r.billing_account_no || '—',
                dateOfCommission: '—',
                address: r.address || '—',
                serviceType: 'SIP Trunk',
                detailFields: [
                  { label: 'Service Category', value: 'SIP Trunk' },
                  { label: 'Billing Account', value: r.billing_account_no || '—' },
                  { label: 'Telephone No', value: r.telephone_no || '—' },
                  { label: 'SIP Plan', value: r.sip_plan || '—' },
                  { label: 'Full Site Address', value: r.address || '—' },
                ]
              };
            } else if (table === 'mmvc_data') {
              return {
                id: r.id,
                companyName: r.customer_name || '—',
                mailId: '—',
                location: '—',
                circuitId: r.telephone_no || '—',
                plan: r.mmv_plan || '—',
                contactNo: r.telephone_no || '—',
                billingAccountNo: r.billing_account_no || '—',
                dateOfCommission: '—',
                address: r.address || '—',
                serviceType: 'MMVC',
                detailFields: [
                  { label: 'Service Category', value: 'MMVC' },
                  { label: 'Billing Account', value: r.billing_account_no || '—' },
                  { label: 'Telephone No', value: r.telephone_no || '—' },
                  { label: 'MMV Plan', value: r.mmv_plan || '—' },
                  { label: 'Full Site Address', value: r.address || '—' },
                ]
              };
            } else if (table === 'mpls_data') {
              return {
                id: r.id,
                companyName: r.customer_name || '—',
                mailId: '—',
                location: '—',
                circuitId: r.telephone_no || '—',
                plan: r.bandwidth || '—',
                contactNo: r.telephone_no || '—',
                billingAccountNo: r.billing_account_no || '—',
                dateOfCommission: '—',
                address: r.address || '—',
                serviceType: 'MPLS VPN',
                detailFields: [
                  { label: 'Service Category', value: 'MPLS VPN' },
                  { label: 'Billing Account', value: r.billing_account_no || '—' },
                  { label: 'Telephone No', value: r.telephone_no || '—' },
                  { label: 'Bandwidth', value: r.bandwidth || '—' },
                  { label: 'Full Site Address', value: r.address || '—' },
                ]
              };
            } else if (table === 'nmect_data') {
              return {
                id: r.id,
                companyName: r.customer_name || '—',
                mailId: '—',
                location: '—',
                circuitId: r.telephone_no || '—',
                plan: r.nmect_plan || r.bandwidth || '—',
                contactNo: r.telephone_no || '—',
                billingAccountNo: r.billing_account_no || '—',
                dateOfCommission: '—',
                address: r.address || '—',
                serviceType: 'NMECT',
                detailFields: [
                  { label: 'Service Category', value: 'NMECT' },
                  { label: 'Billing Account', value: r.billing_account_no || '—' },
                  { label: 'Telephone No', value: r.telephone_no || '—' },
                  { label: 'Bandwidth', value: r.bandwidth || '—' },
                  { label: 'NMECT Plan', value: r.nmect_plan || '—' },
                  { label: 'Full Site Address', value: r.address || '—' },
                ]
              };
            } else if (table === 'cggb') {
              return {
                id: r.id,
                companyName: r.name || '—',
                mailId: '—',
                location: r.oa || '—',
                circuitId: r.circuit_id || '—',
                plan: r.bandwidth || '—',
                contactNo: r.field_incharge_number || '—',
                billingAccountNo: r.billing_account || '—',
                dateOfCommission: '—',
                address: '—',
                serviceType: 'CGGB',
                detailFields: [
                  { label: 'Service Category', value: 'CGGB' },
                  { label: 'Billing Account', value: r.billing_account || '—' },
                  { label: 'Circuit ID', value: r.circuit_id || '—' },
                  { label: 'Bandwidth', value: r.bandwidth || '—' },
                  { label: 'WAN IP', value: r.wan_ip || '—' },
                  { label: 'OA (Location)', value: r.oa || '—' },
                  { label: 'Field Incharge Name', value: r.field_incharge_name || '—' },
                  { label: 'Field Incharge Number', value: r.field_incharge_number || '—' },
                  { label: 'PCM Incharge Number', value: r.pcm_incharge_number || '—' },
                ]
              };
            } else if (table === 'tobacco_board') {
              return {
                id: r.id,
                companyName: `Tobacco Board (${r.location || '—'})`,
                mailId: '—',
                location: r.ba_name ? `${r.ba_name} (${r.circle || '—'})` : (r.circle || '—'),
                circuitId: r.lc_id || '—',
                plan: r.bandwidth || '—',
                contactNo: r.contact_no || '—',
                billingAccountNo: r.billing_account || '—',
                dateOfCommission: '—',
                address: '—',
                serviceType: 'Tobacco Board',
                detailFields: [
                  { label: 'Service Category', value: 'Tobacco Board' },
                  { label: 'Billing Account', value: r.billing_account || '—' },
                  { label: 'LC ID', value: r.lc_id || '—' },
                  { label: 'CCT Rent Qly', value: r.cct_rent_qly || '—' },
                  { label: 'Bandwidth', value: r.bandwidth || '—' },
                  { label: 'Circle', value: r.circle || '—' },
                  { label: 'BA Name', value: r.ba_name || '—' },
                  { label: 'EB Incharge', value: r.eb_incharge || '—' },
                  { label: 'Contact No', value: r.contact_no || '—' },
                  { label: 'BBM Incharge', value: r.bbm_incharge || '—' },
                  { label: 'BBM Contact', value: r.bbm_contact || '—' },
                ]
              };
            } else if (table === 'nregs') {
              return {
                id: r.id,
                companyName: r.computer_operator_name ? `Computer Operator: ${r.computer_operator_name}` : 'NREGS Office',
                mailId: '—',
                location: r.mandal ? `${r.mandal}, ${r.district || '—'}` : (r.district || '—'),
                circuitId: r.telephone_no || '—',
                plan: r.bbm_no ? `BBM: ${r.bbm_no}` : (r.tip_no ? `TIP: ${r.tip_no}` : '—'),
                contactNo: r.contact_no || '—',
                billingAccountNo: '—',
                dateOfCommission: '—',
                address: '—',
                serviceType: 'NREGS',
                detailFields: [
                  { label: 'Service Category', value: 'NREGS' },
                  { label: 'District', value: r.district || '—' },
                  { label: 'Mandal', value: r.mandal || '—' },
                  { label: 'Telephone No', value: r.telephone_no || '—' },
                  { label: 'Computer Operator Name', value: r.computer_operator_name || '—' },
                  { label: 'Contact No', value: r.contact_no || '—' },
                  { label: 'DRP Contact No', value: r.drp_contact_no || '—' },
                  { label: 'BBM No', value: r.bbm_no || '—' },
                  { label: 'TIP No', value: r.tip_no || '—' },
                ]
              };
            } else if (table === 'ftth_data') {
              return {
                id: r.id,
                companyName: r.customer_name || '—',
                mailId: r.email_address || '—',
                location: r.area || '—',
                circuitId: r.ont_id || r.phone_no || '—',
                plan: r.ftth_plan || '—',
                contactNo: r.phone_no || '—',
                billingAccountNo: r.billing_account_no || '—',
                dateOfCommission: r.service_start_date || '—',
                address: r.address || '—',
                serviceType: 'FTTH',
                detailFields: [
                  { label: 'Service Category', value: 'FTTH' },
                  { label: 'FTTH Plan', value: r.ftth_plan || '—' },
                  { label: 'ONT ID', value: r.ont_id || '—' },
                  { label: 'Phone No', value: r.phone_no || '—' },
                  { label: 'Billing Account', value: r.billing_account_no || '—' },
                  { label: 'Area / Location', value: r.area || '—' },
                  { label: 'Email', value: r.email_address || '—' },
                  { label: 'Service Start Date', value: r.service_start_date || '—' },
                  { label: 'Installation Address', value: r.address || '—' },
                ]
              };
            } else if (table === 'toll_free') {
              const displayServiceType = isElection ? 'Election Commission' : 'Toll Free';
              return {
                id: r.id,
                companyName: r.customer_name || '—',
                mailId: '—',
                location: '—',
                circuitId: r.telephone_no || '—',
                plan: '—',
                contactNo: r.telephone_no || '—',
                billingAccountNo: r.billing_account_no || '—',
                dateOfCommission: '—',
                address: r.address || '—',
                serviceType: displayServiceType,
                detailFields: [
                  { label: 'Service Category', value: isElection ? 'Election Commission (Toll Free)' : 'Toll Free' },
                  { label: 'Billing Account', value: r.billing_account_no || '—' },
                  { label: 'Telephone No', value: r.telephone_no || '—' },
                  { label: 'Customer Name', value: r.customer_name || '—' },
                  { label: 'Full Site Address', value: r.address || '—' },
                ]
              };
            } else if (table === 'eb_contacts') {
              return {
                id: r.id,
                companyName: r.enterprise_name || '—',
                mailId: r.mail_id || '—',
                location: r.ba_name ? `${r.ba_name} (${r.circle || '—'})` : (r.circle || '—'),
                circuitId: '—',
                plan: '—',
                contactNo: r.mobile || '—',
                billingAccountNo: '—',
                dateOfCommission: '—',
                address: '—',
                serviceType: r.service_type || decodedService,
                detailFields: [
                  { label: 'Service Category', value: r.service_type || decodedService },
                  { label: 'Enterprise Name', value: r.enterprise_name || '—' },
                  { label: 'Contact Person Name', value: r.name || '—' },
                  { label: 'Designation', value: r.designation || '—' },
                  { label: 'Email ID', value: r.mail_id || '—' },
                  { label: 'Circle/Location', value: r.circle || '—' },
                  { label: 'BA Name/District', value: r.ba_name || '—' },
                  { label: 'Mobile No', value: r.mobile || '—' },
                ]
              };
            } else {
              return {
                id: r.id,
                companyName: r.company_name || '—',
                mailId: r.mail_id || '—',
                location: r.location || '—',
                circuitId: '—',
                plan: '—',
                contactNo: r.contact_no || '—',
                billingAccountNo: '—',
                dateOfCommission: '—',
                address: '—',
                serviceType: 'General',
                detailFields: [
                  { label: 'Service Category', value: 'General' },
                  { label: 'Company Name', value: r.company_name || '—' },
                  { label: 'Email ID', value: r.mail_id || '—' },
                  { label: 'Location', value: r.location || '—' },
                  { label: 'Contact Name', value: r.contact_name || '—' },
                  { label: 'Designation', value: r.designation || '—' },
                  { label: 'Contact No', value: r.contact_no || '—' },
                ]
              };
            }
          });
          const mappedWithRaw = mapped.map((m, idx) => ({ ...m, _raw: data[idx] }));
          setUsers(mappedWithRaw);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchServiceData();
  }, [decodedService, reloadTrigger]);

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = searchTerm.trim()
    ? users.filter(u =>
        (u.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.contactName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.contactNo || '').includes(searchTerm) ||
        (u.circuitId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.location || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

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

  const getIcon = () => {
    const t = decodedService.toLowerCase();
    if (t.includes('ill') || t.includes('doj') || t.includes('collector') || t.includes('nhm')) return <Zap size={24} className="text-white" />;
    if (t.includes('mpls')) return <Globe size={24} className="text-white" />;
    if (t.includes('sip') || t.includes('pri') || t.includes('toll') || t.includes('election')) return <Phone size={24} className="text-white" />;
    if (t.includes('nregs')) return <RefreshCw size={24} className="text-white" />;
    if (t.includes('cggb')) return <Users size={24} className="text-white" />;
    if (t.includes('ftth')) return <Zap size={24} className="text-white" />;
    return <Laptop size={24} className="text-white" />;
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/leased-lines')}
            className="p-2 rounded-xl bg-dark-card border border-dark-border text-gray-400 hover:text-white hover:border-primary/40 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/20">
            {getIcon()}
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">{decodedService} Customers</h1>
            <p className="text-gray-400 text-sm font-medium">
              {loading ? 'Loading live circuits…' : `${filtered.length} active circuit${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
            title="Add Connection"
          >
            <Plus size={16} />
            <span>Add Connection</span>
          </button>

          <button
            onClick={() => downloadServiceExcel(decodedService)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
            title="Download Excel"
          >
            <FileDown size={16} />
            <span>Export</span>
          </button>

          {/* Import Button */}
          <input
            type="file"
            id="import-excel-input"
            accept=".xlsx, .xls"
            onChange={handleImportExcel}
            className="hidden"
          />
          <button
            onClick={() => document.getElementById('import-excel-input').click()}
            disabled={importing}
            className="flex items-center gap-2 bg-dark-card border border-dark-border hover:border-primary/50 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            title="Upload/Import Excel"
          >
            {importing ? (
              <Loader2 size={16} className="animate-spin text-primary" />
            ) : (
              <FileUp size={16} className="text-primary" />
            )}
            <span>{importing ? 'Importing…' : 'Import'}</span>
          </button>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search by company, ID, location…"
              className="pl-9 pr-4 py-2.5 w-80 bg-dark-card border border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm text-gray-300 placeholder:text-gray-600 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: `Total ${decodedService} Users`, value: users.length, color: 'text-primary' },
          { label: 'Active Circuits', value: users.filter(u => u.circuitId && u.circuitId !== '—').length, color: 'text-emerald-400' },
          { label: 'Standard Plans', value: users.filter(u => u.plan && u.plan !== '—').length, color: 'text-amber-400' },
        ].map((s, i) => (
          <div key={i} className="bg-dark-card border border-dark-border rounded-2xl p-5 border-l-4 border-l-primary/30">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{loading ? '…' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-dark-border shadow-2xl bg-dark-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-bg/50 text-gray-500 border-b border-dark-border">
                {['#', 'Company / Customer', 'Location', 'Circuit ID / Phone', 'Plan / Bandwidth', 'Contact No', 'Actions', 'Details'].map(h => (
                  <th key={h} className="px-5 py-4 font-black text-[10px] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/30">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-20 text-center">
                    <Loader2 size={32} className="animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : paginated.length > 0 ? (
                paginated.map((user, index) => {
                  const rowId = user.id || index;
                  return (
                    <React.Fragment key={rowId}>
                      <tr className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-5 py-4 text-sm text-gray-500 font-bold">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-black text-white">{user.companyName || '—'}</p>
                          <p className="text-[10px] text-gray-500 font-bold">{user.mailId || '—'}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-400 font-medium">{user.location || '—'}</td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-black tracking-wider uppercase">
                            {user.circuitId || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-400 font-medium">{user.plan || '—'}</td>
                        <td className="px-5 py-4 text-sm text-gray-400 font-medium">{user.contactNo || '—'}</td>
                        <td className="px-5 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(user)}
                              className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center"
                              title="Edit connection"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center justify-center"
                              title="Delete connection"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => toggleRow(rowId)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                          >
                            {expandedRows[rowId] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {expandedRows[rowId] && (
                        <tr className="bg-dark-bg/30">
                          <td colSpan="8" className="px-10 py-8 border-b border-dark-border/50">
                            <div className="flex items-center gap-2 mb-6">
                              <Info size={14} className="text-primary" />
                              <h4 className="font-black text-primary text-[10px] uppercase tracking-[0.2em]">Full Circuit Specifications</h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 bg-dark-card/50 p-6 rounded-2xl border border-dark-border">
                              {(user.detailFields || [
                                { label: 'Service Category', value: user.serviceType },
                                { label: 'Billing Account', value: user.billingAccountNo },
                                { label: 'Commission Date', value: user.dateOfCommission },
                                { label: 'Installation SSA', value: user.location },
                                { label: 'Full Site Address', value: user.address },
                              ]).map((f, i) => (
                                <div key={i} className="min-w-0">
                                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">{f.label}</p>
                                  <p className="text-xs font-bold text-white leading-relaxed break-words">{f.value || '—'}</p>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-5 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-3xl bg-dark-bg border border-dark-border flex items-center justify-center">
                        <Users size={32} className="text-gray-700" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400 font-black text-sm uppercase tracking-widest">
                          {searchTerm ? `No results for "${searchTerm}"` : `No ${decodedService} Customers`}
                        </p>
                        <p className="text-gray-600 text-xs font-bold">No circuits currently provisioned in database.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

      {/* Dynamic Data Edit / Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[999] p-4 animate-in fade-in duration-300">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300 relative">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
              <h3 className="text-white font-black text-sm uppercase tracking-wider">
                {editingId ? `Edit ${decodedService} Connection` : `Add New ${decodedService} Connection`}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
            
            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((f) => (
                  <div key={f.key} className="flex flex-col space-y-1.5">
                    <label className="text-[9px] font-black text-primary uppercase tracking-[0.2em] ml-1">
                      {f.label} {f.required && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="text"
                      required={f.required}
                      disabled={f.readOnly}
                      value={modalData[f.key] || ''}
                      onChange={(e) => setModalData(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={`Enter ${f.label}`}
                      className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-700 disabled:opacity-50"
                    />
                  </div>
                ))}
              </div>
              
              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-border/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-dark-bg border border-dark-border text-gray-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save Connection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceUsers;
