import { useState, useEffect } from "react";
import { setNetworkErrorHandler, retryFailedRequests } from "../../config/api";
import "./NetworkErrorModal.css";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner"

export default function NetworkErrorModal() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setNetworkErrorHandler(() => {
      setOpen(true);
      setStatus(null);
      setErrorMessage("لطفاً اینترنت خود را بررسی کنید");
    });

    const handleOnline = async () => {
      if (open) {
        setStatus("loading");
        setErrorMessage(<LoadingSpinner/>);
        const { successCount, errorCount, failedUrls } = await retryFailedRequests();
        if (errorCount === 0 && successCount > 0) {
          setOpen(false);
          setStatus("success");
          window.location.reload(); // رفرش صفحه پس از موفقیت
        } else {
          setStatus("error");
          setErrorMessage(
            errorCount > 0
              ? `تلاش مجدد برای ${errorCount} درخواست ناموفق بود: ${failedUrls.join(", ")}`
              : "خطایی رخ داد. لطفاً دوباره امتحان کنید."
          );
        }
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [open]);

  const handleRetry = () => {
    // رفرش مستقیم کل صفحه
    window.location.reload();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">اتصال شما برقرار نشد</h2>
        <p className="modal-text">{errorMessage}</p>

        <div className="modal-actions">
          <button
            onClick={handleRetry}
            className="modal-btn modal-btn-refresh"
            disabled={status === "loading"}
          >
            تازه سازی
          </button>
          <button
            onClick={() => setOpen(false)}
            className="modal-btn modal-btn-close"
            disabled={status === "loading"}
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}