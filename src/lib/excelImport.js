import * as XLSX from 'xlsx';
import { supabase } from './supabase';
import { getServiceTableInfo } from './excelExport';

/**
 * Searches the row object case-insensitively and regardless of spaces/underscores/slashes
 * to extract a clean string value for any of the given list of key synonyms.
 * Returns null if the value is empty, a dash, or the literal string "null".
 */
export const getVal = (row, ...keys) => {
  for (const k of keys) {
    const clean = k.trim().toLowerCase().replace(/[\s_/]+/g, '');
    for (const rowKey of Object.keys(row)) {
      const rowClean = rowKey.trim().toLowerCase().replace(/[\s_/]+/g, '');
      if (rowClean === clean && row[rowKey] !== undefined && row[rowKey] !== null) {
        const val = String(row[rowKey]).trim();
        if (val !== '—' && val !== '-' && val !== '' && val.toLowerCase() !== 'null') {
          return val;
        }
      }
    }
  }
  return null;
};

/**
 * Normalizes an excel row into the specific columns needed for each BSNL service database table.
 */
export const prepareServiceRow = (row, serviceName) => {
  const { table } = getServiceTableInfo(serviceName);
  if (!table) return null;

  const companyName = getVal(row, "Company Name", "Enterprise Name", "Customer Name", "Name") || null;
  const location = getVal(row, "Location", "Circle", "District", "Mandal", "State") || null;
  const contactNo = getVal(row, "Contact No", "Contact Number", "Mobile", "Phone No", "Telephone No") || null;
  const mailId = getVal(row, "Mail ID", "Email", "Email ID") || null;
  const plan = getVal(row, "Bandwidth / Plan", "Plan", "Bandwidth") || null;
  const circuitId = getVal(row, "Circuit ID", "Circuit ID / Phone", "LC ID", "Telephone No") || null;
  const billingAccountNo = getVal(row, "Billing Account No", "Billing Account", "Billing Account Number") || null;
  const dateOfCommission = getVal(row, "Date of Commission", "Commission Date", "DOC", "Date of Commision") || null;
  const ipAddress = getVal(row, "WAN IP Address", "WAN IP", "IP Address") || null;
  const lastMile = getVal(row, "Last Mile") || null;

  let addressVal = getVal(row, "Installation Address", "Address", "Full Site Address") || null;
  if (ipAddress) {
    if (addressVal) {
      if (!addressVal.includes('(WAN IP:')) {
        addressVal += ` (WAN IP: ${ipAddress})`;
      }
    } else {
      addressVal = `(WAN IP: ${ipAddress})`;
    }
  }
  if (dateOfCommission) {
    if (addressVal) {
      if (!addressVal.includes('(DOC:')) {
        addressVal += ` (DOC: ${dateOfCommission})`;
      }
    } else {
      addressVal = `(DOC: ${dateOfCommission})`;
    }
  }

  if (table === 'ill_data') {
    return {
      lc_id: circuitId,
      billing_account_no: billingAccountNo,
      bandwidth: plan,
      customer_name: companyName,
      address: addressVal,
      email_address: mailId,
      phone_no: contactNo,
      billing_ssa: location,
      service_start_date: dateOfCommission,
      last_mile: lastMile
    };
  } else if (table === 'pri_data') {
    return {
      telephone_no: circuitId,
      billing_account_no: billingAccountNo,
      customer_name: companyName,
      address: addressVal,
      pri_plan: plan
    };
  } else if (table === 'sip_data') {
    return {
      telephone_no: circuitId,
      billing_account_no: billingAccountNo,
      customer_name: companyName,
      address: addressVal,
      sip_plan: plan
    };
  } else if (table === 'mmvc_data') {
    return {
      telephone_no: circuitId,
      billing_account_no: billingAccountNo,
      customer_name: companyName,
      address: addressVal,
      mmv_plan: plan
    };
  } else if (table === 'mpls_data') {
    return {
      billing_account_no: billingAccountNo,
      customer_name: companyName,
      address: addressVal,
      bandwidth: plan
    };
  } else if (table === 'nmect_data') {
    return {
      telephone_no: circuitId,
      billing_account_no: billingAccountNo,
      customer_name: companyName,
      address: addressVal,
      bandwidth: plan,
      nmect_plan: plan
    };
  } else if (table === 'cggb') {
    return {
      name: companyName,
      bandwidth: plan,
      circuit_id: circuitId,
      billing_account: billingAccountNo,
      wan_ip: ipAddress,
      oa: location || addressVal,
      field_incharge_name: getVal(row, "Contact Name", "Field Incharge Name") || null,
      field_incharge_number: contactNo
    };
  } else if (table === 'tobacco_board') {
    let rawLocation = companyName;
    if (rawLocation && rawLocation.startsWith("Tobacco Board")) {
      const match = rawLocation.match(/\(([^)]+)\)/);
      if (match) rawLocation = match[1];
    }
    return {
      location: rawLocation,
      bandwidth: plan,
      lc_id: circuitId,
      billing_account: billingAccountNo,
      circle: getVal(row, "Circle") || location || null,
      ba_name: getVal(row, "BA Name") || location || null,
      contact_no: contactNo,
      eb_incharge: getVal(row, "EB Incharge") || null,
      bbm_incharge: getVal(row, "BBM Incharge") || null,
      bbm_contact: getVal(row, "BBM Contact") || null
    };
  } else if (table === 'nregs') {
    return {
      computer_operator_name: getVal(row, "Contact Name", "Computer Operator Name") || null,
      mandal: getVal(row, "Mandal") || location || null,
      district: getVal(row, "District") || location || null,
      telephone_no: circuitId,
      contact_no: contactNo,
      bbm_no: plan && plan.includes("BBM:") ? plan.replace("BBM:", "").trim() : plan,
      tip_no: getVal(row, "TIP No") || null,
      drp_contact_no: getVal(row, "DRP Contact No") || null
    };
  } else if (table === 'toll_free') {
    return {
      customer_name: companyName,
      telephone_no: circuitId,
      billing_account_no: billingAccountNo,
      address: addressVal
    };
  } else if (table === 'eb_contacts') {
    return {
      circle: location || '—',
      designation: getVal(row, "Designation") || '—',
      name: getVal(row, "Contact Name", "Name", "Primary Contact Name") || companyName || '—',
      enterprise_name: companyName || '—',
      mobile: contactNo || '—',
      mail_id: mailId || '—',
      ba_name: getVal(row, "BA Name", "BA", "District") || '—',
      service_type: serviceName
    };
  }

  return null;
};

