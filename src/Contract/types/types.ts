export interface RequestContract {
  body: {
    name: string;
    address: string;
    contractAddress: string;
    contractFactor: number;
    contractType: string;
  };
}

export interface ResponseContract {
  name: string;
  value: number;
}

export interface RequestContractSendToken {
  body: {
    name: string;
    contractAddress: string;
    contractFactor: number;
    addressFrom: string;
    addressTo: string;
    amount: number;
    privateKey: string;
    contractType: string;
  };
}

export interface ResponseContractSendToken extends ResponseContract {
  addressFrom: string;
  addressTo: string;
  txHash: string;
}
