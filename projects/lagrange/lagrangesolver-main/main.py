import sympy as smp
import numpy as np
from scipy.integrate import odeint
import matplotlib.pyplot as plt
from matplotlib import animation
from matplotlib.animation import FuncAnimation


class MechanicalSystem:
    def __init__(self, input_position, input_potential, input_parameters, initial_conditions, mass_values, t_length, fps):
        self.t = smp.symbols('t', real=True, positive=True)
        self.t_values = np.linspace(0, t_length, fps*t_length)
        self.p_values = list(input_parameters.values())
        self.m_values = mass_values
      
        self.parsePosition(input_position, list(input_parameters.keys()))
        self.parsePotential(input_potential)
        self.createMassAndParameterSymbols(list(input_parameters.keys()))
        self.createDerivativeSymbols()
        self.calculateCineticEnergy()
        self.calculateLagrangian()
        self.calculateEulerLagrange()
        self.calculateAcceleration()
        self.solveEulerLagrange(initial_conditions)
        self.getPosition()
        self.makeAnimation(fps, t_length)
        

    def parsePosition(self, input_r, input_p):
        self.r = []
        self.q = []
        self.q_to_coordinates = {}
        for i, input_ri in enumerate(input_r):
            # Get the symbols
            eq = smp.S(input_ri, evaluate=False)
            symbols = eq.free_symbols

            for symbol in symbols:
                if str(symbol) not in input_p and str(symbol) not in self.q_to_coordinates and str(symbol) not in ('xhat', 'yhat'):
                    self.q.append(smp.Function(str(symbol))(self.t))
                    self.q_to_coordinates[str(symbol)] = self.q[i]
                
            r_i = smp.parse_expr(input_ri, self.q_to_coordinates)

            # Cartesian coordinates
            if smp.diff(r_i, 'rhat') == 0 and smp.diff(r_i, 'phihat') == 0:
                rx = smp.diff(r_i, 'xhat')
                ry = smp.diff(r_i, 'yhat')
                self.r.append([smp.Matrix([rx, ry])][0])
        self.N = len(self.r)

    def parsePotential(self, input_V):
        self.V = smp.parse_expr(input_V, self.q_to_coordinates)

    def createMassAndParameterSymbols(self, parameters):
        self.m = smp.symbols(['m%d' % (i + 1) for i in range(self.N)], real=True, positive=True)
        self.p = smp.symbols(tuple(parameters), real=True)

    def createDerivativeSymbols(self):
        self.q_d = []
        self.q_dd = []
        for u in range(self.N):
            self.q_d.append(smp.diff(self.q[u], self.t))
            self.q_dd.append(smp.diff(self.q_d[u], self.t))

    def calculateCineticEnergy(self):
        T = 0
        for u in range(self.N):
            for v in range(self.N):
                for i in range(self.N):
                    T += self.m[i]*self.r[i].diff(self.q[u]).dot(self.r[i].diff(self.q[v])) * self.q_d[u] * self.q_d[v]
        self.T = smp.Rational(1,2) * T
    
    def calculateLagrangian(self):
        self.L = (self.T - self.V).simplify()

    def calculateEulerLagrange(self):
        self.E_L = [smp.diff(self.L, self.q[u]) - smp.diff(smp.diff(self.L, self.q_d[u]), self.t).simplify() for u in range(self.N)]

    def calculateAcceleration(self):
        self.sols = smp.linsolve(self.E_L, tuple(self.q_dd))

    def solveEulerLagrange(self, initial_conditions):
        dvdt_f = [smp.lambdify((self.t,self.p,self.m,self.q,self.q_d), self.sols[self.q_dd[u]]) for u in range(self.N)]
        drdt_f = [smp.lambdify((self.t,self.p,self.m,self.q,self.q_d), self.q_d[u]) for u in range(self.N)]

        dSdt_f = drdt_f + dvdt_f
        def dSdt(S, t, p, m):
            return [dSdt_f[u](t,p,m,S[:self.N],S[self.N:]) for u in range(2*self.N)]
        ans = odeint(dSdt, y0=initial_conditions, t=self.t_values, args=(self.p_values,self.m_values))
        self.q_f = ans.T[:self.N]

    def getPosition(self):
        r_f = smp.lambdify((self.t,self.p,self.q), self.r)
        self.x = []
        self.y = []
        pos = r_f(self.t_values,self.p_values,self.q_f)
        for r_i in pos:        
            self.x.append(r_i[0])
            self.y.append(r_i[1])

    def makeAnimation(self, fps, t_length):
        fig, ax = plt.subplots(dpi=1920/16)
        line, = plt.plot([], [], "o", markersize=5)

        scale = 5
        ax.set_xlim(-scale, scale)
        ax.set_ylim(-scale, scale)

        def animate(frame):
            print(f'Animate frame {frame}')
            line.set_data(([0] + [self.y[i][0][frame] for i in range(self.N)], [0] + [-self.x[i][0][frame] for i in range(self.N)]))
            return line

        anim = FuncAnimation(fig, animate, frames=fps*t_length)
        plt.axis('off')
        FFwriter = animation.FFMpegWriter(fps=50)
        anim.save('SimplePendulum.mp4',writer=FFwriter)
        print('Animation ready')


sys = MechanicalSystem(
    input_position = ['l1*cos(phi1) * xhat + l1*sin(phi1) * yhat', '(l1*cos(phi1) + l2*cos(phi2)) * xhat + (l1*sin(phi1) + l2*sin(phi2)) * yhat'], 
    input_potential = '-2*m1*g*l1*cos(phi1) - m2*g*l2*cos(phi2)', 
    input_parameters = {'l1': 1, 'l2':2, 'g': 1},
    initial_conditions = [0, np.pi, -np.pi/4, 0],
    mass_values = [1, 1.4],
    t_length = 10,
    fps = 20
)
