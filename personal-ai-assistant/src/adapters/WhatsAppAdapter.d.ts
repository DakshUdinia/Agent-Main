import { BaseAdapter } from './BaseAdapter';
export declare class WhatsAppAdapter extends BaseAdapter {
    name: string;
    private client;
    constructor();
    start(): Promise<void>;
    sendMessage(recipientId: string, text: string): Promise<void>;
}
//# sourceMappingURL=WhatsAppAdapter.d.ts.map