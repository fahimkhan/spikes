import sys

def convert_from_int_to_binary(num):
	binary = []
	while num:
		binary.append(str(num%2))
		num /= 2

	binary.reverse()
	
	return "".join(binary)


def convert_from_hex_to_binary(num):
	hex_to_int = int(num,16)
	return convert_from_int_to_binary(hex_to_int)


def binary_addition(a,b):
	a_bin = convert_from_int_to_binary(a)
	b_bin = convert_from_int_to_binary(b)
	##check length and append 0 properly
	if len(a_bin) > len(b_bin):
		b_bin = b_bin.rjust(len(a_bin),'0')
	elif len(a_bin) < len(b_bin):
		a_bin = a_bin.rjust(len(b_bin),'0')


	print "Binary Number 1 : ",a_bin
	print "Binary Number 2 : ",b_bin


	###create rule for binary addition
	rules = {('0','0'):(0,0),('0','1'):(1,0),('1','0'):(1,0),('1','1'):(0,1)}

	pre_carry = 0
	carry = 0
	sum = 0
	result = ""
	dummy_carry = 0

	for x,y in zip(reversed(a_bin),reversed(b_bin)):
		print "X and Y : ",x,y
		sum = rules[(x,y)][0]
		carry = rules[(x,y)][1]

		#Check if you have pre carry. Modify sum.
		if pre_carry:
			dummy_sum = sum
			sum = rules[(str(dummy_sum),str(pre_carry))][0]
			dummy_carry = rules[(str(dummy_sum),str(pre_carry))][1]

		if dummy_carry:
			pre_carry = dummy_carry
		else:
			pre_carry = carry	

		result += str(sum)
		
	if pre_carry:
		result += str(1)

	print "Result : ",result[::-1]
	return result[::-1]
	


if __name__=="__main__":
	binary_representation = convert_from_int_to_binary(18)
	print "Decimal to Binary Representation " +str(binary_representation)
	binary_representation = convert_from_hex_to_binary("A")
	print "Hex to Binary Representation " +str(binary_representation)

	####Addition 
	a = 5
	b = 18
	addition_result = binary_addition(a,b)
	print "Addition result : "+str(addition_result)
