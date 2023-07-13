import Web3 from 'web3';

export class Web3Service {
  getWeb3Instance(): Web3 {
    const provider = new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER);
    const web3 = new Web3(provider);
    return web3;
  }
}
