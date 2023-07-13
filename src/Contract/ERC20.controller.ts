import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../Guard/AuthGuard.guard';
import Contract from './ERC20.service';
import {
  RequestContract,
  RequestContractSendToken,
  ResponseContract,
  ResponseContractSendToken,
} from './types/types';
import Web3 from 'web3';
import { Web3Service } from './ERC20.loader';
import Crypto from '../Guard/Crypto.service';
@Controller('balance')
@UseGuards(AuthGuard)
export class ContractController {
  public web3: Web3;

  constructor(private crypto: Crypto) {
    const service = new Web3Service();
    this.web3 = service.getWeb3Instance();
  }

  @Get('total')
  async getContractBalance(
    @Req() request: RequestContract,
  ): Promise<ResponseContract> {
    const contractAddress = request.body.contractAddress;
    const contractFactor = request.body.contractFactor;
    const contract = new Contract(this.web3, contractAddress, contractFactor);
    const address = request.body.address;
    const name = request.body.name;

    const balance = await contract.getBalance(address);
    return {
      name: name,
      value: balance,
    };
  }

  @Get('send')
  async sendToken(
    @Req() request: RequestContractSendToken,
  ): Promise<ResponseContractSendToken> {
    const name = request.body.name;
    const contractAddress = request.body.contractAddress;
    const contractFactor = request.body.contractFactor;
    const contract = new Contract(this.web3, contractAddress, contractFactor);
    const addressFrom = request.body.addressFrom;
    const addressTo = request.body.addressTo;
    const amount = request.body.amount;
    const privateKey = this.crypto.decrypt(request.body.privateKey);

    const txHash = await contract.sendTokens(
      addressFrom,
      addressTo,
      amount,
      contractFactor,
      privateKey,
    );
    return {
      name: name,
      value: amount,
      addressFrom: addressFrom,
      addressTo: addressTo,
      txHash: txHash,
    };
  }
}
