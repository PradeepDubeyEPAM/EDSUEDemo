/**
 * Get Full Name
 * @name getFullName Concats first name and last name
 * @param {string} firstname in Stringformat
 * @param {string} lastname in Stringformat
 * @return {string}
 */
function getFullName(firstname, lastname) {
  return `${firstname} ${lastname}`.trim();
}

/**
 * Custom submit function
 * @param {scope} globals
 */
function submitFormArrayToString(globals) {
  const data = globals.functions.exportData();
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data[key] = data[key].join(',');
    }
  });
  globals.functions.submitForm(data, true, 'application/json');
}

/**
 * Calculate the number of days between two dates.
 * @param {*} endDate
 * @param {*} startDate
 * @returns {number} returns the number of days between two dates
 */
function days(endDate, startDate) {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  // return zero if dates are valid
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const diffInMs = Math.abs(end.getTime() - start.getTime());
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

/**
 * Submits form data to the JCR servlet and updates the 'id' field with the response.
 * @name submitFormArrayToString
 * @param {object} globals The global context provided by AEM Forms
 */
function submitAndSetId(globals) {
  // 1. Get the current form data
  const data = globals.functions.exportData();
  // 2. Your existing logic: Convert Arrays to Strings
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data[key] = data[key].join(',');
    }
  });
  try {
    // 3. Send to Servlet using fetch (Replaces submitForm)
    // We use fetch so we can 'await' the response and read the new ID
    const response = fetch('/bin/saveFormToJcr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok: ', response.statusText);
    }
    // 4. Parse the JSON response
    const result = response.json();
    // 5. Update the 'id' field in the form
    if (result.status === 'success' && result.id) {
      // Find the field named "id" in the form structure
      const idField = globals.form.resolveNode('id');
      if (idField) {
        // Use globals.functions.setProperty to update the UI and Model
        globals.functions.setProperty(idField, 'value', result.id);
        console.log('Success: Form ID updated to', result.id);
      } else {
        console.warn('Warning: Field named not found in the form.');
      }
    } else {
      console.error('Server returned an error:', result);
    }
  } catch (error) {
    console.error('Submission failed:', error);
    // Optional: You could set an error message field here if you have one
    // const errField = globals.form.resolveNode('errorMsg');
    // if(errField) globals.functions.setProperty(errField, 'value',
    // "Submission failed. Try again.");
  }
}

// eslint-disable-next-line import/prefer-default-export
export {
  getFullName,
  days,
  submitFormArrayToString,
  submitAndSetId,
};
