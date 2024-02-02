import os
from dotenv import load_dotenv

# Load environment variables from a .env file located in the same directory as this script.
# This allows for secure and flexible configuration management by keeping sensitive information out of the source code.
load_dotenv()

class Config:
    """
    Configuration class to centralize the application's settings.
    This class reads settings from environment variables, which allows for flexibility and security.
    """

    def __init__(self):
        """
        Initialize the configuration class by loading settings from environment variables.
        If an environment variable is not set, default values are used.
        """
        # Debug mode setting: Converts the DEBUG environment variable to boolean. Useful for enabling/disabling debug features.
        self.DEBUG = os.getenv('DEBUG', 'False').lower() in ['true', '1']
        # Secret key for the application: Used for securely signing the session cookie.
        self.SECRET_KEY = os.getenv('SECRET_KEY', 'your-default-secret-key')
        # MongoDB URI: Connection string to MongoDB. Supports customization for different deployment environments.
        self.MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
        # MongoDB Database Name: Specifies the database to use within MongoDB.
        self.MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'mydatabase')

    @property
    def is_debug(self):
        """
        Helper property to easily check if the application is running in debug mode.
        Returns True if debug mode is enabled, False otherwise.
        """
        return self.DEBUG
