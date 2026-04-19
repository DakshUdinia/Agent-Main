export abstract class BaseAdapter {
  abstract name: string;
  abstract start(): Promise<void>;
  abstract sendMessage(recipientId: string, text: string): Promise<void>;
  
  protected onMessageReceived?: (userId: string, text: string) => Promise<string>;

  setMessageHandler(handler: (userId: string, text: string) => Promise<string>) {
    this.onMessageReceived = handler;
  }
}
