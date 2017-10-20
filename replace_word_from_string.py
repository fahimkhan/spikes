

string  = "dkfkfljgh$$$fjhgkjhfk$$$ lfhgkjgkj$$$fjgfi $$$lfjgljf"

keys = ["key1","key2","key3","key4"]


key_count = 0
repeat = 0
for i in range(len(string)-1):
	if string[i]=="$":
		repeat += 1
		##Key Count
		if repeat == 3:
			key_count += 1
	else:
		repeat = 0

	


if key_count == len(keys):
	print "Valid number of keys"
	for key in keys:
		string = string.replace("$$$",key,1)

	print string
else:
	print "Invalid number of keys"