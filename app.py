from flask import Flask, render_template, request, jsonify
import json
from physics import solve_cooling, find_ideal_drinking_time
from config import MUG_TYPES, COLORS, PHYSICS

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', 
                         mug_types=MUG_TYPES, 
                         colors=COLORS, 
                         physics=PHYSICS)

@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        data = request.get_json()
        
        # Extract parameters
        coffee_temp = float(data['coffee_temp'])
        room_temp = float(data['room_temp'])
        duration = float(data['duration'])
        mug_type = data['mug_type']
        
        # Get mug properties
        mug_data = MUG_TYPES[mug_type]
        k = mug_data['cooling_constant']
        
        # Solve differential equation
        t, T_solution = solve_cooling(coffee_temp, room_temp, k, duration)
        
        # Calculate key metrics
        final_temp = T_solution[-1]
        time_to_ideal = find_ideal_drinking_time(t, T_solution, PHYSICS['ideal_drinking_temp'])
        
        # Prepare data for plotting
        plot_data = {
            'time': t.tolist(),
            'temperature': T_solution.tolist(),
            'room_temp': room_temp,
            'ideal_temp': PHYSICS['ideal_drinking_temp'],
            'mug_color': mug_data['color']
        }
        
        # Calculate temperature at key intervals
        intervals = [0, 5, 10, 15, 30, 45, 60]
        temp_timeline = []
        for interval in intervals:
            if interval <= duration:
                idx = min(int(interval * len(t) / duration), len(t)-1)
                temp_timeline.append({
                    'time': interval,
                    'temperature': round(T_solution[idx], 1)
                })
        
        results = {
            'success': True,
            'plot_data': plot_data,
            'mug_name': mug_data['name'],
            'cooling_constant': k,
            'final_temp': round(final_temp, 1),
            'temp_drop': round(coffee_temp - final_temp, 1),
            'time_to_ideal': round(time_to_ideal, 1) if time_to_ideal else None,
            'temp_timeline': temp_timeline,
            'physics_explanation': f"Newton's Law of Cooling: dT/dt = -k(T - T_room) where k = {k}"
        }
        
        return jsonify(results)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5555)