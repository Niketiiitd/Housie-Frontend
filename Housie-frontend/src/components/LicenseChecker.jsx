// src/components/LicenseChecker.jsx
import { useEffect, useState } from 'react';

function LicenseChecker({ children }) {
  const [licenseStatus, setLicenseStatus] = useState({
    valid: false,
    error: null,
    data: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check license on mount
  useEffect(() => {
    async function checkLicense() {
      const result = await window.api.getLicense();
      setLicenseStatus(result);
    }
    checkLicense();
  }, []);

  // Handle loading a new license file
  const handleLoadLicense = async () => {
    setIsLoading(true);
    const result = await window.api.loadLicenseFile();
    setLicenseStatus({
      valid: result.ok,
      data: result.data,
      error: result.error,
    });
    setIsLoading(false);
  };

  // Show license prompt if invalid or missing
  if (!licenseStatus.valid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">License Required</h1>
          <p className="text-center text-gray-600 mb-6">
            {licenseStatus.error || 'Please load a valid license file to continue.'}
          </p>
          <button
            onClick={handleLoadLicense}
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-lg text-white ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Loading...' : 'Load License File'}
          </button>
        </div>
      </div>
    );
  }

  // Render children (routes) if license is valid
  return (
    <div>
      {/* Optional: Removed "License for" line */}
      {children}
    </div>
  );
}

export default LicenseChecker;