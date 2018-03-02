import random


def binary_serach(arr,start,end,tgt):
	#Check point
	if start==end:
		return -1

	#Sort Array
	arr = sorted(arr)
	print arr
	for i in range(len(arr)):
		mid = start + (end-start)//2
		if tgt < arr[mid]:
			end = mid
		elif tgt > arr[mid]:
			start = mid+1
		else:
			return mid



arr = random.sample(range(10),9)
print arr
tgt = 7
index_of_tgt = binary_serach(arr,0,len(arr),tgt)

print "Index of target ",index_of_tgt

