import React, { useState, useEffect } from "react";
import { AlertTriangle, X, Server } from "lucide-react";
import { Button } from "./ui/button";

const BackendStatusNotification: React.FC = () => {
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean | null>(
    null,
  );
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch("http://localhost:5000/health", {
          method: "GET",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const available = response.ok;
        setIsBackendAvailable(available);

        // Only show notification if backend is not available
        if (!available) {
          setShowNotification(true);
        }
      } catch (error) {
        setIsBackendAvailable(false);
        setShowNotification(true);
      }
    };

    checkBackend();

    // Check every 30 seconds
    const interval = setInterval(checkBackend, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!showNotification || isBackendAvailable === null) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Server className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Demo Mode Active
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Backend server is not running. The app is running in demo mode
              with simulated data. To access full features, start the backend
              server.
            </p>
            <div className="mt-3 space-y-2">
              <p className="text-xs text-yellow-600">
                <strong>To start backend:</strong>
              </p>
              <code className="block bg-yellow-100 p-2 rounded text-xs text-yellow-800">
                cd backend && npm install && npm run dev
              </code>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotification(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendStatusNotification;
