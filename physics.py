"""
Physics calculations for coffee cooling using Newton's law of cooling
"""
import numpy as np
from scipy.integrate import odeint


def newton_cooling_law(T, t, k, T_room):
    """
    Newton's Law of Cooling differential equation:
    dT/dt = -k(T - T_room)
    
    Args:
        T: Current temperature
        t: Time
        k: Cooling constant
        T_room: Room temperature
    
    Returns:
        Rate of temperature change
    """
    return -k * (T - T_room)


def solve_cooling(T0, T_room, k, duration):
    """
    Solve the cooling differential equation
    
    Args:
        T0: Initial temperature
        T_room: Room temperature
        k: Cooling constant
        duration: Time duration in minutes
    
    Returns:
        tuple: (time_array, temperature_array)
    """
    t = np.linspace(0, duration, 500)
    T_solution = odeint(newton_cooling_law, T0, t, args=(k, T_room))
    return t, T_solution.flatten()


def find_ideal_drinking_time(t, T_solution, ideal_temp=65):
    """
    Find when coffee reaches ideal drinking temperature
    
    Args:
        t: Time array
        T_solution: Temperature array
        ideal_temp: Ideal drinking temperature
    
    Returns:
        float or None: Time to reach ideal temperature
    """
    idx_ideal = np.where(T_solution <= ideal_temp)[0]
    if len(idx_ideal) > 0:
        return t[idx_ideal[0]]
    return None