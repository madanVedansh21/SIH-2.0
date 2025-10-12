declare namespace Models {
  interface User { id: string; name: string; email: string; role?: string; createdAt?: string }
  interface Transformer { id: string; name: string; location?: string; capacityMVA?: number; installationDate?: string; metadata?: any; owner: string }
  interface Test { id: string; transformer: string; filename?: string; originalName?: string; uploadPath?: string; fileType?: string; testDate?: string; status?: string; analysisSummary?: any; rawData?: any }
  // Alert model removed
}
