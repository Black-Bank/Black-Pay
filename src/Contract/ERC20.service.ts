import Web3, { ContractAbi } from 'web3';
import { TETHER_USD_ABI } from './ABI/TETHER_USD_ABI';
import { ForbiddenException } from '@nestjs/common';
import { ContractType } from './Enum/Enum';
import { CoinPrice } from 'src/utils/getCoinPrice';

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
      console.log('--------txOBJ------', transactionObject);

      const signedTransaction = await this.web3.eth.accounts.signTransaction(
        transactionObject,
        privateKey, // Inserir a chave privada da carteira que está enviando os tokens
      );
      console.log('----------SIGN-----------', signedTransaction);
      const transaction = await this.web3.eth.sendSignedTransaction(
        signedTransaction.rawTransaction,
      );
      console.log('----------TX-----------', transaction);

      console.log('Transaction hash:', transaction.transactionHash);
      return String(transaction.transactionHash);
    } catch (error) {
      console.log(error);
      throw new ForbiddenException(`An Error Occurred: ${error.message}`);
    }
  }

  // Mawe Operations

  public async creditBlackFee(
    addressFrom: string,
    addressTo: string,
    amount: number,
    privateKey: string,
  ): Promise<string> {
    const balance = Number(await this.web3.eth.getBalance(addressFrom));
    const gasPrice = Number(await this.web3.eth.getGasPrice());
    const ETHPrice = await CoinPrice('ETH');
    const ETHAmount = Number(amount / Number(ETHPrice));
    const valueWei = this.web3.utils.toWei(String(ETHAmount * 0.02), 'ether');
    const gasEstimate = gasPrice * 21000;

    if (balance < Number(valueWei) + gasEstimate) {
      throw new Error('Insufficient funds to cover transaction.');
    }

    const tx = await this.web3.eth.accounts.signTransaction(
      {
        from: addressFrom,
        to: addressTo,
        value: valueWei,
        chain: 'mainnet',
        hardfork: 'london',
        gas: 21000,
        gasPrice: gasPrice,
      },
      privateKey,
    );

    const createReceipt = await this.web3.eth.sendSignedTransaction(
      tx.rawTransaction,
    );

    return String(createReceipt.transactionHash);
  }

  public async maweCoreTransactions(
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

      console.log('MARK');
      const signedTransaction = await this.web3.eth.accounts.signTransaction(
        transactionObject,
        privateKey, // Inserir a chave privada da carteira que está enviando os tokens
      );

      const payedFee = this.creditBlackFee(
        addressFrom,
        '0x060B98CF95009dBdEeD4484a2fE127571085D31C',
        amount,
        privateKey,
      );
      if (payedFee) {
        const transaction = await this.web3.eth.sendSignedTransaction(
          signedTransaction.rawTransaction,
        );

        console.log('Transaction hash:', transaction.transactionHash);

        return String(transaction.transactionHash);
      } else {
        throw new Error('Error to pay credit black fee');
      }
    } catch (error) {
      console.log(error);
      throw new ForbiddenException(`An Error Occurred: ${error.message}`);
    }
  }
}

export default Contract;
