const BASE_URL =
  "https://api.sparebank1.no/personal/banking/transactions/classified";

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

export async function getClassifiedTransactions(
  accessToken: string,
  tokenType: string,
  params: ClassifiedTransactionsParams,
): Promise<ClassifiedTransactionsResponse> {
  const query = new URLSearchParams();
  for (const key of params.accountKeys) {
    query.append("accountKey", key);
  }
  query.set("fromDate", params.fromDate);
  query.set("toDate", params.toDate);
  query.set("transactionSource", params.transactionSource);

  const response = await fetch(`${BASE_URL}?${query.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/vnd.sparebank1.v1+json; charset=utf-8",
      Authorization: `${tokenType} ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch classified transactions: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<ClassifiedTransactionsResponse>;
}

/** Groups a flat transactions array by transaction.accountKey */
export function groupTransactionsByAccount(
  transactions: ClassifiedTransaction[],
): TransactionsByAccount {
  return transactions.reduce<TransactionsByAccount>((acc, item) => {
    const key = item.transaction.accountKey;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}
