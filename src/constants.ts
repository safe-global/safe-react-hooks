export enum QueryKey {
  PendingTransactions = 'pendingTransactions',
  Transactions = 'transactions',
  Address = 'address',
  Nonce = 'nonce',
  Threshold = 'threshold',
  IsDeployed = 'isDeployed',
  Owners = 'owners',
  SafeInfo = 'safeInfo',
  SafeOperations = 'safeOperations',
  PendingSafeOperations = 'pendingSafeOperations',
}

export enum MutationKey {
  SendTransaction = 'sendTransaction',  
  ConfirmTransaction = 'confirmTransaction',  
  UpdateThreshold = 'updateThreshold',
  SwapOwner = 'swapOwner',
  AddOwner = 'addOwner',
  RemoveOwner = 'removeOwner',
  SendSafeOperation = 'sendSafeOperation',
  ConfirmSafeOperation = 'confirmSafeOperation'
}
