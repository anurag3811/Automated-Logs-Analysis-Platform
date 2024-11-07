from flask import Flask, jsonify
from flask_pymongo import PyMongo
from flask_apscheduler import APScheduler
import logging
from datetime import datetime
import json
from pytz import UTC
import time

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb+srv://commonuser:commonuser123@cluster0.czzze.mongodb.net/Logs?retryWrites=true&w=majority&appName=Cluster0"
mongo = PyMongo(app)

# Initialize scheduler
scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

def push_logs_to_mongodb():
    with app.app_context():
        try:
            # Get the current time
            current_time = datetime.now(UTC).isoformat()

            # Create the two log records
            log1 = {
                "Username": "Anurag",
                "Log_id": 1,  # You can replace this with a dynamic value if needed
                "Timestamp": current_time,
                "Values": {
                    "iserrorlog": 0,
                    "message": "This is demo log"
                }
            }
            log2 = {
                "Username": "Anurag",
                "Log_id": 2,  # You can replace this with a dynamic value if needed
                "Timestamp": current_time,
                "Values": {
                    "iserrorlog": 1,
                    "whatfailed": "placeholder",
                    "reason": "This is demo reason"
                }
            }

            # Insert logs into MongoDB
            result = mongo.db.aalllogs.insert_many([log1, log2])
            logging.info(f"Inserted {len(result.inserted_ids)} logs into MongoDB")
            logging.debug(f"Pushed logs: {log1}, {log2}")

        except Exception as e:
            logging.error(f"Error pushing logs to MongoDB: {str(e)}")

# Schedule the push_logs_to_mongodb function to run every 2 seconds
scheduler.add_job(id='push_logs_to_mongodb', func=push_logs_to_mongodb, trigger='interval', seconds=2)

@app.route("/")
def home():
    return "Flask app is running with scheduled log pushing every 2 seconds."

if __name__ == "__main__":
    logging.info("Starting the Flask application with scheduled log pushing...")
    app.run(debug=True, use_reloader=False)  # use_reloader=False to prevent scheduler from running twice
