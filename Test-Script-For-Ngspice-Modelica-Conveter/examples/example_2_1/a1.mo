model a1
import Modelica.Electrical.*;
Analog.Sources.ConstantVoltage v1(V = 10);
Analog.Semiconductors.Diode d1(Ids = 2.495e-09, Vt = 0.041975, R = 1e12);
Analog.Basic.Resistor r1(R = 500);
Analog.Basic.Ground g;
protected
Modelica.Electrical.Analog.Interfaces.Pin n1, n0, n4;
equation
connect(r1.p,n1);
connect(r1.n,n0);
connect(v1.p,n4);
connect(v1.n,n0);
connect(d1.p,n4);
connect(d1.n,n1);
connect(g.p,n0);
end a1;
