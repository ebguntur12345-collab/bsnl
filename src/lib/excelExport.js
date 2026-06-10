import * as XLSX from 'xlsx';
import { supabase } from './supabase';

export const getServiceTableInfo = (serviceName) => {
  const target = serviceName.toLowerCase();
  let table = '';
  let isDOJ = false;
  let isElection = false;
  let isCollector = false;
  let isNHM = false;

  if (target.includes('doj')) {
    table = 'ill_data';
    isDOJ = true;
  } else if (target.includes('election')) {
    table = 'toll_free';
    isElection = true;
  } else if (target.includes('collector')) {
    table = 'ill_data';
    isCollector = true;
  } else if (target.includes('nhm')) {
    table = 'ill_data';
    isNHM = true;
  } else if (target.includes('ill') || target.includes('leased line')) {
    table = 'ill_data';
  } else if (target.includes('pri')) {
    table = 'pri_data';
  } else if (target.includes('sip')) {
    table = 'sip_data';
  } else if (target.includes('mmvc')) {
    table = 'mmvc_data';
  } else if (target.includes('mpls')) {
    table = 'mpls_data';
  } else if (target.includes('nmect')) {
    table = 'nmect_data';
  } else if (target.includes('cggb')) {
    table = 'cggb';
  } else if (target.includes('tobacco')) {
    table = 'tobacco_board';
  } else if (target.includes('nregs')) {
    table = 'nregs';
  } else if (target.includes('ftth')) {
    table = 'ftth_data';
  } else if (target.includes('toll')) {
    table = 'toll_free';
  }

  if (!table) {
    table = 'eb_contacts';
  }

  return { table, isDOJ, isElection, isCollector, isNHM };
};

export const mapServiceRow = (r, table, isDOJ, isCollector, isNHM, isElection, customersList = [], index = 0) => {
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

  // Get raw values from table record
  let companyName = '—';
  let location = '—';
  let contactName = '—';
  let designation = '—';
  let contactNo = '—';
  let mailId = '—';
  
  let serviceType = '—';
  let plan = '—';
  let circuitId = '—';
  let billingAccountNo = '—';
  let dateOfCommission = '—';
  let address = '—';
  let wanIp = '—';

  // 1. Resolve Company Name
  if (table === 'cggb') {
    companyName = r.name || '—';
  } else if (table === 'tobacco_board') {
    companyName = r.location ? `Tobacco Board (${r.location})` : 'Tobacco Board';
  } else if (table === 'nregs') {
    companyName = r.computer_operator_name ? `Computer Operator: ${r.computer_operator_name}` : 'NREGS Office';
  } else if (table === 'eb_contacts') {
    companyName = r.enterprise_name || '—';
  } else {
    companyName = r.customer_name || '—';
  }

  // 2. Lookup Contact details in customersList
  const nameClean = companyName.trim().toLowerCase();
  const match = customersList.find(c => (c.company_name || '').trim().toLowerCase() === nameClean);

  if (match) {
    location = match.location || '—';
    contactName = match.contact_name || '—';
    designation = match.designation || '—';
    contactNo = match.contact_no || '—';
    mailId = match.mail_id || '—';
  } else {
    // Fallback/Default values for contact info from table
    if (table === 'ill_data') {
      location = r.billing_ssa || '—';
      contactNo = r.phone_no || '—';
      mailId = r.email_address || '—';
    } else if (table === 'cggb') {
      location = r.oa || '—';
      contactNo = r.field_incharge_number || '—';
    } else if (table === 'tobacco_board') {
      location = r.ba_name ? `${r.ba_name} (${r.circle || '—'})` : (r.circle || '—');
      contactNo = r.contact_no || '—';
    } else if (table === 'nregs') {
      location = r.mandal ? `${r.mandal}, ${r.district || '—'}` : (r.district || '—');
      contactNo = r.contact_no || '—';
    } else if (table === 'ftth_data') {
      location = r.area || '—';
      contactNo = r.phone_no || '—';
      mailId = r.email_address || '—';
    } else if (table === 'eb_contacts') {
      location = r.circle ? `${r.circle} (${r.ba_name || '—'})` : (r.ba_name || '—');
      contactName = r.name || '—';
      designation = r.designation || '—';
      contactNo = r.mobile || '—';
      mailId = r.mail_id || '—';
    } else if (['pri_data', 'sip_data', 'mmvc_data', 'mpls_data', 'nmect_data', 'toll_free'].includes(table)) {
      contactNo = r.telephone_no || '—';
    }
  }

  // 3. Resolve technical service details
  if (table === 'ill_data') {
    const parsed = parseAddressForExport(r.address);
    serviceType = isDOJ ? 'DOJ' : (isCollector ? 'Collectorates' : (isNHM ? 'NHM' : 'Internet Leased Line (ILL)'));
    plan = r.bandwidth || '—';
    circuitId = r.lc_id || '—';
    billingAccountNo = r.billing_account_no || '—';
    dateOfCommission = (r.service_start_date && r.service_start_date !== 'NULL') ? r.service_start_date : parsed.dateOfCommission;
    address = parsed.address;
    wanIp = parsed.wanIp;
  } else if (table === 'pri_data') {
    const parsed = parseAddressForExport(r.address);
    serviceType = 'ISDN PRI';
    plan = r.pri_plan || '—';
    circuitId = r.telephone_no || '—';
    billingAccountNo = r.billing_account_no || '—';
    address = parsed.address;
    wanIp = parsed.wanIp;
    dateOfCommission = parsed.dateOfCommission;
  } else if (table === 'sip_data') {
    const parsed = parseAddressForExport(r.address);
    serviceType = 'SIP Trunk';
    plan = r.sip_plan || '—';
    circuitId = r.telephone_no || '—';
    billingAccountNo = r.billing_account_no || '—';
    address = parsed.address;
    wanIp = parsed.wanIp;
    dateOfCommission = parsed.dateOfCommission;
  } else if (table === 'mmvc_data') {
    const parsed = parseAddressForExport(r.address);
    serviceType = 'MMVC';
    plan = r.mmv_plan || '—';
    circuitId = r.telephone_no || '—';
    billingAccountNo = r.billing_account_no || '—';
    address = parsed.address;
    wanIp = parsed.wanIp;
    dateOfCommission = parsed.dateOfCommission;
  } else if (table === 'mpls_data') {
    const parsed = parseAddressForExport(r.address);
    serviceType = 'MPLS VPN';
    plan = r.bandwidth || '—';
    circuitId = r.telephone_no || '—';
    billingAccountNo = r.billing_account_no || '—';
    address = parsed.address;
    wanIp = parsed.wanIp;
    dateOfCommission = parsed.dateOfCommission;
  } else if (table === 'nmect_data') {
    const parsed = parseAddressForExport(r.address);
    serviceType = 'NMECT';
    plan = r.nmect_plan || r.bandwidth || '—';
    circuitId = r.telephone_no || '—';
    billingAccountNo = r.billing_account_no || '—';
    address = parsed.address;
    wanIp = parsed.wanIp;
    dateOfCommission = parsed.dateOfCommission;
  } else if (table === 'cggb') {
    serviceType = 'CGGB';
    plan = r.bandwidth || '—';
    circuitId = r.circuit_id || '—';
    billingAccountNo = r.billing_account || '—';
    wanIp = r.wan_ip || '—';
    address = r.oa || '—';
  } else if (table === 'tobacco_board') {
    serviceType = 'Tobacco Board';
    plan = r.bandwidth || '—';
    circuitId = r.lc_id || '—';
    billingAccountNo = r.billing_account || '—';
  } else if (table === 'nregs') {
    serviceType = 'NREGS';
    plan = r.bbm_no ? `BBM: ${r.bbm_no}` : (r.tip_no ? `TIP: ${r.tip_no}` : '—');
    circuitId = r.telephone_no || '—';
  } else if (table === 'ftth_data') {
    serviceType = 'FTTH';
    plan = r.ftth_plan || '—';
    circuitId = r.ont_id || r.phone_no || '—';
    billingAccountNo = r.billing_account_no || '—';
    dateOfCommission = r.service_start_date || '—';
    address = r.address || '—';
  } else if (table === 'toll_free') {
    const parsed = parseAddressForExport(r.address);
    serviceType = isElection ? 'Election Commission (Toll Free)' : 'Toll Free';
    circuitId = r.telephone_no || '—';
    billingAccountNo = r.billing_account_no || '—';
    address = parsed.address;
    wanIp = parsed.wanIp;
    dateOfCommission = parsed.dateOfCommission;
  } else if (table === 'eb_contacts') {
    serviceType = r.service_type || '—';
  }

  return {
    "#": index + 1,
    "Company Name": companyName,
    "Location": location,
    "Contact Name": contactName,
    "Designation": designation,
    "Contact No": contactNo,
    "Mail ID": mailId,
    "Service Type": serviceType,
    "Bandwidth / Plan": plan,
    "Circuit ID": circuitId,
    "Billing Account No": billingAccountNo,
    "Date of Commission": dateOfCommission,
    "Installation Address": address,
    "WAN IP Address": wanIp
  };
};

