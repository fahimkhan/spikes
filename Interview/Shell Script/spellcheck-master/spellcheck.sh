#!/bin/bash

# Author - Roger Lam, mrlamroger@ucla.edu

# Overview:
# - This loads the word, sanitizes it, and finds all possible permutations
#+according to the classes of spelling mistakes (Case, repeated letters,
#+and incorrect vowels).
# - Sanitization is currently converting all letters to lowercase.
# - We find all permutations by first finding all possible reductions when 
#+deleting duplicate letters.
# - For each reduction, we find all possible permutations when 
#+replacing vowels with another vowel (a, e, i, o, u)

# Loading Dictionary:
# - Load words into an associative array (hash table).
# - One time cost of loading words in. 
# - Loading: O(N) where N is the number of words in Dictionary 
# - Searching: Average and amortized O(1), worst case O(N) when all words 
#+are placed in the same bucket.

#DICTIONARY_INPUT="/home/lamr/twitchinterview/words_short"
DICTIONARY_INPUT="/usr/share/dict/words"

declare -A DICTIONARY

while read word; do
    word=${word,,}
    DICTIONARY[$word]=1
done < $DICTIONARY_INPUT

#for j in "${!DICTIONARY[@]}"; do
#    echo "$j"
#done

while read -p"> " input_word; do
    #echo "You entered $input_word"
    input_word=${input_word,,}
    #echo "Lowercased: $input_word"
    
    found=false

    # If the input is a word in the dictionary, you're done!
    if [[ ${DICTIONARY[$input_word]} ]]; then
        echo "$input_word";
        found=true
    else
        # Else, use DUPLICATE as a queue and enqueue permutations of reduced
        #+words. Use ALL_DUPLICATE as a set which removes duplicate words.
        declare -a DUPLICATE=($input_word)
        declare -A ALL_DUPLICATE
        
        ALL_DUPLICATE=()
        ALL_DUPLICATE[$input_word]=$input_word
        while [ ${#DUPLICATE[@]} -gt 0 ]; do
            for (( i=0; i<${#DUPLICATE}-1; i++ )); do
                if [[ ${DUPLICATE:$i:1} == ${DUPLICATE:$i+1:1} ]]; then
                    twochars=${DUPLICATE:$i:2}
                    #echo $twochars
                    removed_dup=${DUPLICATE:0:$i}${DUPLICATE:$((i+1))}
                    #echo $removed_dup
                    ALL_DUPLICATE[$removed_dup]=$removed_dup
                    if [[ ${DICTIONARY[$removed_dup]} ]]; then
                        echo "$removed_dup"
                        found=true
                        break 2
                    else
                        DUPLICATE=( "${DUPLICATE[@]}" $removed_dup)
                        #echo "New size is ${#DUPLICATE[@]}"
                    fi
                fi
            done
            DUPLICATE=(${DUPLICATE[@]:1})
            #echo "Removed size is ${#DUPLICATE[@]}"
        done
        
        #for j in "${!ALL_DUPLICATE[@]}"; do
        #    echo "$j"
        #done

        # If we didn't find the word yet, go through the set of duplicates
        #+and stack words with changed vowels in VOWELS. 
        # Each stack in VOWELS belongs to a particular word in ALL_DUPLICATES.
        # Iterate through the length of the word since we don't need to check 
        #+earlier letters of newly created words.     
        if ! $found; then
            #echo "Found: $found"
            declare -a VOWELS
            for j in "${!ALL_DUPLICATE[@]}"; do
                
                VOWELS=( $j )
                num_letters=${#VOWELS}
                for (( i=0; i<$num_letters; i++ )); do
                    for k in "${VOWELS[@]}"; do
                        if [[ ${k:$i:1} == [aeiou] ]]; then
                            
                            
                            change_a=${k:0:$i}a${k:$((i+1))}
                            change_e=${k:0:$i}e${k:$((i+1))}                            
                            change_i=${k:0:$i}i${k:$((i+1))}
                            change_o=${k:0:$i}o${k:$((i+1))}
                            change_u=${k:0:$i}u${k:$((i+1))}

                            #echo $change_a
                            #echo $change_e
                            #echo $change_i
                            #echo $change_o
                            #echo $change_u

                            VOWELS=( "${VOWELS[@]}" $change_a )
                            VOWELS=( "${VOWELS[@]}" $change_e )
                            VOWELS=( "${VOWELS[@]}" $change_i )
                            VOWELS=( "${VOWELS[@]}" $change_o )
                            VOWELS=( "${VOWELS[@]}" $change_u )

                            if [[ ${DICTIONARY[$change_a]} ]]; then
                                echo "$change_a"
                                found=true
                                break 3
                            elif [[ ${DICTIONARY[$change_e]} ]]; then
                                echo "$change_e"
                                found=true
                                break 3
                            elif [[ ${DICTIONARY[$change_i]} ]]; then
                                echo "$change_i"
                                found=true
                                break 3
                            elif [[ ${DICTIONARY[$change_o]} ]]; then
                                echo "$change_o"
                                found=true
                                break 3
                            elif [[ ${DICTIONARY[$change_u]} ]]; then
                                echo "$change_u"
                                found=true
                                break 3
                            fi
                        fi
                    done
                done
                VOWELS=($VOWELS[@]:1})
            done 
        fi      
    fi
    
    if ! $found; then
        echo "NO SUGGESTION"
    fi

done




