import Web3 from 'web3';
import { TETHER_USD_ABI } from './ABI/TETHER_USD_ABI';
import { ForbiddenException } from '@nestjs/common';

class Contract {
  private web3: Web3;
  private contractAddress: string;
  private contractFactor: number;

  constructor(web3: Web3, contractAddress: string, contractFactor: number) {
    this.web3 = web3;
    this.contractAddress = contractAddress;
    this.contractFactor = contractFactor;
  }
  public async getBalance(walletAddress: string): Promise<number> {
    try {
      const tetherContract = new this.web3.eth.Contract(
        TETHER_USD_ABI,
        this.contractAddress,
      );

      const balance = await tetherContract.methods
        // tenho que usar o @ts-ignore pois o TS está incorrendo em erro de tipagem
        // @ts-ignore
        .balanceOf(walletAddress)
        .call({ from: walletAddress });

      return Number((Number(balance) / this.contractFactor).toFixed(2));
    } catch (error) {
      throw new ForbiddenException(`An Error Occoured: ${error.message}`);
    }
  }

  public async sendTokens(
    addressFrom: string,
    addressTo: string,
    amount: number,
    contractFactor: number,
    privateKey: string,
  ): Promise<string> {
    try {
      const tetherContract = new this.web3.eth.Contract(
        TETHER_USD_ABI,
        this.contractAddress,
      );
      const decimalAmount = amount * contractFactor;

      const transactionData = tetherContract.methods
        // tenho que usar o @ts-ignore pois o TS está incorrendo em erro de tipagem
        // @ts-ignore
        .transfer(addressTo, decimalAmount)
        .encodeABI();

      const gasPrice = await this.web3.eth.getGasPrice();
      const gasEstimate = await tetherContract.methods
        // tenho que usar o @ts-ignore pois o TS está incorrendo em erro de tipagem
        // @ts-ignore
        .transfer(addressTo, decimalAmount)
        .estimateGas({ from: addressFrom });

      const transactionObject = {
        from: addressFrom,
        to: tetherContract.options.address,
        data: transactionData,
        gas: gasEstimate,
        gasPrice: gasPrice,
      };

      const signedTransaction = await this.web3.eth.accounts.signTransaction(
        transactionObject,
        privateKey, // Inserir a chave privada da carteira que está enviando os tokens
      );

      const transaction = await this.web3.eth.sendSignedTransaction(
        signedTransaction.rawTransaction,
      );

      console.log('Transaction hash:', transaction.transactionHash);
      return String(transaction.transactionHash);
    } catch (error) {
      console.log(error);
      throw new ForbiddenException(`An Error Occurred: ${error.message}`);
    }
  }
}

export default Contract;