/**
 * Downloads a service's data from Supabase and exports it to Excel.
 * @param {string} serviceName - The service type or name (e.g. "ILL CCTs", "NREGS")
 */
export const downloadServiceExcel = async (serviceName) => {
  const { table, isDOJ, isElection, isCollector, isNHM } = getServiceTableInfo(serviceName);
  if (!table) {
    alert(`Unknown service type: ${serviceName}`);
    return;
  }

  try {
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
      query = query.eq('service_type', serviceName);
    }

    const [serviceRes, custRes] = await Promise.all([
      query.order('id', { ascending: true }),
      supabase.from('customers_data').select('*')
    ]);

    if (serviceRes.error) {
      throw serviceRes.error;
    }

    const serviceData = serviceRes.data || [];
    const customersList = custRes.data || [];

    if (serviceData.length === 0) {
      alert(`No records found for ${serviceName}`);
      return;
    }

    const formattedData = serviceData.map((r, index) => 
      mapServiceRow(r, table, isDOJ, isCollector, isNHM, isElection, customersList, index)
    );
    
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, serviceName);
    
    // Auto-fit column widths
    const maxLens = {};
    formattedData.forEach(row => {
      Object.keys(row).forEach(key => {
        const valStr = String(row[key]);
        maxLens[key] = Math.max(maxLens[key] || key.length, valStr.length);
      });
    });
    worksheet['!cols'] = Object.keys(maxLens).map(key => ({
      wch: Math.min(maxLens[key] + 3, 50) // Cap max width at 50 to avoid extra wide columns
    }));

    XLSX.writeFile(workbook, `${serviceName.replace(/\s+/g, '_')}_data.xlsx`);
  } catch (err) {
    console.error(`Error exporting ${serviceName} data:`, err);
    alert(`Error exporting data: ${err.message}`);
  }
};
