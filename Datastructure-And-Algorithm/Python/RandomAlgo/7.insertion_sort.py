


Arr = [4,2,7,1,3]

for index in range(1,len(Arr)):
	position = index
	temp_value = Arr[index]

	while position > 0 and Arr[position-1]>Arr[position]:
		Arr[position] = Arr[position-1]
		position = position-1
		Arr[position] = temp_value




print "Sorted Array is : ",Arr 
