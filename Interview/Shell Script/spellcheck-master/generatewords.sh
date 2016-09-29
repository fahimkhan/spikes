#!/bin/bash

MAXCOUNT=10
count=1
#DICTIONARY_INPUT="/home/lamr/twitchinterview/words_short"
DICTIONARY_INPUT="/usr/share/dict/words"

while [ "$count" -le $MAXCOUNT ]; do
	rand_word=$(shuf -n 1 $DICTIONARY_INPUT)
	echo "$rand_word"
	modified_word=""	
	for (( i=0; i<${#rand_word}; i++ )); do
		#Random int 1-10 inclusive		
		random_int=$(( ( RANDOM % 10 )  + 1 ))
		modified_char="${rand_word:$i:1}"

		if [[ "$modified_char" == [aeiou] ]]; then
			#Change vowel
			vowels="aeiou"
			num=$(( $RANDOM % 5 ))
			modified_char="${vowels:$num:1}"
		fi

		if [[ $random_int -ge 5 ]]; then
			#Make uppercase
			modified_char=$(echo $modified_char | tr '[:lower:]' '[:upper:]')
		fi
		

		if [[ $random_int -ge 9 ]]; then
			#Make a duplicate
			modified_word=$modified_word$modified_char
		fi

		modified_word=$modified_word$modified_char
			
	done
	echo "$modified_word"
	((count++))
done
