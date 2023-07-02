export interface RequestContract {
  body: {
    address: string;
    contractAddress: string;
    contractFactor: number;
  };
}

export interface ResponseContract {
  name: string;
  value: number;
}
