// Accounts

export type AccountOwner = {
  name: string;
  firstName: string;
  lastName: string;
  type: string;
  age: number;
  customerKey: string;
  ssnKey: string;
};

export type AccountProperties = {
  isTransferFromEnabled: boolean;
  isTransferToEnabled: boolean;
  isPaymentFromEnabled: boolean;
  isAllowedInAvtaleGiro: boolean;
  hasAccess: boolean;
  isBalancePreferred: boolean;
  isFlexiLoan: boolean;
  isCodebitorLoan: boolean;
  isSecurityBalance: boolean;
  isAksjesparekonto: boolean;
  isSavingsAccount: boolean;
  isBonusAccount: boolean;
  userHasRightOfDisposal: boolean;
  userHasRightOfAccess: boolean;
  isOwned: boolean;
  isWithdrawalsAllowed: boolean;
  isBlocked: boolean;
  isHidden: boolean;
  isBalanceUpdatedImmediatelyOnTransferTo: boolean;
  isDefaultPaymentAccount: boolean;
};

export type Account = {
  key: string;
  accountNumber: string;
  iban: string;
  name: string;
  description: string;
  balance: number;
  availableBalance: number;
  currencyCode: string;
  owner: AccountOwner;
  productType: string;
  type: string;
  productId: string;
  descriptionCode: string;
  accountProperties: AccountProperties;
};

export type AccountsResponse = {
  accounts: Account[];
  errors: unknown[];
};

// Transactions

export type MinnaService = {
  action: string;
  service: string;
  provider: string;
  serviceId: string;
  providerId: string;
};

export type TransactionCategory = {
  sub: string;
  main: string;
  subI18n: string;
  mainI18n: string;
  confidence: number;
};

export type TransactionMerchantIntermediary = {
  img: string;
  name: string;
  website: string;
};

export type TransactionMerchant = {
  id: string;
  img: string;
  name: string;
  address: string;
  country: string;
  logoImg: string;
  postcode: string;
  intermediary: TransactionMerchantIntermediary;
  streetNumber: string;
};

export type CreditCardIdentifiers = {
  nonUniqueId: string;
  partitionKey: string;
};

export type ClassificationInput = {
  id: string;
  mcc: string;
  date: number;
  text: string;
  type: string;
  amount: number;
};

export type Transaction = {
  id: string;
  mcc: string;
  date: number;
  amount: number;
  source: string;
  mccGroup: string;
  merchant: TransactionMerchant;
  typeCode: string;
  typeText: string;
  accountKey: string;
  detailsUrl: string;
  accountName: string;
  description: string;
  nonUniqueId: string;
  confidential: boolean;
  currencyCode: string;
  interestDate: number;
  kidOrMessage: string;
  accountNumber: number;
  bookingStatus: string;
  canShowDetails: boolean;
  currencyAmount: number;
  accountCurrency: string;
  paymentReference: string;
  remoteAccountName: string;
  cleanedDescription: string;
  classificationInput: ClassificationInput;
  fromCurrencyAccount: boolean;
  remoteAccountNumber: string;
  creditCardIdentifiers: CreditCardIdentifiers;
};

export type ClassifiedTransaction = {
  minna: MinnaService;
  recurring: boolean;
  categories: TransactionCategory[];
  transaction: Transaction;
  subscription: boolean;
};

export type ClassifiedTransactionsResponse = {
  errors: string | null;
  transactions: ClassifiedTransaction[];
};

export type ClassifiedTransactionsParams = {
  accountKeys: string[];
  fromDate: string;
  toDate: string;
  transactionSource: "ALL";
};

/** Transactions grouped by accountKey */
export type TransactionsByAccount = Record<string, ClassifiedTransaction[]>;
