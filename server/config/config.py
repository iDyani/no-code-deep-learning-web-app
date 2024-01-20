import os
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

class Config:
    """
    Configuration class to hold all settings for the application.
    """

    def __init__(self):
        """
        Initialize with settings from environment variables.
        """
        self.DEBUG = os.getenv('DEBUG', 'False').lower() in ['true', '1']
        self.SECRET_KEY = os.getenv('SECRET_KEY', 'your-default-secret-key')
        self.MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
        self.MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'mydatabase')
        self.GPT3_API_KEY = os.getenv('GPT3_API_KEY', 'your-gpt3-api-key')
        # Add other configuration settings as needed

    @property
    def is_debug(self):
        """
        Check if the application is in debug mode.
        """
        return self.DEBUG

    # Add other getter methods or properties as needed for your configuration

# Example of creating an instance of Config
# app_config = Config()
# print(app_config.SECRET_KEY)
