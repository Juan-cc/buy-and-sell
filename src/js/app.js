App = {
  web3Provider: null,
  contracts: {},
  account : 0x0,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
      // Initialize web3 and set the privider to the testRPC.
      if (typeof web3 !== 'undefined'){
        App.web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
      } else {
        //set the provider you want from Web3.providers
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        web3 = new Web3(App.web3Provider);
      }
      App.displayAccountInfo();
      return App.initContract();
  },

  displayAccountInfo: function(){
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#account").text(account);
        web3.eth.getBalance(account, function (err, balance){
          if (err === null) {
            $("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH");
          }
        });
      }
    });
  },

  initContract: function(){
    $.getJSON('ChainList.json', function(chainListArtifact) {
      // Get the necessary contract aftifact file and use it to instantiate a truffle contract absraction.
      App.contracts.ChainList = TruffleContract(chainListArtifact);
      // Set the provider for our contract.
      App.contracts.ChainList.setProvider(App.web3Provider);

      //Listen to events
      App.listenToEvents();

      return App.reloadArticles();
    });
  },

  reloadArticles: function() {
    // refresh account info because the balance may've changed
    App.displayAccountInfo();

    App.contracts.ChainList.deployed().then(function(instance) {
      return instance.getArticle.call();
    }).then(function(article) {
      if (article[0] == 0x0) {
        // no article to display
        return;
      }

      // retrieve and claar the arcicle placeholder
      var articlesRow = $('#articlesRow');
      articlesRow.empty();

      // retrieve and fill hte art template
      var articleTemplate = $('#articleTemplate');
      articleTemplate.find('.panel-title').text(article[1]);
      articleTemplate.find('.article-description').text(article[2]);
      articleTemplate.find('.article-price').text(web3.fromWei(article[3], "ether"));

      var seller = article[0];
      if (seller == App.account) {
        seller = "You";
      }

      articleTemplate.find('.article-seller').text(seller);

      // add this new articles
      articlesRow.append(articleTemplate.html());

    }).catch(function(err) {
      console.log(err.message);
    });
  },

  sellArticle: function(){
    // retrieve details of the articles
    var anArticleName = $("#article_name").val();
    var aDescription = $("#article_description").val();
    var aPrice = web3.toWei(parseInt($("#article_price").val() || 0), "ether");

    if ((anArticleName.trim() == '') || (aPrice == 0)) {
      // nothing to sell
      return false;
    }

    App.contracts.ChainList.deployed().then(function(instance) {
      return instance.sellArticle(anArticleName, aDescription, aPrice, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {
      App.reloadArticles();
    }).catch(function(err) {
      console.error(err);
    });
  },

  // Listen to events raised from the contract
  listenToEvents: function(){
      //alert(App.contracts.ChainList.deployed());
      App.contracts.ChainList.deployed().then(function(instance) {
          instance.sellArticleEvent({}, {
              fromBlock: 0,
              toBlock: 'latest'
          }).watch(function(error, event) {
              $("#events").append('<li class="list-group-item">' + event.args.aName + ' is for sale' + '</li>');
              App.reloadArticles();

              //)
          });
      });
  },


};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
