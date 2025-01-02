import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
import threading

app = Flask(__name__)
CORS(app)

# Centralized JSON file for storage
EVENTS_FILE = 'events.json'
lock = threading.Lock()  # Prevent concurrent write issues

def load_events():
    """Load events from the JSON file."""
    if os.path.exists(EVENTS_FILE):
        with open(EVENTS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_events(events):
    """Save events to the JSON file."""
    with lock:
        with open(EVENTS_FILE, 'w') as f:
            json.dump(events, f, indent=4)

@app.route('/')
def index():
    """Render the main HTML page."""
    return render_template('index.html')

@app.route('/events', methods=['GET'])
def get_events():
    """Retrieve all events."""
    events = load_events()
    return jsonify(events)

@app.route('/events', methods=['POST'])
def add_event():
    """Add a new event."""
    data = request.json
    password = data.get('password')
    
    if password != 'admin123':
        return jsonify({"error": "Unauthorized"}), 401

    events = load_events()
    key = data.get('key')
    title = data.get('title')
    description = data.get('description')

    if key and title and description:
        if key in events:
            return jsonify({"error": "Event with this key already exists"}), 400
        
        events[key] = {
            "title": title,
            "description": description
        }
        save_events(events)
        return jsonify({"message": "Event added successfully"}), 201
    
    return jsonify({"error": "Invalid event data"}), 400

@app.route('/events/<key>', methods=['PUT'])
def update_event(key):
    """Update an existing event."""
    data = request.json
    password = data.get('password')
    
    if password != 'admin123':
        return jsonify({"error": "Unauthorized"}), 401

    events = load_events()

    if key in events:
        events[key]['title'] = data.get('title', events[key]['title'])
        events[key]['description'] = data.get('description', events[key]['description'])
        save_events(events)
        return jsonify({"message": "Event updated successfully"}), 200
    
    return jsonify({"error": "Event not found"}), 404

@app.route('/events/<key>', methods=['DELETE'])
def delete_event(key):
    """Delete an event."""
    data = request.json
    password = data.get('password')
    
    if password != 'admin123':
        return jsonify({"error": "Unauthorized"}), 401

    events = load_events()

    if key in events:
        del events[key]
        save_events(events)
        return jsonify({"message": "Event deleted successfully"}), 200
    
    return jsonify({"error": "Event not found"}), 404

if __name__ == '__main__':
    # Initialize an empty JSON file if it doesn't exist
    if not os.path.exists(EVENTS_FILE):
        save_events({})
    app.run(host='0.0.0.0', port=5050, debug=False)
