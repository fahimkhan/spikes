
##Efficiency O(N**2)

def bubble_sort(array_list):
	unsorted_until_index = len(array_list) - 1 
	sort_flag = False

	while not sort_flag:
		sort_flag = True
		for i in range(unsorted_until_index):
			if array_list[i] > array_list[i+1]:
				sort_flag = False
				array_list[i],array_list[i+1] = array_list[i+1],array_list[i]

		unsorted_until_index = unsorted_until_index - 1


array_list = [2,6,1,4,9,5]
bubble_sort(array_list)
print "Sorted List : ",array_list