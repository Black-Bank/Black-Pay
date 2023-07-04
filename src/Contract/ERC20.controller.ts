import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../Guard/AuthGuard.guard';
import Contract from './ERC20.service';
import { RequestContract, ResponseContract } from './types/types';
import Web3 from 'web3';
import { Web3Service } from './ERC20.loader';

@Controller('balance')
@UseGuards(AuthGuard)
export class ContractController {
  public web3: Web3;

  constructor() {
    const service = new Web3Service();
    this.web3 = service.getWeb3Instance();
  }

  @Get()
  async getContractBalance(
    @Req() request: RequestContract,
  ): Promise<ResponseContract> {
    const contract = new Contract(this.web3);
    const address = request.body.address;
    const name = request.body.name;
    const contractAddress = request.body.contractAddress;
    const contractFactor = request.body.contractFactor;
    const balance = await contract.getBalance(
      address,
      contractAddress,
      contractFactor,
    );
    return {
      name: name,
      value: balance,
    };
  }
}
