import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

const OTPInput = ({ length = 6, onOTPComplete, isLoading = false }) => {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on component mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Allow only numeric input
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last character
    setOtp(newOtp);

    // Move to next input if current is filled
    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Call onComplete when all fields are filled
    if (newOtp.every(digit => digit !== "")) {
      onOTPComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    
    if (/^\d*$/.test(pastedData)) {
      const newOtp = Array(length).fill("");
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      
      // Focus last filled input or first empty input
      const lastFilledIndex = pastedData.length - 1;
      const focusIndex = lastFilledIndex < length - 1 ? lastFilledIndex + 1 : lastFilledIndex;
      inputRefs.current[focusIndex].focus();
      
      // Call onComplete if all fields are filled
      if (newOtp.every(digit => digit !== "")) {
        onOTPComplete(newOtp.join(""));
      }
    }
  };

  return (
    <div className="flex justify-center space-x-2 sm:space-x-3">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength="1"
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={isLoading}
          className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold rounded-lg focus:outline-none transition-colors border-2"
          style={{ 
            backgroundColor: 'var(--background)', 
            borderColor: 'var(--border)', 
            color: 'var(--text-primary)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          // Ensure minimum touch target size for mobile
          min="0"
          max="9"
        />
      ))}
      {isLoading && (
        <div className="flex items-center ml-2">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      )}
    </div>
  );
};

export default OTPInput;