pragma solidity ^0.4.11;

contract ChainList{
    // Custom types
    struct Article{
        uint id;
        address seller;
        address buyer;
        string name;
        string description;
        uint256 price;
    }

  //State variables
  mapping (uint => Article) public articles;
  uint articleCounter;
  address owner;


  // events
    event sellArticleEvent(
        uint indexed id,
          address indexed aSeller,
          string aName,
          uint256 aPrice
    );
    event buyArticleEvent(
        uint indexed id,
        address indexed aSeller,
        address indexed aBuyer,
        string aName,
        uint256 aPrice
    );

    // constructor
    function ChainList(){
        owner = msg.sender;
    }
      //sell an article
      function sellArticle(string aName, string aDescription, uint256 aPrice)
      public {
          // a new article
          articleCounter++;

          // store this article
          articles[articleCounter] = Article({
              id:articleCounter,
              seller: msg.sender,
              buyer: 0x0,
              name: aName,
              description: aDescription,
              price: aPrice
              });


          sellArticleEvent(articleCounter, msg.sender, aName, aPrice);
      }

      function getNumberOfArticles() public constant returns (uint) {
          return articleCounter;
      }

      // fetch and returns all article IDs available for sale
      function getArticlesForSale() public constant returns (uint[]) {
          // we check whether there is at least one article
          if(articleCounter == 0){
            return new uint[](0);
          }

          // prepare output arrays
          uint[] memory articleIds = new uint[](articleCounter);

          uint numberOfArticlesForSale = 0;
          // iterate over articles
          for (uint i = 1; i <= articleCounter; i++) {
              // keep only the ID fot the article not already sold
              if (articles[i].buyer == 0x0){
                  articleIds[numberOfArticlesForSale] = articles[i].id;
                  numberOfArticlesForSale++;
              }
          }

          // copy the articleIds array into the smaller forSale array
          uint[] memory forSale = new uint[](numberOfArticlesForSale);
          for (uint j = 0; j < numberOfArticlesForSale; j++){
              forSale[j] = articleIds[j];
          }
          return (forSale);
      }

      // buy an article
      function buyArticle(uint anId) payable public {
          // we check wether there is at least one article
          require(articleCounter > 0);

          // we check whethere the article exists
          require(anId > 0 && anId <= articleCounter);

          // we retreive the article from the list
          Article storage article = articles[anId];

          // we check if the article has not already been sold
          require(article.buyer == 0x0);

          // we dont allow the seller to buy it's own article
          require(article.seller != msg.sender);

          // we check whether the value sent corresponds to the article price
          require(article.price == msg.value);

          // keep buyer's information
          article.buyer = msg.sender;

          // the buyer can buy the article
          article.seller.transfer(msg.value);

          // trigger the event
          buyArticleEvent(anId, article.seller, article.buyer, article.name, article.price);
      }

      // kill the smart contract
      function kill(){
          require(msg.sender == owner);
          selfdestruct(owner);
      }
}
