OPENQASM 2.0;
include "qelib1.inc";
qreg q[16];
cx q[12],q[10];
u2(0,3.14159265358979) q[10];
u2(0,3.14159265358979) q[9];
u2(0,3.14159265358979) q[4];
cx q[9],q[4];
u2(0,3.14159265358979) q[4];
u2(0,3.14159265358979) q[9];
cx q[3],q[5];
u2(0,3.14159265358979) q[2];
cx q[2],q[10];
u2(0,3.14159265358979) q[10];
u2(0,3.14159265358979) q[2];
cx q[7],q[2];
cx q[1],q[8];
cx q[6],q[8];
u2(0,3.14159265358979) q[6];
u2(0,3.14159265358979) q[8];
cx q[6],q[8];
u2(0,3.14159265358979) q[6];
u2(0,3.14159265358979) q[8];
cx q[6],q[8];
cx q[5],q[8];
u2(0,3.14159265358979) q[8];
u2(0,3.14159265358979) q[5];
cx q[5],q[8];
u2(0,3.14159265358979) q[8];
u2(0,3.14159265358979) q[5];
cx q[5],q[8];
cx q[3],q[5];
u2(0,3.14159265358979) q[5];
u2(0,3.14159265358979) q[3];
cx q[3],q[5];
u2(0,3.14159265358979) q[5];
u2(0,3.14159265358979) q[3];
cx q[3],q[5];
cx q[3],q[9];
u2(0,3.14159265358979) q[3];
u2(0,3.14159265358979) q[9];
cx q[3],q[9];
u2(0,3.14159265358979) q[3];
u2(0,3.14159265358979) q[9];
cx q[3],q[9];
cx q[9],q[4];
u2(0,3.14159265358979) q[4];
u2(0,3.14159265358979) q[9];
cx q[9],q[4];
u2(0,3.14159265358979) q[9];
u2(0,3.14159265358979) q[4];
cx q[9],q[4];
cx q[11],q[4];
cx q[0],q[1];
