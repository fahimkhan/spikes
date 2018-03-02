"""
This code check if stream is text or any binary format
"""

from __future__ import division
import string

text_characters = "".join(map(chr, range(32, 127))) + "\n\r\t\b"   #Text charcter of all keyboaro
_null_trans = string.maketrans("","")



def istext(s,text_characters=text_characters,threshold=0.30):#30% threshold for binary char in string
	# if s contains any null, then it is not text:
	if '\0' in s:
		return False
	# An empty string is still a text
	if not s:
		return True
	# Get the substring of s made of non-text characters
	t = s.translate(_null_trans, text_characters)
	# s is 'text' if less than 30% of its characters are non-text ones:
	return len(t)/len(s) <=threshold


print "Hello, World ", istext("Hello, World")
print "\xc3\xa4", istext("\xc3\xa4")





