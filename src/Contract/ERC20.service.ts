import Web3 from 'web3';
import { TETHER_USD_ABI } from './ABI/TETHER_USD_ABI';

// Inicialize o provedor Ethereum (por exemplo, Infura)
const provider = new Web3.providers.HttpProvider(
  'https://mainnet.infura.io/v3/7a667ca0597c4320986d601e8cac6a0a',
);

// Crie uma instância do objeto Web3
const web3 = new Web3(provider);

class Contract {
  public async getBalance(
    walletAddress: string,
    contractAddress: string,
    contractFactor: number,
  ): Promise<number> {
    try {
      const tetherContract = new web3.eth.Contract(
        TETHER_USD_ABI,
        contractAddress,
      );

      const balance = await tetherContract.methods
        // tenho que usar o @ts-ignore pois o TS está incorrendo em erro de tipagem
        // @ts-ignore
        .balanceOf(walletAddress)
        .call({ from: walletAddress });

      return Number((Number(balance) / contractFactor).toFixed(2));
    } catch (error) {
      console.error('Erro ao obter o saldo Tether:', error);
      throw error;
    }
  }
}

export default Contract;
