export enum QueryKey {
  PendingTransactions = 'pendingTransactions',
  Transactions = 'transactions',
  Address = 'address',
  Nonce = 'nonce',
  Threshold = 'threshold',
  IsDeployed = 'isDeployed',
  Owners = 'owners',
  SafeInfo = 'safeInfo'
}

export enum MutationKey {
  SendTransaction = 'sendTransaction',
  ConfirmTransaction = 'confirmTransaction',
  UpdateThreshold = 'updateThreshold',
  AddOwner = 'addOwner',
  RemoveOwner = 'removeOwner'
}
