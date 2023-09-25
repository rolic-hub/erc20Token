

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log(
    "----------------------------------------------------------------------------"
  );

  await deploy("SwissToken", {
    from: deployer,
   // args: "0x",
    log: true,
  });

  log(
    "----------------------------------deployed swiss token contract ---------------------------"
  );
};

module.exports.tags = ["all"]