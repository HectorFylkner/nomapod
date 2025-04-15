import React from 'react';

function PhoneInput({ phoneNumber, onPhoneChange, isPhoneValid, phoneHasInput }) {

  const handleChange = (event) => {
    onPhoneChange(event.target.value);
  };

  const showError = phoneHasInput && !isPhoneValid;

  return (
    <div className="phone-input-section">
      <label htmlFor="phone-number">Phone Number (for unlock code)</label>
      <input 
        type="tel" 
        id="phone-number" 
        name="phone-number"
        placeholder="07XXXXXXXX"
        required 
        pattern="07[0-9]{8}" 
        title="Enter a 10-digit Swedish mobile number starting with 07"
        inputMode="tel"
        value={phoneNumber}
        onChange={handleChange}
        className={showError ? 'input-error' : ''} // Apply error class conditionally
        aria-invalid={showError} // Accessibility improvement
        aria-describedby={showError ? "phone-error-msg" : undefined} // Link error message
      />
      <span className="phone-hint">Used only to send the unlock code.</span>
      <span 
        id="phone-error-msg" 
        className="phone-error-message" 
        role="alert" // Accessibility improvement
        style={{ display: showError ? 'block' : 'none' }} // Control visibility
      >
        Please enter a valid 10-digit number (e.g., 07XXXXXXXX).
      </span>
    </div>
  );
}

export default PhoneInput; 