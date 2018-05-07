


ElementList = [25,64,12,2]

#Traverse through all the element
for element_index in range(len(ElementList)):
	
	min_element_index =  element_index

	for j in range(min_element_index+1,len(ElementList)):
		if ElementList[min_element_index] > ElementList[j]:
			min_element_index = j

	#Swap after first passthrough
	ElementList[element_index],ElementList[min_element_index] = ElementList[min_element_index],ElementList[element_index]




print "Sorted Array : ",ElementList 