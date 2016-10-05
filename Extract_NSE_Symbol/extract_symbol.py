#!/usr/bin/env python

"""
This script extract all the ticker or symbol of NSE dataset
Also it store it in separate file
"""


__author__ = 'Fahim'

import csv


symbolList = []
with open('NSE-datasets-codes.csv','rb') as csvfile:
	data = csv.reader(csvfile,delimiter=',',)
	for rowlist in data:
		item = rowlist[0].split('/')[1]
		symbolList.append(item)



with open('symbol.csv','wb') as symbolfile:
	symbolwriter = csv.writer(symbolfile)	
	for symbol in symbolList:
		symbolwriter.writerow([symbol])
    		 