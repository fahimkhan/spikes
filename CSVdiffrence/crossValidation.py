import csv
import math
import random


#f1 = csv.writer(open("plusone.csv", "w"))
#f2 = csv.writer(open("negone.csv","w"))
x = 0
y = 0
pluslist =  []
neglist = []


#Creating plusone.csv and negone.csv files
with open('banana.csv') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        if row['Class'] == '1':
            x = x + 1
            #f1.writerow([row['At1'],row['At2'],row['Class']])
            pluslist.append(row)
        else:
            y = y + 1
            #f2.writerow([row['At1'],row['At2'],row['Class']])
            neglist.append(row)


print "X :",x
print "Y :",y
fold = 5
nplus = x/fold
nneg = y/fold

print "N for positive : ",nplus
print "N for negative :",nneg

#Five fold files
fold1 = csv.writer(open("fold1.csv","w"))
fold2 = csv.writer(open("fold2.csv","w"))
fold3 = csv.writer(open("fold3.csv","w"))
fold4 = csv.writer(open("fold4.csv","w"))
fold5 = csv.writer(open("fold5.csv","w"))

##Adding samples from pluslist and neglist to all fold.
i = 0
while i < nplus:
    index = random.randrange(len(pluslist))
    fold1.writerow([pluslist[index]['At1'],pluslist[index]['At2'],pluslist[index]['Class']])
    del pluslist[index]
    i = i + 1


i = 0
while i < nneg:
    index = random.randrange(len(neglist))
    fold1.writerow([neglist[index]['At1'],neglist[index]['At2'],neglist[index]['Class']])
    del neglist[index]
    i = i + 1

#Similarly add above two while loop for fold2.csv...fold5.csv
