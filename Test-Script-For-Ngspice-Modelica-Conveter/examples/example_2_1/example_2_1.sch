EESchema Schematic File Version 2  date Tuesday 25 June 2013 02:21:19 PM IST
LIBS:power
LIBS:device
LIBS:transistors
LIBS:conn
LIBS:linear
LIBS:regul
LIBS:74xx
LIBS:cmos4000
LIBS:adc-dac
LIBS:memory
LIBS:xilinx
LIBS:special
LIBS:microcontrollers
LIBS:dsp
LIBS:microchip
LIBS:analog_switches
LIBS:motorola
LIBS:texas
LIBS:intel
LIBS:audio
LIBS:interface
LIBS:digital-audio
LIBS:philips
LIBS:display
LIBS:cypress
LIBS:siliconi
LIBS:opto
LIBS:atmel
LIBS:contrib
LIBS:valves
LIBS:analogSpice
LIBS:analogXSpice
LIBS:convergenceAidSpice
LIBS:converterSpice
LIBS:digitalSpice
LIBS:digitalXSpice
LIBS:linearSpice
LIBS:measurementSpice
LIBS:portSpice
LIBS:sourcesSpice
LIBS:example_2.1-cache
EELAYER 25  0
EELAYER END
$Descr A4 11700 8267
encoding utf-8
Sheet 1 1
Title ""
Date "25 jun 2013"
Rev ""
Comp ""
Comment1 ""
Comment2 ""
Comment3 ""
Comment4 ""
$EndDescr
$Comp
L VPLOT8_1 U1
U 1 1 51A32EB1
P 3700 2650
F 0 "U1" H 3550 2750 50  0000 C CNN
F 1 "VPLOT8_1" H 3850 2750 50  0000 C CNN
	1    3700 2650
	1    0    0    -1  
$EndComp
$Comp
L VPLOT8_1 U1
U 2 1 51A32EAE
P 4650 2650
F 0 "U1" H 4500 2750 50  0000 C CNN
F 1 "VPLOT8_1" H 4800 2750 50  0000 C CNN
	2    4650 2650
	1    0    0    -1  
$EndComp
Wire Wire Line
	4200 2950 4250 2950
Connection ~ 4150 3850
Wire Wire Line
	4150 3850 4150 4000
Wire Wire Line
	4700 3150 4700 2950
Wire Wire Line
	3650 3850 4700 3850
Wire Wire Line
	4700 3850 4700 3650
Wire Wire Line
	3650 2950 3700 2950
Wire Wire Line
	4700 2950 4650 2950
Connection ~ 3700 2950
Connection ~ 4650 2950
$Comp
L IPLOT U2
U 1 1 51A32E9D
P 3950 2950
F 0 "U2" H 3800 3050 50  0000 C CNN
F 1 "IPLOT" H 4100 3050 50  0000 C CNN
	1    3950 2950
	1    0    0    -1  
$EndComp
$Comp
L PWR_FLAG #FLG1
U 1 1 519F1E3B
P 4150 3850
F 0 "#FLG1" H 4150 4120 30  0001 C CNN
F 1 "PWR_FLAG" H 4150 4080 30  0000 C CNN
	1    4150 3850
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR1
U 1 1 519F1E31
P 4150 4000
F 0 "#PWR1" H 4150 4000 30  0001 C CNN
F 1 "GND" H 4150 3930 30  0001 C CNN
	1    4150 4000
	1    0    0    -1  
$EndComp
$Comp
L R R1
U 1 1 519F1E19
P 4700 3400
F 0 "R1" V 4780 3400 50  0000 C CNN
F 1 ".5k" V 4700 3400 50  0000 C CNN
	1    4700 3400
	1    0    0    -1  
$EndComp
$Comp
L DC v1
U 1 1 519F1E10
P 3650 3400
F 0 "v1" H 3450 3500 60  0000 C CNN
F 1 "10" H 3450 3350 60  0000 C CNN
F 2 "R1" H 3350 3400 60  0000 C CNN
	1    3650 3400
	1    0    0    -1  
$EndComp
$Comp
L DIODE D1
U 1 1 519F1DE7
P 4450 2950
F 0 "D1" H 4450 3050 40  0000 C CNN
F 1 "DIODE" H 4450 2850 40  0000 C CNN
	1    4450 2950
	1    0    0    -1  
$EndComp
$EndSCHEMATC
