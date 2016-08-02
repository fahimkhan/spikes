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
LIBS:eSim_User
LIBS:eSim_Subckt
LIBS:eSim_Sources
LIBS:eSim_Miscellaneous
LIBS:eSim_Hybrid
LIBS:eSim_Digital
LIBS:eSim_Devices
LIBS:eSim_Analog
LIBS:example_2.2-cache
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
Wire Wire Line
	5050 3150 5450 3150
Wire Wire Line
	4150 5750 4150 6950
Wire Wire Line
	4150 3150 4150 4150
Wire Wire Line
	6350 3150 6350 4150
Wire Wire Line
	6350 4450 6350 4800
Wire Wire Line
	4150 4450 4150 5350
Wire Wire Line
	6350 5200 4150 5200
Connection ~ 4150 5200
Connection ~ 4150 6650
$Comp
L dc v2
U 1 1 51909454
P 5900 3150
F 0 "v2" H 5700 3250 60  0000 C CNN
F 1 "10V" H 5700 3100 60  0000 C CNN
F 2 "R1" H 5600 3150 60  0000 C CNN
F 3 "" H 5900 3150 60  0001 C CNN
	1    5900 3150
	0    1    1    0   
$EndComp
$Comp
L dc v1
U 1 1 5167D912
P 4600 3150
F 0 "v1" H 4400 3250 60  0000 C CNN
F 1 "10V" H 4400 3100 60  0000 C CNN
F 2 "R1" H 4300 3150 60  0000 C CNN
F 3 "" H 4600 3150 60  0001 C CNN
	1    4600 3150
	0    1    1    0   
$EndComp
$Comp
L PWR_FLAG #FLG01
U 1 1 516A8F23
P 4150 6650
F 0 "#FLG01" H 4150 6745 30  0001 C CNN
F 1 "PWR_FLAG" H 4150 6830 30  0000 C CNN
F 2 "" H 4150 6650 60  0001 C CNN
F 3 "" H 4150 6650 60  0001 C CNN
	1    4150 6650
	0    1    1    0   
$EndComp
$Comp
L DIODE D2
U 1 1 5167D956
P 6350 5000
F 0 "D2" H 6350 5100 40  0000 C CNN
F 1 "DIODE" H 6350 4900 40  0000 C CNN
F 2 "" H 6350 5000 60  0001 C CNN
F 3 "" H 6350 5000 60  0001 C CNN
	1    6350 5000
	0    1    1    0   
$EndComp
$Comp
L DIODE D1
U 1 1 5167D869
P 4150 5550
F 0 "D1" H 4150 5650 40  0000 C CNN
F 1 "DIODE" H 4150 5450 40  0000 C CNN
F 2 "" H 4150 5550 60  0001 C CNN
F 3 "" H 4150 5550 60  0001 C CNN
	1    4150 5550
	0    -1   -1   0   
$EndComp
$Comp
L R R1
U 1 1 55DD50FD
P 4150 4300
F 0 "R1" V 4230 4300 50  0000 C CNN
F 1 "10k" V 4150 4300 50  0000 C CNN
F 2 "" V 4080 4300 30  0000 C CNN
F 3 "" H 4150 4300 30  0000 C CNN
	1    4150 4300
	1    0    0    -1  
$EndComp
$Comp
L R R2
U 1 1 55DD5484
P 6350 4300
F 0 "R2" V 6430 4300 50  0000 C CNN
F 1 "5k" V 6350 4300 50  0000 C CNN
F 2 "" V 6280 4300 30  0000 C CNN
F 3 "" H 6350 4300 30  0000 C CNN
	1    6350 4300
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR02
U 1 1 55DD56AE
P 5250 3300
F 0 "#PWR02" H 5250 3050 50  0001 C CNN
F 1 "GND" H 5250 3150 50  0000 C CNN
F 2 "" H 5250 3300 60  0000 C CNN
F 3 "" H 5250 3300 60  0000 C CNN
	1    5250 3300
	1    0    0    -1  
$EndComp
Wire Wire Line
	5250 3150 5250 3300
Connection ~ 5250 3150
$Comp
L GND #PWR03
U 1 1 55DD5E5E
P 4150 6950
F 0 "#PWR03" H 4150 6700 50  0001 C CNN
F 1 "GND" H 4150 6800 50  0000 C CNN
F 2 "" H 4150 6950 60  0000 C CNN
F 3 "" H 4150 6950 60  0000 C CNN
	1    4150 6950
	1    0    0    -1  
$EndComp
Text GLabel 6550 4550 2    60   Input ~ 0
Out
Wire Wire Line
	6550 4550 6350 4550
Connection ~ 6350 4550
Text GLabel 3850 3950 0    60   Input ~ 0
v
Wire Wire Line
	3850 3950 4150 3950
Connection ~ 4150 3950
$EndSCHEMATC
