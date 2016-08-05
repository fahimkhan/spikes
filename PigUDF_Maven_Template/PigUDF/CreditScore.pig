REGISTER dist/pig-udfs.jar

records = LOAD 'SampleFile.txt' USING PigStorage(',') AS (name:chararray, location:chararray, creditrating:int);

filter_records = FILTER records BY com.phantom.pig.udf.IsGoodCreditRating(creditrating);

grouped_records = GROUP filter_records BY location;

DUMP grouped_records;
