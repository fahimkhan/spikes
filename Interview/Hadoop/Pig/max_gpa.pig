--Comment
--Script start from here

--Load Data
student = LOAD 'student_data.csv' USING PigStorage(',') AS(id:int,name:chararray,age:int,gpa:float,country:chararray);

--Group by name
group_student = GROUP student by name;

--calculate max gpa for individual student
max_gpa = FOREACH group_student GENERATE group,MAX(student.gpa);

DUMP max_gpa;

--To run pig script in local mode
pig -x local max_gpa.pig

--Distributed mode
pig -x mapreduce max_gpa.pig

--Running from inside grunt shell
exec 'max_gpa.pig'