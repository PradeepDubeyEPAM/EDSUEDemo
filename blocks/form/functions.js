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
 * Custom Submit Function
 * Overrides default submit, sends data to JCR Servlet, and updates the 'id' field.
 */
function submitAndSetId() {
  // 1. Get the Bridge (The connection to the Form Model)
  const bridge = window.guideBridge;

  if (!bridge) {
    console.error('AEM Forms GuideBridge not found.');
    return;
  }

  // 2. Validate the Form first
  const validationResult = bridge.validate();
  // In some versions, validate() returns a boolean or a promise.
  // If it returns an object with errors, check that.
  if (validationResult === false) {
    console.warn('Form validation failed.');
    return; // Stop if invalid
  }

  // 3. Get Data from the Model (XML or JSON)
  // We request JSON because our Servlet expects JSON
  const formData = bridge.getFormDataJson();

  try {
    // 4. Perform the Fetch to your Custom Servlet
    const response = fetch('/bin/saveFormToJcr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: formData, // bridge.getFormDataJson() returns a JSON string
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const result = response.json();

    // 5. Check success and Update the 'id' field in the Form
    if (result.status === 'success' && result.id) {
      // "id" is the name of the field in your Adaptive Form
      // We use the Bridge to update the value so the UI refreshes automatically
      bridge.setProperty(['id'], 'value', result.id);
      console.log('Form saved. ID updated to:', result.id);
      // Optional: Show success message
      alert('Submission Successful! Reference ID: ', result.id);
    } else {
      console.error('Server returned error:', result);
    }
  } catch (error) {
    console.error('Submission error:', error);
  }
}

// eslint-disable-next-line import/prefer-default-export
export {
  getFullName,
  days,
  submitFormArrayToString,
  submitAndSetId,
};
