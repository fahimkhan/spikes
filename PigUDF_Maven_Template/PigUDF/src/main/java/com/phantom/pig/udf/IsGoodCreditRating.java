package com.phantom.pig.udf;

import java.io.IOException;

import org.apache.pig.FilterFunc;
import org.apache.pig.backend.executionengine.ExecException;
import org.apache.pig.data.Tuple;


public class IsGoodCreditRating extends FilterFunc  
{
   

	@Override
	public Boolean exec(Tuple args) throws IOException {
		if (args == null || args.size() == 0) {
	        return false;
	      }
	    try {
	    	Object object = args.get(0);
	        if (object == null) {
	          return false;
	        }
	        int i = (Integer) object;
	        if(i>5){
	         return true;
	        }else{
	         return false;
	        }
	    } catch (ExecException e) {
	        throw new IOException(e);
	     }
	}
}
