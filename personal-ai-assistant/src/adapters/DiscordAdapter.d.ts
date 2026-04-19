import { BaseAdapter } from './BaseAdapter';
export declare class DiscordAdapter extends BaseAdapter {
    name: string;
    private client;
    constructor(token: string);
    start(): Promise<void>;
    sendMessage(recipientId: string, text: string): Promise<void>;
}
//# sourceMappingURL=DiscordAdapter.d.ts.map