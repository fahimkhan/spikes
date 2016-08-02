EESchema Schematic File Version 2
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
LIBS:example_2.4-cache
EELAYER 25 0
EELAYER END
$Descr A4 11693 8268
encoding utf-8
Sheet 1 1
Title ""
Date "13 may 2013"
Rev ""
Comp ""
Comment1 ""
Comment2 ""
Comment3 ""
Comment4 ""
$EndDescr
$Comp
L PWR_FLAG #FLG1
U 1 1 51909635
P 5200 4200
F 0 "#FLG1" H 5200 4470 30  0001 C CNN
F 1 "PWR_FLAG" H 5200 4430 30  0000 C CNN
F 2 "" H 5200 4200 60  0001 C CNN
F 3 "" H 5200 4200 60  0001 C CNN
	1    5200 4200
	1    0    0    -1  
$EndComp
Wire Wire Line
	4950 2850 5700 2850
Wire Wire Line
	5700 3600 5700 4200
Connection ~ 5200 4200
Wire Wire Line
	5200 4200 5200 4750
Wire Wire Line
	5700 2800 5700 3200
Wire Wire Line
	4200 3200 4200 2850
Wire Wire Line
	4200 2850 4650 2850
Wire Wire Line
	4200 4100 4200 4200
Wire Wire Line
	4200 4200 5700 4200
$Comp
L DIODE D1
U 1 1 5166A924
P 5700 3400
F 0 "D1" H 5700 3500 40  0000 C CNN
F 1 "DIODE" H 5700 3300 40  0000 C CNN
F 2 "" H 5700 3400 60  0001 C CNN
F 3 "" H 5700 3400 60  0001 C CNN
	1    5700 3400
	0    1    1    0   
$EndComp
$Comp
L dc v1
U 1 1 5166A8CD
P 4200 3650
F 0 "v1" H 4000 3750 60  0000 C CNN
F 1 "5V" H 4000 3600 60  0000 C CNN
F 2 "R1" H 3900 3650 60  0000 C CNN
F 3 "" H 4200 3650 60  0001 C CNN
	1    4200 3650
	1    0    0    -1  
$EndComp
$Comp
L R R1
U 1 1 55DD64D5
P 4800 2850
F 0 "R1" V 4880 2850 50  0000 C CNN
F 1 "1000" V 4800 2850 50  0000 C CNN
F 2 "" V 4730 2850 30  0000 C CNN
F 3 "" H 4800 2850 30  0000 C CNN
	1    4800 2850
	0    1    1    0   
$EndComp
$Comp
L GND #PWR1
U 1 1 55DD6528
P 5200 4750
F 0 "#PWR1" H 5200 4500 50  0001 C CNN
F 1 "GND" H 5200 4600 50  0000 C CNN
F 2 "" H 5200 4750 60  0000 C CNN
F 3 "" H 5200 4750 60  0000 C CNN
	1    5200 4750
	1    0    0    -1  
$EndComp
Text GLabel 6150 2800 2    60   Input ~ 0
out
Wire Wire Line
	5700 2800 6150 2800
Connection ~ 5700 2850
$EndSCHEMATC
