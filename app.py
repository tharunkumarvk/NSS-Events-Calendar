from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///events.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app)

# Event Model
class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    day = db.Column(db.Integer, nullable=False)
    month = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'day': self.day,
            'month': self.month,
            'title': self.title,
            'description': self.description
        }

# Ensure database is created
with app.app_context():
    db.create_all()

# Serve the HTML frontend
@app.route('/')
def index():
    return render_template('index.html')

# Serve static files
@app.route('/static/<path:filename>')
def serve_static(filename):
    root_dir = os.path.dirname(os.getcwd())
    return send_from_directory(os.path.join(root_dir, 'nss-calender', 'static'), filename)

# Get events for a specific month
@app.route('/events/<int:month>', methods=['GET'])
def get_events(month):
    events = Event.query.filter_by(month=month).all()
    return jsonify([event.to_dict() for event in events])

# Add a new event
@app.route('/events', methods=['POST'])
def add_event():
    data = request.json
    admin_password = request.headers.get('X-Admin-Password')
    
    if admin_password != 'admin123':
        return jsonify({'error': 'Unauthorized'}), 401
    
    new_event = Event(
        day=data['day'],
        month=data['month'],
        title=data['title'],
        description=data['description']
    )
    
    try:
        db.session.add(new_event)
        db.session.commit()
        return jsonify(new_event.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Edit an existing event
@app.route('/events/<int:event_id>', methods=['PUT'])
def edit_event(event_id):
    admin_password = request.headers.get('X-Admin-Password')
    
    if admin_password != 'admin123':
        return jsonify({'error': 'Unauthorized'}), 401
    
    event = Event.query.get_or_404(event_id)
    data = request.json
    
    event.title = data.get('title', event.title)
    event.description = data.get('description', event.description)
    
    try:
        db.session.commit()
        return jsonify(event.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Delete an event
@app.route('/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    admin_password = request.headers.get('X-Admin-Password')
    
    if admin_password != 'admin123':
        return jsonify({'error': 'Unauthorized'}), 401
    
    event = Event.query.get_or_404(event_id)
    
    try:
        db.session.delete(event)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)