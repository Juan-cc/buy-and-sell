// Contract to be tested
var ChainList = artifacts.require("./ChainList.sol");

// Test suite
contract('ChainList', function(accounts){

  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName = "article 1";
  var articleDescription = "Description for article 1";
  var articlePrice = 10;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;
  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;

  // Test case: check initial values
  it("should be initialized with empty values", function() {
      return ChainList.deployed().then(function(instance){
        return instance.getArticle.call();
      }).then(function(data) {
        assert.equal(data[0], 0x0, "seller must be empty");
        assert.equal(data[1], 0x0, "buyer must be empty");
        assert.equal(data[2], '', "article name must be empty");
        assert.equal(data[3], '', "description must be empty");
        assert.equal(data[4].toNumber(), 0, "article price must be zero");
      });

    });

  it("should sell an article", function () {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.sellArticle (articleName,
      articleDescription, web3.toWei(articlePrice, "ether"), {from:
        seller});

    }).then(function() {
      return chainListInstance.getArticle.call();
    }).then(function(data) {
      assert.equal(data[0], seller, "seller must be " + seller);
      assert.equal(data[1], 0x0, "buyer must be empty");
      assert.equal(data[2], articleName, "article name must be " + articleName);
      assert.equal(data[3], articleDescription, "article description mus be " + articleDescription);
      assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));

    });

  });

  // Test case: should check events
  it("should trigger an event when a new article is sold", function() {
      return ChainList.deployed().then(function(instance) {
          chainListInstance = instance;
          watcher = chainListInstance.sellArticleEvent();
          return chainListInstance.sellArticle(
              articleName,
              articleDescription,
              web3.toWei(articlePrice, "ether"), {
                  from:seller
              }
          );
      }).then(function (receipt) {
          assert.equal(receipt.logs.length, 1, "should have a received one event");
          assert.equal(receipt.logs[0].args.aSeller, seller, "seller must be " + seller);
          assert.equal(receipt.logs[0].args.aName, articleName, "article name must be " + articleName);
          assert.equal(receipt.logs[0].args.aPrice.toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
      });
  });

  // Test case: buy an article
  it("should buy an article", function(){
      return ChainList.deployed().then(function (instance) {
          chainListInstance = instance;

          // record balances of seller and buyer before the buy
          sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller),"ether").toNumber();
          buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

          return chainListInstance.buyArticle({
              from:buyer,
              value: web3.toWei(articlePrice, "ether")
          });

     // )
 }).then(function(receipt) {
     assert.equal(receipt.logs.length, 1, "one event should have been triggered");
     assert.equal(receipt.logs[0].event, "buyArticleEvent", "event shoudl be buyArticleEvent");
     assert.equal(receipt.logs[0].args.aSeller, seller, "event seller must be " + seller);
     assert.equal(receipt.logs[0].args.aBuyer, buyer, "event buyer must be " + buyer);
     assert.equal(receipt.logs[0].args.aName, articleName, "event articleName must be "+ articleName);
     assert.equal(receipt.logs[0].args.aPrice.toNumber(), web3.toWei(articlePrice, "ether"),
        "event article price muust be " + web3.toWei(articlePrice, "ether"));

    // record balances of buyer and seller after buy
    sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller),"ether").toNumber();
    buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

    assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice, "seller should have earned " + articlePrice + "ETH");
    assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice, "buyer should have spent " + articlePrice + "ETH");
    
    return chainListInstance.getArticle.call();
    }).then(function (data) {
        assert.equal(data[0], seller, "seller must be " + seller);
        assert.equal(data[1], buyer, "buyer must be " + buyer);
        assert.equal(data[2], articleName, "article name must be " + articleName);
        assert.equal(data[3], articleDescription, "article description must be " + articleDescription);
        assert.equal(data[4].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
    });

});
});
