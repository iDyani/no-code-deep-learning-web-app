from pymongo import MongoClient
import os

class MongoDBConfig:
    def __init__(self):
        self.mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
        self.db_name = os.getenv('MONGO_DB_NAME', 'mydatabase')
        self.client = None
        self.db = None

    def connect(self):
        try:
            self.client = MongoClient(self.mongo_uri)
            self.db = self.client[self.db_name]
            print(f"Connected to MongoDB at {self.mongo_uri}")
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            raise

    def disconnect(self):
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB")
