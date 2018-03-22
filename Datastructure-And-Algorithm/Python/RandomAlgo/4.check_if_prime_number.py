

##Complexity O(N)

def is_prime(n):
	if n == 1:
		return -1;
	else:
		for i in range(2,n):
			if n%i == 0:
				return False


		return True




ret = is_prime(4)

if ret == -1:
	print "Neither a prime not a non-prime number :)"
else:
	if ret:
		print "Not a prime number"
	else:
		print "is Prime number"
