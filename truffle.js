module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
      },
      rinkeby: {
        host: "localhost",
        port: 8545,
        network_id: 4, // Rinkeby default test network
        gas: 4700000 // Gas limit used for deploys
    }
  }
};
