import Web3 from 'web3';
import { TETHER_USD_ABI } from './ABI/TETHER_USD_ABI';
import { ForbiddenException } from '@nestjs/common';

class Contract {
  private web3: Web3;
  constructor() {
    const provider = new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER);
    this.web3 = new Web3(provider);
  }
  public async getBalance(
    walletAddress: string,
    contractAddress: string,
    contractFactor: number,
  ): Promise<number> {
    try {
      const tetherContract = new this.web3.eth.Contract(
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
      throw new ForbiddenException(`An Error Occoured: ${error.message}`);
    }
  }
}

export default Contract;
