// Contract to be tested
var ChainList = artifacts.require("./ChainList.sol");

// Test suite
contract('ChainList', function(accounts) {
    var chainListInstance;
    var seller = accounts[1];
    var buyer = accounts[2];
    var articleName = "article 1";
    var articleDescription = "My description for article 1";
    var articlePrice = 10;

    // Test case: no article for sale so far
    it("should throw an exception if you try to buy an article when there is no article for sale", function() {
        return ChainList.deployed().then(function(instance) {
            chainListInstance = instance;
            return chainListInstance.buyArticle({
                from: buyer,
                value: web3.toWei(articlePrice, "ether")
            });
        }).then(assert.fail).catch(function(error) {
            // invalid opcode is not being the error message, I will debug later why I am getting a differente error: Error: VM Exception while processing transaction: revert
            assert(error.message.indexOf('revert') >= 0, "error should be invalid opcode");
        }).then(function () {
            return chainListInstance.getArticle.call();
        }).then(function(data){
            // make sure the contract state was not altered.
            assert.equal(data[0], 0x0, "seller must be empty");
            assert.equal(data[1], 0x0, "buyer must be empty");
            assert.equal(data[2], '', "article name must be empty");
            assert.equal(data[3], '', "article description must be empty");
            assert.equal(data[4].toNumber(), 0, "article price must be 0");
        });

    });

    // Test case: buying my own article - non-sense
    it("should throw an exception if you try to buy your own article", function() {
        return ChainList.deployed().then(function(instance) {
            chainListInstance = instance;
            return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), {
                from: seller
            });
        }).then(function(receipt) {
            return chainListInstance.buyArticle({
                from: seller,
                value: web3.toWei(articlePrice, "ether")
            });
        }).then(assert.fail)
        .catch(function(error) {
            // invalid opcode is not being the error message, I will debug later why I am getting a differente error: Error: VM Exception while processing transaction: revert
            assert(error.message.indexOf('revert') >= 0, "error should be invalid opcode");
        }).then(function () {
            return chainListInstance.getArticle.call();
        }).then(function(data){
            // make sure the contract state was not altered.
            assert.equal(data[0], seller, "seller must be " + seller);
            assert.equal(data[1], 0x0, "buyer must be empty");
            assert.equal(data[2], articleName, "article name must be " + articleName);
            assert.equal(data[3], articleDescription, "article description must be " + articleDescription);
            assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
        });
    });

    // Test case: buying article with not enough money
    it("should throw an exception if you pay less than article's price", function() {
        return ChainList.deployed().then(function(instance) {
            chainListInstance = instance;
            return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), {
                from: seller
            });
        }).then(function(receipt) {
            return chainListInstance.buyArticle({
                from: buyer,
                value: web3.toWei(articlePrice - 1, "ether")
            });
        }).then(assert.fail)
        .catch(function(error) {
            // invalid opcode is not being the error message, I will debug later why I am getting a differente error: Error: VM Exception while processing transaction: revert
            assert(error.message.indexOf('revert') >= 0, "error should be invalid opcode");
        }).then(function () {
            return chainListInstance.getArticle.call();
        }).then(function(data){
            // make sure the contract state was not altered.
            assert.equal(data[0], seller, "seller must be " + seller);
            assert.equal(data[1], 0x0, "buyer must be empty");
            assert.equal(data[2], articleName, "article name must be " + articleName);
            assert.equal(data[3], articleDescription, "article description must be " + articleDescription);
            assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
        });
    });


    // Test case: article already sold
    it("should throw an exception when buying an article already sold", function() {
        return ChainList.deployed().then(function(instance) {
            chainListInstance = instance;
            return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), {
                from: seller
            });
        }).then(function(receipt) {
            return chainListInstance.buyArticle({
                from: buyer,
                value: web3.toWei(articlePrice, "ether")
            });
        }).then(function(receipt) {
            return chainListInstance.buyArticle({
                from: web3.eth.accounts[0],
                value: web3.toWei(articlePrice, "ether")
            });
        }).then(assert.fail)
        .catch(function(error) {
            // invalid opcode is not being the error message, I will debug later why I am getting a differente error: Error: VM Exception while processing transaction: revert
            assert(error.message.indexOf('revert') >= 0, "error should be invalid opcode");
        }).then(function () {
            return chainListInstance.getArticle.call();
        }).then(function(data){
            // make sure the contract state was not altered.
            assert.equal(data[0], seller, "seller must be " + seller);
            assert.equal(data[1], buyer, "buyer must be " + buyer);
            assert.equal(data[2], articleName, "article name must be " + articleName);
            assert.equal(data[3], articleDescription, "article description must be " + articleDescription);
            assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
        });

    });
});
