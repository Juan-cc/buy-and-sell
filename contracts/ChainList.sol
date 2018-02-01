pragma solidity ^0.4.11;

contract ChainList{
  //State variables
  address seller;
  address buyer;
  string name;
  string description;
  uint256 price;


  // events
    event sellArticleEvent(
      address indexed aSeller,
      string aName,
      uint256 aPrice
    );
    event buyArticleEvent(
        address indexed aSeller,
        address indexed aBuyer,
        string aName,
        uint256 aPrice
    );


      //sell an article
      function sellArticle(string aName, string aDescription, uint256 aPrice)
      public {
          seller = msg.sender;
          name = aName;
          description = aDescription;
          price = aPrice;
          sellArticleEvent(seller, name, price);
      }

      // get article
        function getArticle() public constant returns (
          address aSeller,
          address aBuyer,
          string aName,
          string aDescription,
          uint256 aPrice) {
            return (seller, buyer, name, description, price);
          }

      function buyArticle() payable public {
          // we check wether there is an article for sale
          require(seller != 0x0);

          // we check that the article was not already sold
          require(buyer == 0x0);

          // we dont allow the seller to buy its own article
          require(msg.sender != seller);

          // we check wethere the value sent corresponds to the article price
          require(msg.value == price);

          // keep buyer's information
          buyer = msg.sender;

          // the buyer can buy the article
          seller.transfer(msg.value);

          // trigger the event
          buyArticleEvent(seller, buyer, name, price);
      }
}
