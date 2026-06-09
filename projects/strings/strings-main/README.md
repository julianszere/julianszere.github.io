# Guitar Simulation

This project simulates guitar strings using the damped wave equation.

---

## Video Example

[![Strings Simulation](https://img.youtube.com/vi/wA7FSTKI-ZI/maxresdefault.jpg)](https://www.youtube.com/watch?v=wA7FSTKI-ZI)

---

## Description

Each string is modeled as a continuous medium whose transverse displacement \( u(x,t) \) evolves in time according to the **damped wave equation**.  

---

## The Damped Wave Equation

The physical model is given by:

$$
\frac{\partial^2 u}{\partial t^2} + 2\sigma\,\frac{\partial u}{\partial t} = c^2\,\frac{\partial^2 u}{\partial x^2}
$$

where:

- \(u(x,t)\) is the displacement of the string at position \(x\) and time \(t\),
- \(c\) is the wave speed (determined by string tension and mass per unit length),
- \(\sigma\) is the damping coefficient controlling how fast the vibration decays.

Boundary conditions:

$$
u(0,t) = u(L,t) = 0
$$

represent the two fixed ends of the string.  
Initial conditions such as a triangular pluck or localized velocity pulse set the excitation.
