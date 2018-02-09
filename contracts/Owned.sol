pragma solidity ^0.4.11;

contract Owned{
    // State variables
    address owner;

    // Modifiers
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }

    // Constructor
    function Owned() {
        owner = msg.sender;
    }
}
