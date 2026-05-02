import { useState, useRef } from "react";
import { Upload, X, FileText, CheckCircle, AlertCircle } from "lucide-react";
import adminApi from "../../services/adminApi";
import { motion, AnimatePresence } from "framer-motion";

export const CsvUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await adminApi.post("/upload-voters", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult({ success: true, data });
      if (onSuccess) onSuccess();
    } catch (error) {
      setResult({ 
        success: false, 
        error: error.response?.data?.error || "An error occurred during upload."
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" />
              Bulk Import Students
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {!result ? (
              <div className="space-y-6">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Format Requirements (CSV or Excel):</h3>
                  <ul className="list-disc pl-5 text-sm text-slate-400 space-y-1">
                    <li>Required columns: <code>Name</code>, <code>Email</code>, <code>ID Number</code></li>
                    <li>Default password <code>vote123</code> will be assigned.</li>
                    <li>Accounts are auto-approved.</li>
                  </ul>
                </div>

                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-700 hover:border-slate-500'}`}
                >
                  <input 
                    type="file" 
                    accept=".csv, .xlsx" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  
                  {file ? (
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-indigo-400 mb-3" />
                      <p className="text-slate-200 font-medium">{file.name}</p>
                      <p className="text-slate-500 text-xs mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                      <button onClick={(e) => { e.stopPropagation(); reset(); }} className="mt-4 text-sm text-rose-400 hover:text-rose-300">
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-12 h-12 text-slate-500 mb-3" />
                      <p className="text-slate-300 font-medium">Click to select CSV or Excel file</p>
                      <p className="text-slate-500 text-sm mt-1">or drag and drop here</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {result.success ? (
                  <>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
                      <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-emerald-400">{result.data.message}</h3>
                    </div>
                    {result.data.errors?.length > 0 && (
                      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mt-4">
                        <h4 className="text-sm font-semibold text-rose-400 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Some rows failed:
                        </h4>
                        <ul className="text-xs text-rose-300/80 list-disc pl-5 max-h-32 overflow-y-auto">
                          {result.data.errors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-rose-400">Upload Failed</h3>
                    <p className="text-rose-300 text-sm mt-2">{result.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              {result ? "Close" : "Cancel"}
            </button>
            {!result && (
              <button 
                onClick={handleUpload}
                disabled={!file || loading}
                className="px-5 py-2.5 rounded-xl font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Import Voters"
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
