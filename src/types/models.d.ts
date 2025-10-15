declare namespace Models {
  interface User { id: string; name: string; email: string; role?: string; createdAt?: string }
  interface Transformer {
    id: string;
    name: string;
    location?: string;
    capacityMVA?: number;
    installationDate?: string;
    metadata?: any;
    tests?: string[];
    owner: string;
  }
  interface Test {
    id: string;
    transformer: string;
    filename?: string;
    originalName?: string;
    uploadPath?: string;
    fileType?: string;
    testDate?: string;
    status?: "pending" | "processing" | "completed" | "failed";
    approved?: boolean;
    approvedBy?: string | null;
    approvedAt?: string | null;
    analysisSummary?: any;
    rawData?: any;
    aiResult?: any;
    mlRequestId?: string;
    mlResponse?: any;
    processedAt?: string;
    createdAt?: string;
  }
  // Alert model removed
}
