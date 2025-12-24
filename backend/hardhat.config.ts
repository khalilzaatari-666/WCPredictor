import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { HardhatRuntimeEnvironment } from "hardhat/types";


dotenv.config();

task("grant-minter", "Grants MINTER_ROLE to an address")
  .addParam("contract", "The contract address")
  .addParam("target", "The address to grant role to")
  .setAction(async (taskArgs: { contract: string; target: string }, hre: HardhatRuntimeEnvironment) => {
    const contract = await hre.ethers.getContractAt("PredictionNFT", taskArgs.contract);
    const MINTER_ROLE = await contract.MINTER_ROLE();
    console.log(`Granting MINTER_ROLE to ${taskArgs.target}...`);
    const tx = await contract.grantRole(MINTER_ROLE, taskArgs.target);
    await tx.wait();
    console.log("✅ Role granted successfully");
  });


const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Local development
    hardhat: {
      chainId: 31337,
    },

    // Polygon Amoy Testnet (recommended for testing)
    amoy: {
      url: process.env.RPC_URL || "",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 80002,
    },

    // Polygon Mainnet (production)
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 137,
    },
  },
  etherscan: {
    apiKey: {
      amoy: process.env.POLYGONSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "amoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};

export default config;
