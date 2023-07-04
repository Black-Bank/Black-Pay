import { Test, TestingModule } from '@nestjs/testing';
import { ContractController } from './ERC20.controller';
import { AuthGuard } from '../Guard/AuthGuard.guard';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { ForbiddenException } from '@nestjs/common';

const dotenvPath = path.resolve(__dirname, '..', '..', '.env');
dotenv.config({ path: dotenvPath });

class ContractMock {
  async getBalance(): Promise<number> {
    // Mock the balance value
    const mockBalance = 100;
    return Promise.resolve(mockBalance);
  }
}

class Web3ServiceMock {
  getWeb3Instance(): any {
    // Mock the web3 instance
    return {}; // Return an empty object or your desired web3 mock
  }
}

describe('ContractController', () => {
  let controller: ContractController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractController],
      providers: [
        {
          provide: 'Contract',
          useClass: ContractMock, // Use the mock class
        },
        {
          provide: 'Web3Service',
          useClass: Web3ServiceMock, // Use the mock class
        },
      ],
    })
      .overrideGuard(AuthGuard) // Mock do AuthGuard
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ContractController>(ContractController);
  });

  describe('getContractBalance', () => {
    it('should return the contract balance', async () => {
      const walletAddress = '0x38EA452219524Bb87e18dE1C24D3bB59510BD783'; // Random Tether USD Wallet Address
      const contractAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'; // Tether USD Contract Address
      const request = {
        body: {
          address: walletAddress,
          name: 'USD Tether',
          contractAddress: contractAddress,
          contractFactor: 1000000,
        },
      };

      const response = await controller.getContractBalance(request);

      expect(response.name).toBe('USD Tether');
      expect(response.value).toBeGreaterThanOrEqual(0);
    });
    it('should throw ForbiddenException for invalid contract address', async () => {
      const walletAddress = '0x38EA452219524Bb87e18dE1C24D3bB59510BD783'; // Random Tether USD Wallet Address
      const contractAddress = '0xdac17f958d2ee523a2asasc13d831ec7'; // invalid Tether USD Contract Address
      const request = {
        body: {
          address: walletAddress,
          name: 'USD Tether',
          contractAddress: contractAddress,
          contractFactor: 1000000,
        },
      };

      const testFunc = async () => {
        await controller.getContractBalance(request);
      };

      expect(testFunc).rejects.toThrow(ForbiddenException);
      expect(testFunc).rejects.toThrow(
        `An Error Occoured: Invalid value given "${contractAddress}". Error: invalid ethereum address.`,
      );
    });
    it('should throw ForbiddenException for invalid wallet address', async () => {
      const walletAddress = '0x38EA45224Bb87e18dE1C24D3bB5a510BD783'; // Random invalid Tether USD Wallet Address
      const contractAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'; // Tether USD Contract Address
      const request = {
        body: {
          address: walletAddress,
          name: 'USD Tether',
          contractAddress: contractAddress,
          contractFactor: 1000000,
        },
      };

      const testFunc = async () => {
        await controller.getContractBalance(request);
      };

      expect(testFunc).rejects.toThrow(ForbiddenException);
      expect(testFunc).rejects.toThrow(
        `An Error Occoured: Web3 validator found 1 error[s]:
value "${walletAddress}" at \"/0\" must pass \"address\" validation`,
      );
    });
  });
});
