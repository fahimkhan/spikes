 Author - Roger Lam, mrlamroger@ucla.edu, github.com/mrlamroger


Spellcheck Problem

 Write a program that reads a large list of English words (e.g. from /usr/share/dict/words on a unix system) into memory, and then reads words from stdin, and prints either the best spelling suggestion, or "NO SUGGESTION" if no suggestion can be found. The program should print ">" as a prompt before reading each word, and should loop until killed.

Your solution should be faster than O(n) per word checked, where n is the length of the dictionary. That is to say, you can't scan the dictionary every time you want to spellcheck a word.

For example:

> sheeeeep
sheep
> peepple
people
> sheeple
NO SUGGESTION

The class of spelling mistakes to be corrected is as follows:

    Case (upper/lower) errors: "inSIDE" => "inside"
    Repeated letters: "jjoobbb" => "job"
    Incorrect vowels: "weke" => "wake"

Any combination of the above types of error in a single word should be corrected (e.g. "CUNsperrICY" => "conspiracy").

If there are many possible corrections of an input word, your program can choose one in any way you like. It just has to be an English word that is a spelling correction of the input by the above rules.

Final step: Write a second program that *generates* words with spelling mistakes of the above form, starting with correctly spelled English words. Pipe its output into the first program and verify that there are no occurrences of "NO SUGGESTION" in the output.

==========

 Notes: 
 - In hindsight, it would be much better to implement in Python.
 - The reason for choosing Bash was to learn more and test the limitations of Bash.
 - Hacking together a queue and set with arrays and associative arrays
caused hiccups and is a potential source of bugs.
 - Bash also does not deal well with functions and passing by reference.
 - Ideally, I'd have getting all possible duplicate permutations as
one method and getting all possible vowel combinations as a second method.
 - To test, run bash generatewords.sh | bash spellcheck.sh | grep "NO SUGGESTIONS" 
 - By default, generatewords.sh and spellcheck.sh can either load first 25 words from
/usr/share/dict/words in the file words_short or all words in /usr/share/dict/words
 - Comment/Uncomment the DICTIONARY_INPUT variable in both files to use the different dicts
 - generatewords.sh randomly replaces lowercase with uppercase, changes vowels, and creates duplicates


 Known issues:
 - Permutation of vowels may create duplicate outcome due to the nature
of the algorithm. May take additional runtime. 
 - Could create an associative array to keep track of permutations to see if we already checked that word but the additional checking would cost more than the runtime for duplicates.
 - BASH is not the ideal language to code this problem in. In hindsight, use Python or another scripting lang.

 Overview:
 - This loads the word, sanitizes it, and finds all possible permutations
according to the classes of spelling mistakes (Case, repeated letters,
and incorrect vowels).
 - Sanitization is currently converting all letters to lowercase.
 - We find all permutations by first finding all possible reductions when 
deleting duplicate letters.
 - For each reduction, we find all possible permutations when 
replacing vowels with another vowel (a, e, i, o, u)

 Runtime analysis:
 - Let m be the length and v be the number of vowels and d be the number of
duplicates in the input word
 - Sanitization take O(m) to iterate through all the letters once
 - Reduction of duplicate letters take O(2^d  (m-1)) = O(2^d) since each
duplicate creates an additional word to continue searching through.
 - For each of the duplicate words, Replacement of vowels takes O(5^v  m) = 
O(5^v) since each vowel creates an additional four words to continue 
searching though.
 - Total runtime: O(2^d * 5^v)
