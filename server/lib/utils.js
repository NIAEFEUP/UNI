


global.Utils = Utils;


function Utils() {}

Utils.arrayShuffle = function(arr)
{
	var i,swap, temp;

	if( arr.constructor !== Array )
		return false;

	for (i = arr.length - 1; i >= 0; i--)
	{ 
    	swap = (Math.random() * i) | 0 ;
    	temp = arr[i];
    	arr[i] = arr[swap];
    	arr[swap] = temp;
	}

	return true;
}


Utils.getTime = function()
{
	return ( new Date() / 1000 ) | 0 ;
}


Number.prototype.mod = function(n) {
	return ((this%n)+n)%n;
}