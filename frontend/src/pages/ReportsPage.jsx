import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FiTrash2 } from 'react-icons/fi';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

  const handleRemove = async (interviewId) => {
    try {
      const previewRes = await fetch(`${apiBase}/admin/interview/${interviewId}`, { method: 'DELETE' });
      const preview = await previewRes.json();
      if (!previewRes.ok) throw new Error(preview.error || 'Preview failed');

      const confirmMsg = `This will delete interview '${preview.interview?.candidateName || interviewId}' and ${preview.counts.events} events and ${preview.counts.reports} reports. Proceed?`;
      if (!confirm(confirmMsg)) return;

      const delRes = await fetch(`${apiBase}/admin/interview/${interviewId}?confirm=true`, { method: 'DELETE' });
      const del = await delRes.json();
      if (!delRes.ok) throw new Error(del.error || 'Delete failed');

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
        <div className="animate-pulse space-y-4 max-w-full rounded-lg shadow-lg bg-white p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-10 rounded-md bg-gray-300 ${i % 2 === 0 ? "opacity-90" : "opacity-70"}`} />
          ))}
        </div>
      ) : error ? (
        <p className="text-center text-red-600 text-lg mt-12 select-none">Error loading reports: {error}</p>
      ) : reports.length === 0 ? (
        <p className="text-center text-gray-600 text-lg mt-12 select-none">No reports available.</p>
      ) : (
        <div className="overflow-hidden rounded-lg shadow-lg bg-white">
          {/* Table for medium+ screens */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  {["Candidate", "Email", "Duration", "Integrity Score", "Created", "Action"].map((header) => (
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
                    className={`text-gray-800 text-sm lg:text-base ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-teal-50 transition-colors duration-200`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">{report.candidateName}</td>
                    <td className="px-4 py-3 whitespace-nowrap break-all">{report.candidateEmail}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{report.duration} sec</td>
                    <td className="px-4 py-3 whitespace-nowrap">{report.integrityScore}%</td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(report.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        {/* Open report page */}
                        <Link
                          to={`/report/${report.interviewId || report._id}`}
                          className="inline-flex items-center px-3 py-2 rounded-lg font-medium text-teal-700 bg-teal-100 hover:bg-teal-200"
                        >
                          Open
                        </Link>

                        {report.interviewVideoUrl && (
                          <button
                            onClick={() => setPreviewVideoUrl(report.interviewVideoUrl)}
                            className="inline-flex items-center px-3 py-2 rounded-lg font-medium text-blue-700 bg-blue-100 hover:bg-blue-200"
                          >
                            Open Video
                          </button>
                        )}

                        <button
                          onClick={() => handleRemove(report.interviewId || report._id)}
                          className="inline-flex items-center px-3 py-2 rounded-lg font-medium text-red-700 bg-red-100 hover:bg-red-200"
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
                <p className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleString()}</p>

                <Link
                  to={`/report/${report.interviewId || report._id}`}
                  className="mt-2 inline-flex justify-center items-center px-3 py-2 rounded-lg font-medium text-teal-700 bg-teal-100 hover:bg-teal-200"
                >
                  Open Report
                </Link>

                {report.interviewVideoUrl && (
                  <button
                    onClick={() => setPreviewVideoUrl(report.interviewVideoUrl)}
                    className="mt-2 inline-flex justify-center items-center px-3 py-2 rounded-lg font-medium text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    Open Video
                  </button>
                )}

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

      {previewVideoUrl && (
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
      )}
    </div>
  );
}
