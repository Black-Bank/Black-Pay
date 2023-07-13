import { Test, TestingModule } from '@nestjs/testing';
import { ContractController } from './ERC20.controller';
import { AuthGuard } from '../Guard/AuthGuard.guard';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { ForbiddenException } from '@nestjs/common';
import Crypto from '../Guard/Crypto.service';

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
        Crypto,
      ],
    })
      .overrideGuard(AuthGuard) // Mock do AuthGuard
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ContractController>(ContractController);
  });

  describe('Contract Test Service', () => {
    it('should return the contract balance', async () => {
      const walletAddress = '0x38EA452219524Bb87e18dE1C24D3bB59510BD783'; // Random Tether USD Wallet Address
      const contractAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'; // Tether USD Contract Address
      const request = {
        body: {
          address: walletAddress,
          name: 'USD Tether',
          contractAddress: contractAddress,
          contractFactor: 1000000,
          contractType: 'Dollar',
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
          contractType: 'Dollar',
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
          contractType: 'Dollar',
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

    it('should throw ForbiddenException if an error occurs during transaction sending, Wrong private Key', async () => {
      const request = {
        body: {
          name: 'dolar',
          addressFrom: '0xcCbCB62862BCDbD1327a91047e626dF7de411003',
          addressTo: '0x060B98CF95009dBdEeD4484a2fE127571085D31C',
          contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
          contractFactor: 1000000,
          amount: 1,
          privateKey:
            'Dga+BdasasZiT6VLacl0vdxhahdahmdjhahryzTAKZCuz8QTEVB2TTYyXTSCFMlakjdbadhalzso3Nf5EIljk=',
          contractType: 'Dollar',
        },
      };

      const testFunc = async () => {
        await controller.sendToken(request);
      };

      // Assert
      await expect(testFunc).rejects.toThrow(ForbiddenException);
    });
  });
});
