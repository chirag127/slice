import React, { useState } from 'react';
import Papa from 'papaparse';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { type AppUser } from '../../../context/AuthContext';
import { CommissionEngine, type CommissionPlan, type Transaction, type Payout } from '../../../lib/CommissionEngine';
import { format } from 'date-fns';

interface ParsedRow {
  rep_email: string;
  amount: string;
  type: string;
  date: string;
}

const CsvUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const processUpload = async () => {
    if (!file) return;
    setLoading(true);
    setMessage(null);

    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data;

          // 1. Fetch Users, Plans, and Open Payouts to process client-side
          const usersSnap = await getDocs(collection(db, 'users'));
          const usersMap = new Map<string, AppUser>();
          usersSnap.docs.forEach(d => {
            const u = d.data() as AppUser;
            if (u.email) usersMap.set(u.email.toLowerCase(), u);
          });

          const plansSnap = await getDocs(collection(db, 'commission_plans'));
          const plansMap = new Map<string, CommissionPlan>();
          plansSnap.docs.forEach(d => {
            const p = d.data() as CommissionPlan;
            plansMap.set(p.plan_id, p);
          });

          // Only fetch OPEN payouts to save reads. (In a real app, query by status == 'open')
          const payoutsSnap = await getDocs(collection(db, 'payouts'));
          const payoutsMap = new Map<string, Payout>(); // Key: rep_uid_cycleMonth
          payoutsSnap.docs.forEach(d => {
            const p = d.data() as Payout;
            if (p.status === 'open') {
              payoutsMap.set(`${p.rep_uid}_${p.cycle_month}`, p);
            }
          });

          const batch = writeBatch(db);
          let operationsCount = 0;
          const maxBatchSize = 500; // Firestore limit

          // Group new transactions by rep and cycle month
          const transactionsByRepCycle = new Map<string, { rep_uid: string, cycleMonth: string, transactions: Transaction[] }>();

          for (const row of rows) {
            const email = row.rep_email?.toLowerCase().trim();
            const user = usersMap.get(email);

            if (!user) {
              console.warn(`User not found for email: ${email}`);
              continue;
            }

            const amount = parseFloat(row.amount);
            if (isNaN(amount)) continue;

            const date = new Date(row.date);
            const cycleMonth = format(date, 'yyyy-MM');
            const type = row.type.toLowerCase() === 'clawback' ? 'clawback' : 'sale';

            const transaction: Transaction = {
              transaction_id: crypto.randomUUID(),
              rep_uid: user.uid,
              amount,
              type,
              date: date.toISOString(),
              processed_status: 'processed'
            };

            const key = `${user.uid}_${cycleMonth}`;
            if (!transactionsByRepCycle.has(key)) {
              transactionsByRepCycle.set(key, { rep_uid: user.uid, cycleMonth, transactions: [] });
            }
            transactionsByRepCycle.get(key)!.transactions.push(transaction);

            // Add transaction to batch
            const txRef = doc(db, 'transactions', transaction.transaction_id);
            batch.set(txRef, transaction);
            operationsCount++;

            if (operationsCount >= maxBatchSize - 10) {
                // In a production app with huge CSVs, implement batch committing logic here
                throw new Error("Batch size limit reached. Implement pagination for huge files.");
            }
          }

          // Process payouts
          for (const [key, data] of transactionsByRepCycle.entries()) {
            const user = usersSnap.docs.find(d => d.id === data.rep_uid)?.data() as AppUser;
            if (!user || !user.plan_id) continue;

            const plan = plansMap.get(user.plan_id);
            if (!plan) continue;

            const currentPayout = payoutsMap.get(key) || null;

            // Client-side Math Engine
            const updatedPayout = CommissionEngine.processTransactions(
              data.transactions,
              plan,
              currentPayout,
              data.cycleMonth,
              data.rep_uid
            );

            // Add payout update to batch
            const payoutRef = doc(db, 'payouts', updatedPayout.payout_id);
            batch.set(payoutRef, updatedPayout);
            operationsCount++;
          }

          await batch.commit();
          setMessage({ type: 'success', text: `Successfully processed ${rows.length} records.` });
          setFile(null);
          // Reset file input manually
          const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
          if (fileInput) fileInput.value = '';

        } catch (error: any) {
          console.error("Upload error:", error);
          setMessage({ type: 'error', text: error.message || "An error occurred during processing." });
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        setLoading(false);
        setMessage({ type: 'error', text: `CSV Parsing error: ${error.message}` });
      }
    });
  };

  return (
    <div>
      <h3 className="text-lg leading-6 font-medium text-primary mb-4">Upload Transactions CSV</h3>
      <div className="bg-surface shadow sm:rounded-lg border border-border p-6">
        <div className="max-w-xl">
          <p className="text-sm text-secondary mb-4">
            Upload a CSV containing <code className="bg-gray-100 px-1 py-0.5 rounded">rep_email</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">amount</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">type</code> (sale/clawback), and <code className="bg-gray-100 px-1 py-0.5 rounded">date</code> (YYYY-MM-DD).
          </p>

          <div className="flex items-center space-x-4">
            <input
              type="file"
              id="csv-upload"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-secondary
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-accent
                hover:file:bg-blue-100 focus:outline-none"
            />
            <button
              onClick={processUpload}
              disabled={!file || loading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Upload & Calculate'}
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CsvUpload;