/**
 * Auxiliary function to provision details into a service table from an excel row dynamically.
 */
export const insertServiceRowFromExcel = async (row, serviceName) => {
  const { table } = getServiceTableInfo(serviceName);
  if (!table) return false;
  const serviceRow = prepareServiceRow(row, serviceName);
  if (!serviceRow) return false;
  const { error } = await supabase.from(table).insert([serviceRow]);
  if (error) {
    console.error(`Error inserting into ${table}:`, error.message, serviceRow);
    return false;
  }
  return true;
};

/**
 * Unified parser and database writer for BSNL Excel uploads.
 * 
 * @param {File} file - The file object from `<input type="file">`
 * @param {string} targetType - one of "customer_contacts", "eb_contacts", "service_users"
 * @param {string} serviceName - (Optional) The specific service category (e.g. "Internet Leased Line (ILL)")
 */
export const importExcelData = async (file, targetType, serviceName = '') => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        // defval: null parses blank Excel cells as null instead of omitting them
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

        if (jsonData.length === 0) {
          throw new Error("The uploaded Excel file has no rows.");
        }

        if (targetType === 'eb_contacts') {
          let successCount = 0;
          let failCount = 0;

          for (const row of jsonData) {
            const circle = getVal(row, "Circle", "Location", "State") || null;
            const designation = getVal(row, "Designation") || null;
            const name = getVal(row, "Name", "Contact Name", "Primary Contact Name") || null;
            const enterpriseName = getVal(row, "Enterprise Name", "Company Name") || null;
            const mobile = getVal(row, "Mobile", "Contact No", "Phone No", "Contact Number") || null;
            const mailId = getVal(row, "Mail ID", "Email", "Email ID") || null;
            const baName = getVal(row, "BA Name", "District", "Mandal", "Location") || null;
            const serviceType = getVal(row, "Service Type", "Service Category", "Service") || null;

            if (circle || designation || name || enterpriseName || mobile || mailId || baName || serviceType) {
              const { error } = await supabase.from('eb_contacts').insert([{
                circle,
                designation,
                name,
                enterprise_name: enterpriseName,
                mobile,
                mail_id: mailId,
                ba_name: baName,
                service_type: serviceType
              }]);
              if (error) {
                console.error("Error inserting eb contact row:", error.message, row);
                failCount++;
              } else {
                successCount++;
              }
            }
          }
          resolve({ count: successCount, failCount });

        } else if (targetType === 'customer_contacts') {
          let successCount = 0;
          let failCount = 0;
          let serviceCount = 0;

          for (const row of jsonData) {
            const companyName = getVal(row, "Company Name", "Enterprise Name", "Customer Name", "Name") || null;
            const location = getVal(row, "Location", "Circle", "District", "Mandal", "State") || null;
            const contactName = getVal(row, "Contact Name", "Name", "Primary Contact Name") || companyName;
            const designation = getVal(row, "Designation") || null;
            const contactNo = getVal(row, "Contact No", "Contact Number", "Mobile", "Phone No", "Telephone No") || null;
            const mailId = getVal(row, "Mail ID", "Email", "Email ID") || null;

            if (companyName || contactName || contactNo) {
              const { error: custError } = await supabase.from('customers_data').insert([{
                company_name: companyName,
                location,
                contact_name: contactName,
                designation,
                contact_no: contactNo,
                mail_id: mailId
              }]);

              if (custError) {
                console.error("Error inserting customer contact row:", custError.message, row);
                failCount++;
              } else {
                successCount++;

                // Also try to insert service connections if present in the same row
                const sType = getVal(row, "Service Type", "Service Category", "Service");
                const cId = getVal(row, "Circuit ID", "Circuit ID / Phone", "LC ID", "Telephone No");
                if (sType && cId) {
                  const success = await insertServiceRowFromExcel(row, sType);
                  if (success) serviceCount++;
                }
              }
            }
          }
          resolve({ count: successCount, failCount, serviceCount });

        } else if (targetType === 'service_users') {
          if (!serviceName) {
            throw new Error("Service name must be specified when importing service users.");
          }

          let insertedCount = 0;
          let failCount = 0;
          let customerInsertCount = 0;

          for (const row of jsonData) {
            const companyName = getVal(row, "Company Name", "Enterprise Name", "Customer Name", "Name", "computer_operator_name") || null;
            const location = getVal(row, "Location", "Circle", "District", "Mandal", "State", "billing_ssa") || null;
            const contactName = getVal(row, "Contact Name", "Name", "Field Incharge Name", "Computer Operator Name", "Primary Contact Name") || companyName;
            const designation = getVal(row, "Designation") || null;
            const contactNo = getVal(row, "Contact No", "Contact Number", "Mobile", "Phone No", "Telephone No", "field_incharge_number") || null;
            const mailId = getVal(row, "Mail ID", "Email", "Email ID", "email_address") || null;

            // 1. Check if we have enough customer data to register/ensure they exist
            if (companyName || contactName || contactNo) {
              let existingCustomer = null;
              if (companyName) {
                const { data: custData } = await supabase
                  .from('customers_data')
                  .select('id')
                  .eq('company_name', companyName)
                  .limit(1);
                if (custData && custData.length > 0) {
                  existingCustomer = custData[0];
                }
              }

              if (!existingCustomer) {
                const { error: custError } = await supabase.from('customers_data').insert([{
                  company_name: companyName,
                  location,
                  contact_name: contactName,
                  designation,
                  contact_no: contactNo,
                  mail_id: mailId
                }]);
                if (custError) {
                  console.error("Error ensuring customer exists:", custError.message, row);
                } else {
                  customerInsertCount++;
                }
              }
            }

            // 2. Prepare and insert service details
            const serviceRow = prepareServiceRow(row, serviceName);
            if (serviceRow) {
              const { table } = getServiceTableInfo(serviceName);
              if (table) {
                const { error: sErr } = await supabase.from(table).insert([serviceRow]);
                if (sErr) {
                  console.error(`Error inserting service row into ${table}:`, sErr.message, serviceRow);
                  failCount++;
                } else {
                  insertedCount++;
                }
              }
            }
          }

          resolve({ count: insertedCount, failCount, customerCount: customerInsertCount });
        } else {
          throw new Error("Invalid import target type: " + targetType);
        }
      } catch (err) {
        console.error("Error parsing/inserting excel data:", err);
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
