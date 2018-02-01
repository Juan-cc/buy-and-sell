module.exports = function(callback) {
	ChainList.deployed().then(function(instance){app = instance;});
}