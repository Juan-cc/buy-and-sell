App = {
  web3Provider: null,
  contracts: {},
  account : 0x0,
  loading : false,

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
      // avoid reentry
      if (App.loading) {
          return;
      }
      App.loading = true;
    // refresh account info because the balance may've changed
    App.displayAccountInfo();

    var chainListInstance;

    App.contracts.ChainList.deployed().then(function(instance) {
        chainListInstance = instance;
      return chainListInstance.getArticlesForSale.call();
    }).then(function(articleIds) {
        // Retrieve and clear the article planceholder
        var articlesRow = $('#articlesRow');
        articlesRow.empty();

        for (var i = 0; i < articleIds.length; i++){
            var articleId = articleIds[i];
            chainListInstance.articles.call(articleId.toNumber()).then(function(article) {
                App.displayArticle(
                    article[0],
                    article[1], // note we are not sending article[2] as parameter to displayArticle()
                    article[3],
                    article[4],
                    article[5]
                );
            });
        }
        App.loading = false;
    }).catch(function(error) {
        console.log(error.message);
        App.loading = false;
    });
  },

  displayArticle: function(id, seller, name, description, price){
      // Retrieve the article placeholder
      var articleRow = $('#articlesRow');

      var etherPrice = web3.fromWei(price, "ether");

      // Retrieve and fill the article template
      var articleTemplate = $('#articleTemplate');
      articleTemplate.find('.panel-title').text(name);
      articleTemplate.find('.article-description').text(description);
      articleTemplate.find('.article-price').text(etherPrice + " ETH");
      articleTemplate.find('.btn-buy').attr('data-id', id);
      articleTemplate.find('.btn-buy').attr('data-value', etherPrice);

      // seller ?
      if (seller == App.account) {
          articleTemplate.find('.article-seller').text("You");
          articleTemplate.find('.btn-buy').hide();
      } else {
          articleTemplate.find('.article-seller').text(seller);
          articleTemplate.find('.btn-buy').show();
      }

      // add this new article
      articleRow.append(articleTemplate.html());
  },

  sellArticle: function(){
    // retrieve details of the articles
    var anArticleName = $("#article_name").val();
    var aDescription = $("#article_description").val();
    var aPrice = web3.toWei(parseFloat($("#article_price").val() || 0), "ether");

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
      App.contracts.ChainList.deployed().then(function(instance) {
          instance.sellArticleEvent({}, {
              fromBlock: 0,
              toBlock: 'latest'
          }).watch(function(error, event) {
              if (!error) {
                  $("#events").append('<li class="list-group-item">' + event.args.aName + ' is for sale' + '</li>');
              } else {
                  console.error(error);
              }
              App.reloadArticles();
          });

          instance.buyArticleEvent({}, {
              fromBlock: 0,
              toBlock: 'latest'
          }).watch(function(error, event) {
              if (!error) {
                  $("#events").append('<li class="list-group-item">' + event.args.aBuyer + ' bought ' + event.args.aName +  '</li>');
              } else {
                  console.error(error);
              }
              App.reloadArticles();
          });
      });
  },


    buyArticle: function() {
        event.preventDefault();

        // retreive the article Price
        var anArticleId = $(event.target).data('id');
        var aPrice = parseFloat($(event.target).data('value'));

        App.contracts.ChainList.deployed().then(function(instance) {
            return instance.buyArticle(anArticleId, {
                from: App.account,
                value: web3.toWei(aPrice, "ether"),
                gas: 500000
            });
        }).then(function(result){
            // we will update this with events
        }).catch(function(err) {
            console.error(err);
        });

    },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
