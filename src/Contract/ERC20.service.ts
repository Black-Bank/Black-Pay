import Web3, { ContractAbi } from 'web3';
import { TETHER_USD_ABI } from './ABI/TETHER_USD_ABI';
import { ForbiddenException } from '@nestjs/common';
import { ContractType } from './Enum/Enum';
import { setTimeout } from 'timers/promises';

class Contract {
  private web3: Web3;
  private contractAddress: string;
  private contractFactor: number;
  private contractAbi: ContractAbi;

  constructor(
    web3: Web3,
    contractAddress: string,
    contractFactor: number,
    contractType: string,
  ) {
    switch (contractType) {
      case ContractType.Dollar:
        this.contractAbi = TETHER_USD_ABI;
        break;

      default:
        this.contractAbi = TETHER_USD_ABI;
    }

    this.web3 = web3;
    this.contractAddress = contractAddress;
    this.contractFactor = contractFactor;
  }
  public async getBalance(walletAddress: string): Promise<number> {
    try {
      const tetherContract = new this.web3.eth.Contract(
        this.contractAbi,
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
        this.contractAbi,
        this.contractAddress,
      );
      const decimalAmount = amount * contractFactor;

      const transactionData = tetherContract.methods
        // tenho que usar o @ts-ignore pois o TS está incorrendo em erro de tipagem
        // @ts-ignore
        .transfer(addressTo, decimalAmount)
        .encodeABI();

      const gasPrice = await this.web3.eth.getGasPrice();
      const gasEstimate = 21596;

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
      console.log(error.message);
      throw new ForbiddenException(`An Error Occurred: ${error.message}`);
    }
  }

  // Mawe Operations
  public async maweCoreTransactions(
    addressFrom: string,
    addressTo: string,
    amount: number,
    contractFactor: number,
    privateKey: string,
  ): Promise<string> {
    const tetherContract = new this.web3.eth.Contract(
      this.contractAbi,
      this.contractAddress,
    );
    const decimalAmount = amount * contractFactor;

    const transactionData = tetherContract.methods
      //@ts-ignore
      .transfer(addressTo, decimalAmount)
      .encodeABI();

    const gasPrice = await this.web3.eth.getGasPrice();
    const gasEstimate = 50000;

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

    try {
      const transaction = await this.web3.eth.sendSignedTransaction(
        signedTransaction.rawTransaction,
      );

      console.log('Transaction hash:', transaction.transactionHash);

      // Calcular a taxa de 2% e enviar a transação de taxa após um atraso de 5 segundos.
      const taxAmount = decimalAmount * 0.02;
      const taxTransactionData = tetherContract.methods
        //@ts-ignore
        .transfer(process.env.CEDIT_FEE_ADDRESS, taxAmount)
        .encodeABI();

      const taxTransactionObject = {
        from: addressFrom,
        to: tetherContract.options.address,
        data: taxTransactionData,
        gas: gasEstimate,
        gasPrice: gasPrice,
      };

      const signedTaxTransaction = await this.web3.eth.accounts.signTransaction(
        taxTransactionObject,
        privateKey, // Inserir a chave privada da carteira que está enviando os tokens
      );

      await setTimeout(5000); // Aguardar 5 segundos antes de enviar a transação de taxa.

      const taxTransaction = await this.web3.eth.sendSignedTransaction(
        signedTaxTransaction.rawTransaction,
      );

      console.log('Transaction Fee hash:', taxTransaction.transactionHash);

      return String(transaction.transactionHash);
    } catch (error) {
      console.log('ERROR ----------------');
      console.log(error);
      console.log('ERROR ----------------');
    }
  }
}

export default Contract;
