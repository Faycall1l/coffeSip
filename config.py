"""
Configuration file for Coffee Temperature Tracker
Contains mug types, colors, and physics constants
"""

# Mug types with their cooling constants and properties
MUG_TYPES = {
    "ceramic": {
        "name": "Ceramic Mug",
        "cooling_constant": 0.05,
        "description": "Classic ceramic - good heat retention",
        "color": "#D2691E",
        "thermal_mass": "Medium"
    },
    "glass": {
        "name": "Glass Mug",
        "cooling_constant": 0.08,
        "description": "Clear glass - faster cooling",
        "color": "#87CEEB",
        "thermal_mass": "Low"
    },
    "metal": {
        "name": "Metal Travel Mug",
        "cooling_constant": 0.03,
        "description": "Stainless steel - excellent insulation",
        "color": "#C0C0C0",
        "thermal_mass": "High"
    },
    "paper": {
        "name": "Paper Cup",
        "cooling_constant": 0.12,
        "description": "Disposable - poor insulation",
        "color": "#DEB887",
        "thermal_mass": "Very Low"
    },
    "double_wall": {
        "name": "Double-Wall Glass",
        "cooling_constant": 0.025,
        "description": "Premium insulation",
        "color": "#E6E6FA",
        "thermal_mass": "High"
    }
}

# Color scheme
COLORS = {
    "primary_bg": "#2C1810",      # Dark coffee brown
    "secondary_bg": "#4A2C17",    # Medium coffee brown
    "accent": "#8B4513",          # Saddle brown
    "light_accent": "#D2B48C",    # Tan
    "text_primary": "#F5DEB3",    # Beige
    "text_secondary": "#DEB887",  # Burlywood
    "button_bg": "#CD853F",       # Peru
    "button_hover": "#A0522D",    # Sienna
    "chart_bg": "#F5F5DC",        # Beige
    "grid_color": "#D3D3D3"       # Light gray
}

# Physics constants
PHYSICS = {
    "ideal_drinking_temp": 65,    # Celsius
    "default_coffee_temp": 85,    # Celsius
    "default_room_temp": 22,      # Celsius
    "default_duration": 60        # Minutes
}