const BASE_URL = "https://api.sparebank1.no/personal/banking/accounts";

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

export async function getAccounts(
  accessToken: string,
  tokenType: string,
): Promise<AccountsResponse> {
  const response = await fetch(BASE_URL, {
    headers: {
      Accept: "application/vnd.sparebank1.v1+json; charset=utf-8",
      Authorization: `${tokenType} ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch accounts: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<AccountsResponse>;
}
