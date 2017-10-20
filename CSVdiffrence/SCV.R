D = read.csv(file="banana2.csv", sep=",")[,c('Class')]
plus = 0
neg = 0
fold = 5
importdataClass1 <- read.csv("banana2.csv")
importdataClass1
fold1 <- file("fold1Set.csv","w")
fold2 <- file("fold2Set.csv","w")
fold3 <- file("fold3Set.csv","w")
fold4 <- file("fold4Set.csv","w")
fold5 <- file("fold5Set.csv","w")
testset <- file("TestSet.csv","w")

for(i in 1:length(D))
{
 
  if(D[i] == 1)
    plus = plus + 1
  else
    neg = neg + 1
  
  
}
print (plus)
print (neg)

for(j in 1:2)
{
    n <- floor(plus/fold)
    n
    for(k in 1:5)
    {
      if(k==1)
      {
       importdataClass1 <- subset(importdataClass1,Class==1)
       E <- importdataClass1[sample(nrow(importdataClass1), n), ]
       write.csv(E, file = "fold1Set.csv", row.names = FALSE)
       
      }
      if(k==2)
      {
        importdataClass1 <- subset(importdataClass1,Class==1)
        E <- importdataClass1[sample(nrow(importdataClass1), n), ]
        write.csv(E, file = "fold2Set.csv", row.names = FALSE)
      }
      if(k==3)
      {
        importdataClass1 <- subset(importdataClass1,Class==1)
        E <- importdataClass1[sample(nrow(importdataClass1), n), ]
        write.csv(E, file = "fold3Set.csv", row.names = FALSE)
      }
      if(k==4)
      {
        importdataClass1 <- subset(importdataClass1,Class==1)
        E <- importdataClass1[sample(nrow(importdataClass1), n), ]
        write.csv(E, file = "fold4Set.csv", row.names = FALSE)
      }
      if(k==5)
      {
        importdataClass1 <- subset(importdataClass1,Class==1)
        E <- importdataClass1[sample(nrow(importdataClass1), n), ]
        write.csv(E, file = "fold5Set.csv", row.names = FALSE)
      }
        
    }
    
}

close(fold1)
close(fold2)
close(fold3)
close(fold4)
close(fold5)


