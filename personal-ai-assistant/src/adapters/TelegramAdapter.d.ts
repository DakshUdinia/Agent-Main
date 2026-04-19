import { BaseAdapter } from './BaseAdapter';
export declare class TelegramAdapter extends BaseAdapter {
    name: string;
    private bot;
    constructor(token: string);
    start(): Promise<void>;
    sendMessage(recipientId: string, text: string): Promise<void>;
}
//# sourceMappingURL=TelegramAdapter.d.ts.map