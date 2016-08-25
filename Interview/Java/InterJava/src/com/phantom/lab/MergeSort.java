
/*
 Merge two arrays in sorted order
 */

package com.phantom.lab;

import java.util.ArrayList;

public class MergeSort {

	public void merge(int[] arr1,int[] arr2){
		int p1 = 0;
		int p2 = 0;
		
		ArrayList<Integer> result = new ArrayList<Integer>();
		
		while(p1 < arr1.length && p2 < arr2.length){
			if(arr1[p1] <= arr2[p2]){
				result.add(arr1[p1]);
				p1++;
			}
			else if(arr1[p1] >= arr2[p2]){
				result.add(arr2[p2]);
				p2++;
			}
		}
		
		if(p1 < arr1.length){
			while(p1 < arr1.length){
				result.add(arr1[p1]);
				p1++;
			}
		}
		
		if(p2 < arr2.length){
			while(p2 < arr2.length){
				result.add(arr2[p2]);
				p2++;
			}
		}
		
		getResult(result);
	}
	
	public void getResult(ArrayList<Integer> result){
		for(int i=0;i<result.size();i++){
			System.out.print(result.get(i)+" ");
		}
		System.out.println("");
	}
	
	
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		int[] a = new int[]{1,3,4};
		int[] b = new int[]{2,5,6,9};
		
		MergeSort obj = new MergeSort();
		obj.merge(a, b);
	}

}
