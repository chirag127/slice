import { useState, useRef } from 'react';
import {
  FileUp,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Database
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, writeBatch, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { AuditEngine } from '../../lib/engine/AuditTrail';

export default function CSVImporter() {
  const { user: authUser } = useAuth();
  const [, setFile] = useState<File | null>(null);
  const [data, setData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const REQUIRED_FIELDS = ['repId', 'amount', 'date', 'type'];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileObj = e.target.files?.[0];
    if (!fileObj) return;

    setFile(fileObj);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').filter(r => r.trim()).map(row => row.split(','));
      if (rows.length === 0) return alert("Empty CSV file");

      const foundHeaders = rows[0].map(h => h.trim());
      const body = rows.slice(1).filter(r => r.length === foundHeaders.length);

      setHeaders(foundHeaders);
      setData(body);

      // Auto-map where possible
      const initialMapping: Record<string, string> = {};
      REQUIRED_FIELDS.forEach(field => {
        const found = foundHeaders.find(h => h.toLowerCase().includes(field.toLowerCase()));
        if (found) initialMapping[field] = found;
      });
      setMapping(initialMapping);
      setStep(2);
    };
    reader.readAsText(fileObj);
  }

  async function startImport() {
    setImporting(true);
    setError(null);
    try {
      const mappedData = data.map(row => {
        const t: Record<string, unknown> = {
          createdAt: serverTimestamp(),
          status: 'processed'
        };

        REQUIRED_FIELDS.forEach(field => {
          const colIndex = headers.indexOf(mapping[field]);
          let val: string | number = row[colIndex]?.trim();

          if (field === 'amount') val = parseFloat(val);
          if (field === 'date') val = new Date(val).toISOString();

          t[field] = val;
        });

        return t;
      });

      // Check for locked periods
      const involvedPeriods = Array.from(new Set(mappedData.map(t => (t['date'] as string).substring(0, 7))));
      for (const pId of involvedPeriods) {
        const pSnap = await getDoc(doc(db, 'periods', pId));
        if (pSnap.exists() && pSnap.data().status === 'locked') {
          setImporting(false);
          return setError(`The period ${pId} is locked. You cannot import transactions into a finalized month.`);
        }
      }

      const batch = writeBatch(db);
      const transactionsRef = collection(db, 'transactions');

      mappedData.forEach(t => {
        const newDocRef = doc(transactionsRef);
        batch.set(newDocRef, t);
      });

      await batch.commit();

      if (authUser) {
        await AuditEngine.log(
          'IMPORT_COMPLETED',
          { uid: authUser.uid, email: authUser.email || 'Admin' },
          `Imported ${data.length} transactions across ${involvedPeriods.join(', ')}.`,
          { count: data.length, periods: involvedPeriods }
        );
      }

      setStep(3);
    } catch (err) {
      console.error(err);
      setError("Import failed. Please check your date and amount formats.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-black font-inter">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-outfit">Transaction CSV Importer</h1>
        <p className="text-gray-500">Bulk upload your sales data with automated field mapping.</p>
      </div>

      {step === 1 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-3xl p-16 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
            <FileUp className="w-8 h-8" />
          </div>
          <p className="text-lg font-bold text-gray-900">Click to upload or drag CSV file</p>
          <p className="text-gray-500 text-sm">Suggested format: Date, RepID, Amount, Type</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Map Field Headers</h2>
              <div className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-500">Found {data.length} records</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {REQUIRED_FIELDS.map(field => (
                <div key={field}>
                  <label className="block text-sm font-bold text-gray-700 mb-2 capitalize">{field}</label>
                  <select
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    value={mapping[field] || ''}
                    onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                  >
                    <option value="">Select CSV Column</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-6 flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100 text-red-700">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={startImport}
                disabled={importing || !REQUIRED_FIELDS.every(f => mapping[f])}
                className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {importing ? 'Processing...' : 'Run Import'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white p-16 rounded-3xl border border-gray-200 shadow-xl flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 font-outfit">Import Successful!</h2>
          <p className="text-gray-500 max-w-sm mt-2">
            Imported {data.length} transactions into the system. High-performance browser engine is ready to recalculate payouts.
          </p>
          <div className="mt-10 flex gap-4">
            <button
              onClick={() => { setStep(1); setFile(null); }}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Done
            </button>
            <button
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md cursor-pointer"
            >
              <Database className="w-4 h-4" />
              Recalculate Payouts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
