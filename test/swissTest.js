const hre = require("hardhat");
const { expect } = require("chai");
const { main, sendShieldedQuery } = require("../scripts/mint");
const { address } = require("../deployments/swisstronik/SwissToken.json");

describe("SwissToken", function () {
  let contract, owner, otherAccount;

  this.beforeEach(async () => {
    [owner] = await ethers.getSigners();
   

    contract = await ethers.getContractAt("SwissToken", address, owner);
  });

  const useShieldedQuery = async (functionName, functionArgs) => {
    const responseMessage = await sendShieldedQuery(
      owner.provider,
      address,
      contract.interface.encodeFunctionData(functionName, functionArgs)
    );
    return contract.interface.decodeFunctionResult(
      functionName,
      responseMessage
    )[0];
  };

  describe("Constructor", function () {
    it("checks the name of the token", async function () {
      const name = await useShieldedQuery("name", "");

      expect(name).equal("SWISSTOKEN");
    });

    it("checks the symbol of the token", async function () {
      const symbol = await useShieldedQuery("symbol", "");
      expect(symbol).equal("STK");
    });
  });

  describe("Mint Funtion", function () {
    it("should update user token balance after mint", async function () {
      const balance1 = await useShieldedQuery("balanceOf", [owner.address]);
      console.log("Initial balance", await balance1.toString());
      await main();
      const balance2 = await useShieldedQuery("balanceOf", [owner.address]);
      expect(balance1 + hre.ethers.parseEther("200")).equal(balance2);
    });
  });
});
