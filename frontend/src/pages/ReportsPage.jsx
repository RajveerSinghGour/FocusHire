import { useEffect, useState } from "react";
import axios from "axios";
import { FiDownload } from "react-icons/fi";
import { FiTrash2 } from 'react-icons/fi';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Fetch all reports on load
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(`${apiBase}/reports`);
        setReports(res.data);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError(err?.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [apiBase]);

  // Handle download with loading state
  const handleDownload = async (id) => {
    setDownloadingId(id);
    try {
      // First fetch report metadata to see if reportFile is a remote URL
      const metaRes = await fetch(`${apiBase}/reports`);
      if (!metaRes.ok) throw new Error(`Failed to fetch report metadata: ${metaRes.status}`);
      const allReports = await metaRes.json();
      const report = allReports.find((r) => r._id === id);
      if (!report) throw new Error("Report metadata not found");

      // If the stored reportFile is a remote URL (Cloudinary or other), try to fetch it as a blob and force download.
      // If fetching fails (CORS or network), fall back to opening the URL in a new tab so the user can download manually.
      if (report.reportFile && typeof report.reportFile === "string" && report.reportFile.startsWith("http")) {
        try {
          const r = await fetch(report.reportFile);
          if (!r.ok) throw new Error(`Failed to fetch remote PDF: ${r.status}`);
          const remoteBlob = await r.blob();
          const remoteUrl = URL.createObjectURL(remoteBlob);
          const a = document.createElement("a");
          a.href = remoteUrl;
          a.download = `report-${id}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(remoteUrl);
          return;
        } catch (err) {
          console.warn("Could not fetch remote report file (CORS?). Falling back to opening URL:", err);
          const opened = window.open(report.reportFile, "_blank");
          if (!opened) throw new Error("Unable to open report URL in new tab. Please allow popups.");
          return;
        }
      }

      // Otherwise fetch the backend PDF endpoint as blob and force download
      const url = `${apiBase}/reports/${id}/pdf`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Failed to fetch PDF: ${resp.status}`);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `report-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading report:", err);
      alert("Failed to open report: " + (err?.message || err));
    } finally {
      setDownloadingId(null);
    }
  };

  // Remove interview data (preview then delete)
  const handleRemove = async (interviewId) => {
    try {
      // Preview deletion
      const previewRes = await fetch(`${apiBase}/admin/interview/${interviewId}`, { method: 'DELETE' });
      const preview = await previewRes.json();
      if (!previewRes.ok) throw new Error(preview.error || 'Preview failed');

      const confirmMsg = `This will delete interview '${preview.interview?.candidateName || interviewId}' and ${preview.counts.events} events and ${preview.counts.reports} reports. Proceed?`;
      if (!confirm(confirmMsg)) return;

      // Perform deletion
      const delRes = await fetch(`${apiBase}/admin/interview/${interviewId}?confirm=true`, { method: 'DELETE' });
      const del = await delRes.json();
      if (!delRes.ok) throw new Error(del.error || 'Delete failed');

      // Remove report from local state so it disappears from UI
      setReports((prev) => prev.filter((r) => r._id !== del.id && r.interviewId !== del.id));
      alert('Interview and related data deleted');
    } catch (err) {
      console.error('Error removing interview data:', err);
      alert('Failed to remove interview data: ' + (err.message || err));
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-tr from-teal-50 via-green-50 to-emerald-50 p-4 sm:p-8 lg:p-12 mt-10">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6 sm:mb-8 select-none drop-shadow-sm text-center sm:text-left">
        Candidate Reports
      </h1>

      {loading ? (
        // Skeleton loader
        <div className="animate-pulse space-y-4 max-w-full rounded-lg shadow-lg bg-white p-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-10 rounded-md bg-gray-300 ${
                i % 2 === 0 ? "opacity-90" : "opacity-70"
              }`}
            />
          ))}
        </div>
      ) : error ? (
        <p className="text-center text-red-600 text-lg mt-12 select-none">Error loading reports: {error}</p>
      ) : reports.length === 0 ? (
        <p className="text-center text-gray-600 text-lg mt-12 select-none">
          No reports available.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg shadow-lg bg-white">
          {/* Table for medium+ screens */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  {[
                    "Candidate",
                    "Email",
                    "Duration",
                    "Integrity Score",
                    "Created",
                    "Action",
                  ].map((header) => (
                    <th
                      key={header}
                      className="text-left text-gray-700 font-semibold px-4 py-3 select-none text-sm lg:text-base"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((report, idx) => (
                  <tr
                    key={report._id}
                    className={`text-gray-800 text-sm lg:text-base ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-teal-50 transition-colors duration-200`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">{report.candidateName}</td>
                    <td className="px-4 py-3 whitespace-nowrap break-all">{report.candidateEmail}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{report.duration} sec</td>
                    <td className="px-4 py-3 whitespace-nowrap">{report.integrityScore}%</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(report.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(report._id)}
                          disabled={downloadingId === report._id}
                        className={`inline-flex justify-center items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white shadow-md transition transform focus:outline-none focus:ring-4 focus:ring-teal-200 ${
                            downloadingId === report._id
                  ? "bg-teal-400 cursor-wait"
                    : "bg-teal-600 hover:bg-teal-700 active:scale-95"
                          }`}
                          aria-label={`Download PDF for ${report.candidateName}`}
                        >
                          {downloadingId === report._id ? (
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                              ></path>
                            </svg>
                          ) : (
                            <FiDownload className="h-5 w-5" />
                          )}
                          Download
                        </button>

                        {/* Direct open link: opens backend endpoint or remote URL in a new tab; useful when popup or blob write is blocked */}
                        <a
                          href={
                            report.reportFile && typeof report.reportFile === "string" && report.reportFile.startsWith("http")
                              ? report.reportFile
                              : `${apiBase}/reports/${report._id}/pdf`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 rounded-lg font-medium text-teal-700 bg-teal-100 hover:bg-teal-200"
                        >
                          Open
                        </a>
                        {/* Open Video link (if available) */}
                        {report.interviewVideoUrl ? (
                          <button
                            onClick={() => setPreviewVideoUrl(report.interviewVideoUrl)}
                            className="inline-flex items-center px-3 py-2 rounded-lg font-medium text-blue-700 bg-blue-100 hover:bg-blue-200"
                            title={`Preview video for ${report.candidateName}`}
                          >
                            Open Video
                          </button>
                        ) : null}
                        <button
                          onClick={() => handleRemove(report.interviewId || report._id)}
                          className="inline-flex items-center px-3 py-2 rounded-lg font-medium text-red-700 bg-red-100 hover:bg-red-200"
                          title="Remove interview and related data"
                        >
                          <FiTrash2 className="mr-1" /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card layout for mobile */}
          <div className="block md:hidden divide-y">
            {reports.map((report) => (
              <div key={report._id} className="p-4 flex flex-col gap-2">
                <p className="font-bold text-gray-800">{report.candidateName}</p>
                <p className="text-sm text-gray-600 break-all">{report.candidateEmail}</p>
                <p className="text-sm">{report.duration} sec</p>
                <p className="text-sm">{report.integrityScore}%</p>
                <p className="text-xs text-gray-500">
                  {new Date(report.createdAt).toLocaleString()}
                </p>
                <button
                  onClick={() => handleDownload(report._id)}
                  disabled={downloadingId === report._id}
                  className={`mt-2 w-full inline-flex justify-center items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white shadow-md transition transform focus:outline-none focus:ring-4 focus:ring-teal-200 ${
                    downloadingId === report._id
                      ? "bg-teal-400 cursor-wait"
                        : "bg-teal-600 hover:bg-teal-700 active:scale-95"
                  }`}
                >
                  {downloadingId === report._id ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                  ) : (
                    <FiDownload className="h-5 w-5" />
                  )}
                  Download PDF
                </button>
                <a
                  href={
                    report.reportFile && typeof report.reportFile === "string" && report.reportFile.startsWith("http")
                      ? report.reportFile
                      : `${apiBase}/reports/${report._id}/pdf`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex justify-center items-center px-3 py-2 rounded-lg font-medium text-teal-700 bg-teal-100 hover:bg-teal-200"
                >
                  Open
                </a>
                {report.interviewVideoUrl ? (
                  <button
                    onClick={() => setPreviewVideoUrl(report.interviewVideoUrl)}
                    className="mt-2 inline-flex justify-center items-center px-3 py-2 rounded-lg font-medium text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    Open Video
                  </button>
                ) : null}
                <button
                  onClick={() => handleRemove(report.interviewId || report._id)}
                  className="mt-2 inline-flex justify-center items-center px-3 py-2 rounded-lg font-medium text-red-700 bg-red-100 hover:bg-red-200"
                >
                  <FiTrash2 className="mr-1" /> Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video preview modal */}
      {previewVideoUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg overflow-hidden max-w-3xl w-full mx-4">
            <div className="flex justify-between items-center p-3 border-b">
              <h3 className="font-semibold">Video Preview</h3>
              <button
                onClick={() => setPreviewVideoUrl(null)}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
            <div className="p-4">
              <video controls className="w-full h-auto" src={previewVideoUrl}>
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
