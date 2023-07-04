export interface RequestContract {
  body: {
    name: string;
    address: string;
    contractAddress: string;
    contractFactor: number;
  };
}

export interface ResponseContract {
  name: string;
  value: number;
}
