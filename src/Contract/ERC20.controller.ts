import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/Guard/AuthGuard.guard';
import Contract from './ERC20.service';
import { RequestContract, ResponseContract } from './types/types';

@Controller('balance')
@UseGuards(AuthGuard)
export class ContractController {
  @Get()
  async findAll(@Req() request: RequestContract): Promise<ResponseContract> {
    const contract = new Contract();
    const address = request.body.address;
    const contractAddress = request.body.contractAddress;
    const contractFactor = request.body.contractFactor;
    const balance = await contract.getBalance(
      address,
      contractAddress,
      contractFactor,
    );
    return {
      name: 'cyro ',
      value: balance,
    };
  }
}
