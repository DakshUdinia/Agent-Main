export declare class AIProvider {
    private clients;
    private currentClientIndex;
    private memoryManager;
    constructor(apiKeysString: string);
    private getClient;
    private rotateKey;
    generateResponse(userId: string, platform: string, message: string): Promise<string>;
}
//# sourceMappingURL=AIProvider.d.ts.map