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
  } else if (target.includes('toll')) {
    table = 'toll_free';
  }

  return { table, isDOJ, isElection, isCollector, isNHM };
};

export const mapServiceRow = (r, table, isDOJ, isCollector, isNHM, isElection) => {
  if (table === 'ill_data') {
    const displayServiceType = isDOJ ? 'DOJ' : (isCollector ? 'Collectorates' : (isNHM ? 'NHM' : 'Internet Leased Line (ILL)'));
    return {
      "ID": r.id,
      "Customer Name": r.customer_name || '—',
      "Circuit ID (LC ID)": r.lc_id || '—',
      "Bandwidth": r.bandwidth || '—',
      "Billing SSA": r.billing_ssa || '—',
      "Phone No": r.phone_no || '—',
      "Email Address": r.email_address || '—',
      "Billing Account No": r.billing_account_no || '—',
      "Service Start Date": r.service_start_date || '—',
      "Last Mile": r.last_mile || '—',
      "Installation Address": r.address || '—',
      "Service Category": displayServiceType
    };
  } else if (table === 'pri_data') {
    return {
      "ID": r.id,
      "Customer Name": r.customer_name || '—',
      "Telephone No": r.telephone_no || '—',
      "PRI Plan": r.pri_plan || '—',
      "Billing Account No": r.billing_account_no || '—',
      "Installation Address": r.address || '—',
      "Service Category": 'ISDN PRI'
    };
  } else if (table === 'sip_data') {
    return {
      "ID": r.id,
      "Customer Name": r.customer_name || '—',
      "Telephone No": r.telephone_no || '—',
      "SIP Plan": r.sip_plan || '—',
      "Billing Account No": r.billing_account_no || '—',
      "Installation Address": r.address || '—',
      "Service Category": 'SIP Trunk'
    };
  } else if (table === 'mmvc_data') {
    return {
      "ID": r.id,
      "Customer Name": r.customer_name || '—',
      "Telephone No": r.telephone_no || '—',
      "MMV Plan": r.mmv_plan || '—',
      "Billing Account No": r.billing_account_no || '—',
      "Installation Address": r.address || '—',
      "Service Category": 'MMVC'
    };
  } else if (table === 'mpls_data') {
    return {
      "ID": r.id,
      "Customer Name": r.customer_name || '—',
      "Telephone No": r.telephone_no || '—',
      "Bandwidth": r.bandwidth || '—',
      "Billing Account No": r.billing_account_no || '—',
      "Installation Address": r.address || '—',
      "Service Category": 'MPLS VPN'
    };
  } else if (table === 'nmect_data') {
    return {
      "ID": r.id,
      "Customer Name": r.customer_name || '—',
      "Telephone No": r.telephone_no || '—',
      "Bandwidth": r.bandwidth || '—',
      "NMECT Plan": r.nmect_plan || '—',
      "Billing Account No": r.billing_account_no || '—',
      "Installation Address": r.address || '—',
      "Service Category": 'NMECT'
    };
  } else if (table === 'cggb') {
    return {
      "ID": r.id,
      "Name": r.name || '—',
      "Circuit ID": r.circuit_id || '—',
      "Bandwidth": r.bandwidth || '—',
      "WAN IP": r.wan_ip || '—',
      "OA (Location)": r.oa || '—',
      "Field Incharge Name": r.field_incharge_name || '—',
      "Field Incharge Number": r.field_incharge_number || '—',
      "PCM Incharge Number": r.pcm_incharge_number || '—',
      "Billing Account": r.billing_account || '—',
      "Service Category": 'CGGB'
    };
  } else if (table === 'tobacco_board') {
    return {
      "ID": r.id,
      "Location": r.location || '—',
      "LC ID / Circuit ID": r.lc_id || '—',
      "CCT Rent Qly": r.cct_rent_qly || '—',
      "Bandwidth": r.bandwidth || '—',
      "Circle": r.circle || '—',
      "BA Name": r.ba_name || '—',
      "EB Incharge": r.eb_incharge || '—',
      "Contact No": r.contact_no || '—',
      "BBM Incharge": r.bbm_incharge || '—',
      "BBM Contact": r.bbm_contact || '—',
      "Billing Account": r.billing_account || '—',
      "Service Category": 'Tobacco Board'
    };
  } else if (table === 'nregs') {
    return {
      "ID": r.id,
      "District": r.district || '—',
      "Mandal": r.mandal || '—',
      "Telephone No": r.telephone_no || '—',
      "Computer Operator Name": r.computer_operator_name || '—',
      "Contact No": r.contact_no || '—',
      "DRP Contact No": r.drp_contact_no || '—',
      "BBM No": r.bbm_no || '—',
      "TIP No": r.tip_no || '—',
      "Service Category": 'NREGS'
    };
  } else if (table === 'toll_free') {
    const displayServiceType = isElection ? 'Election Commission (Toll Free)' : 'Toll Free';
    return {
      "ID": r.id,
      "Customer Name": r.customer_name || '—',
      "Telephone No": r.telephone_no || '—',
      "Billing Account No": r.billing_account_no || '—',
      "Installation Address": r.address || '—',
      "Service Category": displayServiceType
    };
  } else {
    return {
      "ID": r.id,
      "Company Name": r.company_name || '—',
      "Email ID": r.mail_id || '—',
      "Location": r.location || '—',
      "Contact Name": r.contact_name || '—',
      "Designation": r.designation || '—',
      "Contact No": r.contact_no || '—',
      "Service Category": 'General'
    };
  }
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
    }

    const { data, error } = await query.order('id', { ascending: true });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      alert(`No records found for ${serviceName}`);
      return;
    }

    const formattedData = data.map(r => mapServiceRow(r, table, isDOJ, isCollector, isNHM, isElection));
    
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
