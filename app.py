import os
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# In-memory storage for events
events = {}

# Admin code (to validate privileged access)
ADMIN_CODE = "Admin1098"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_events', methods=['GET'])
def get_events():
    return jsonify(events)

@app.route('/add_event', methods=['POST'])
def add_event():
    data = request.json
    admin_code = data.get('admin_code')
    
    if admin_code != ADMIN_CODE:
        return jsonify({"error": "Unauthorized access"}), 403

    date = data.get('date')
    event_title = data.get('event_title')
    event_description = data.get('event_description')

    if date not in events:
        events[date] = []

    events[date].append({
        'title': event_title,
        'description': event_description
    })

    return jsonify({"success": True, "message": "Event added successfully"})

@app.route('/update_event', methods=['POST'])
def update_event():
    data = request.json
    admin_code = data.get('admin_code')

    if admin_code != ADMIN_CODE:
        return jsonify({"error": "Unauthorized access"}), 403

    date = data.get('date')
    index = data.get('index')
    updated_event_title = data.get('event_title')
    updated_event_description = data.get('event_description')

    if date in events and 0 <= index < len(events[date]):
        events[date][index]['title'] = updated_event_title
        events[date][index]['description'] = updated_event_description
        return jsonify({"success": True, "message": "Event updated successfully"})
    
    return jsonify({"error": "Event not found"}), 404

if __name__ == '__main__':
    # Get the port from the environment variable or use default port 5000
    port = int(os.environ.get('PORT', 5000))
    # Run the app on 0.0.0.0 with the specified port
    app.run(host='0.0.0.0', port=port)
