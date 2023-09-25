const hre = require("hardhat");
const {
  encryptDataField,
  decryptNodeResponse,
} = require("@swisstronik/swisstronik.js");
const {address} = require("../deployments/swisstronik/SwissToken.json")

/**
 * Send a shielded transaction to the Swisstronik blockchain.
 *
 * @param {object} signer - The signer object for sending the transaction.
 * @param {string} destination - The address of the contract to interact with.
 * @param {string} data - Encoded data for the transaction.
 * @param {number} value - Amount of value to send with the transaction.
 *
 * @returns {Promise} - The transaction object.
 */
const sendShieldedQuery = async (provider, destination, data) => {
  // Obtain the RPC link from the network configuration
  const rpcLink = hre.network.config.url;

  // Encrypt the call data using SwisstronikJS's encryption function
  const [encryptedData, usedEncryptionKey] = await encryptDataField(
    rpcLink,
    data
  );

  // Execute the query/call using the provider
  const response = await provider.call({
    to: destination,
    data: encryptedData,
  });

  // Decrypt the response using SwisstronikJS's decryption function
  return await decryptNodeResponse(rpcLink, response, usedEncryptionKey);
};

const sendShieldedTransaction = async (signer, destination, data, value) => {
  // Get the RPC link from the Hardhat network configuration
  const rpcLink = hre.network.config.url;

  // Encrypt transaction data
  const [encryptedData] = await encryptDataField(rpcLink, data);

  // Construct and sign the transaction with encrypted data
  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

const sendTransaction = async (signer) => {

  const contract = await ethers.getContractAt(
    "SwissToken",
    address,
    signer
  );

  //Send a shielded transaction to execute a transaction in the contract
  const functionName = "mint";
  const functionArgs = [signer.address, hre.ethers.parseEther("100")];
  const transaction = await sendShieldedTransaction(
    signer,
    address,
    contract.interface.encodeFunctionData(functionName, functionArgs),
    0
  );

  await transaction.wait();

  // It should return a TransactionResponse object
  console.log("Transaction Response: ", transaction);
};

async function main() {
  // Get the signer (your account)
  const [signer] = await hre.ethers.getSigners();
  await sendTransaction(signer);
}

module.exports = {
  sendTransaction,
  sendShieldedTransaction,
  sendShieldedQuery,
};
// Using async/await pattern to handle errors properly
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
