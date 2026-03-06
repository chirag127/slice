import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type AuditEventType =
    | 'PERIOD_LOCKED'
    | 'PERIOD_UNLOCKED'
    | 'PAYOUT_GENERATED'
    | 'IMPORT_COMPLETED'
    | 'TRANSACTION_DELETED';

export interface AuditLog {
    type: AuditEventType;
    userId: string;
    userName: string;
    details: string;
    timestamp: any;
    metadata: Record<string, any>;
}

export class AuditEngine {
    static async log(type: AuditEventType, user: { uid: string, email: string }, details: string, metadata: Record<string, any> = {}) {
        try {
            await addDoc(collection(db, 'audit_logs'), {
                type,
                userId: user.uid,
                userName: user.email,
                details,
                metadata,
                timestamp: serverTimestamp()
            });
        } catch (err) {
            console.error("Failed to write audit log:", err);
        }
    }
}
