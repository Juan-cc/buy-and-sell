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
    var articleId = 1;


    // Test case: getting articles for sale when no articles for sale yet
    it("should throw an exception if you try to get articles for sale when there is no article at all", function() {
        return ChainList.deployed().then(function(instance) {
            chainListInstance = instance;
            return chainListInstance.getArticlesForSale();
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, "error message must contain invalid opcode");
        })
    });

    // Test case: buying an article when no article for sale yet
    it("should throw an exception if you try to buy an article when there is no article for sale", function(){
        return ChainList.deployed().then(function(instance) {
            chainListInstance = instance;
            return chainListInstance.buyArticle(articleId, {
                from: buyer,
                value: web3.toWei(articlePrice, "ether")
            });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, "error message must contain invalid opcode");
        }).then(function() {
            return chainListInstance.getNumberOfArticles();
        }).then(function(data) {
            // make sure the contract state was not altered
            assert.equal(data.toNumber(), 0, "number of articles must be zero");
        });
    });

    // Test case: buying an article that does not exist
    it("should throw an exception if you try to buy ar article that does not exist", function() {
        return ChainList.deployed().then(function(instance) {
            chainListInstance = instance;
            return chainListInstance.sellArticle(articleName, articleDescription,
                web3.toWei(articlePrice, "ether"), {
                    from: seller
                });
        }).then(function(receipt) {
            return chainListInstance.buyArticle(2, {
                from: seller,
                value: web3.toWei(articlePrice, "ether")
            });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, "error message must contain invalid opcode");
        }).then(function() {
            return chainListInstance.articles(articleId);
        }).then(function(data) {
            assert.equal(data[0].toNumber(), articleId, "article id must be " + articleId);
            assert.equal(data[1], seller, "seller must be " + seller);
            assert.equal(data[2], 0x0, "buyer must be empty");
            assert.equal(data[3], articleName, "article name must be " + articleName);
            assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
            assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"),
                "article price must be " + web3.toWei(articlePrice, "ether"));
        });
    });


    // Test case: buying an article you are selling
    it("should throw an exception if you try to buy your own article", function() {
        return ChainList.deployed().then(function(instance) {
            chainListInstance = instance;
            // we will call the buyArticle method because we called the sellArticle in our previous test.
            // I dont like this test interdependency but it is what it is right now
            return chainListInstance.buyArticle(articleId, {
                from: seller,
                value: web3.toWei(articlePrice, "ether")
            });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, "error message must cointain invalid opcode");
        }).then(function(){
            return chainListInstance.articles(articleId);
        }).then(function(data) {
            // make sure the contract state was not altered
            assert.equal(data[0].toNumber(), articleId, "article id must be " + articleId);
            assert.equal(data[1], seller, "seller must be " + seller);
            assert.equal(data[2], 0x0, "buyer must be empty");
            assert.equal(data[3], articleName, "article name must be " + articleName);
            assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
            assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"),
                "article price must be " + web3.toWei(articlePrice, "ether"));
        })
    });

    // Test case: buying article for a value different than its price
    it("should throw an exception if you pay a different amount than the article's price", function() {
        return ChainList.deployed().then(function(instance) {
            chainListInstance = instance;
            // Again test interdependency, we sold an article before so then we sill call buyArticle directly.
            return chainListInstance.buyArticle(articleId, {
                from: buyer,
                value: web3.toWei(articlePrice + 1, "ether")
            });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, "error message must cointain invalid opcode");
        }).then(function(){
            return chainListInstance.articles(articleId);
        }).then(function(data) {
            // make sure the contract state was not altered
            assert.equal(data[0].toNumber(), articleId, "article id must be " + articleId);
            assert.equal(data[1], seller, "seller must be " + seller);
            assert.equal(data[2], 0x0, "buyer must be empty");
            assert.equal(data[3], articleName, "article name must be " + articleName);
            assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
            assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"),
                "article price must be " + web3.toWei(articlePrice, "ether"));
        });
    });


    // Test case: article has already been sold
    it("should throw an exception when buying an article already sold", function() {
        return ChainList.deployed().then(function(instance) {
            chainListInstance = instance;
            // Again test interdependency, we sold an article before so then we sill call buyArticle directly.
            return chainListInstance.buyArticle(articleId, {
                from: buyer,
                value: web3.toWei(articlePrice, "ether")
            });
        }).then(function () {
            return chainListInstance.buyArticle(articleId, {
                from: buyer,
                value: web3.toWei(articlePrice, "ether")
            });
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, "error message must cointain invalid opcode");
        }).then(function(){
            return chainListInstance.articles(articleId);
        }).then(function(data) {
            // make sure the contract state was not altered
            assert.equal(data[0].toNumber(), articleId, "article id must be " + articleId);
            assert.equal(data[1], seller, "seller must be " + seller);
            assert.equal(data[2], buyer, "buyer must be " + buyer);
            assert.equal(data[3], articleName, "article name must be " + articleName);
            assert.equal(data[4], articleDescription, "article description must be " + articleDescription);
            assert.equal(data[5].toNumber(), web3.toWei(articlePrice, "ether"),
                "article price must be " + web3.toWei(articlePrice, "ether"));
        });

    });
});
