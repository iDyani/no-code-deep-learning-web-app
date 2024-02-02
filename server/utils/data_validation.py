import re

class DataValidationUtils:
    """
    A utility class for performing common data validation and sanitization tasks.
    This class provides static methods to validate strings, numerics, and file extensions,
    and to sanitize strings to prevent security vulnerabilities such as injection attacks.
    """

    @staticmethod
    def validate_string(input_string, max_length=255):
        """
        Validates that the input is a string and its length does not exceed the specified maximum.
        
        :param input_string: The string to validate.
        :param max_length: The maximum allowed length for the string. Defaults to 255.
        :return: A boolean indicating if the input string is valid (True) or not (False).
        """
        # Check if the input is a string and its length is within the allowed limit.
        if not isinstance(input_string, str) or len(input_string) > max_length:
            return False  # Return False if it's not a string or too long.
        return True  # Return True if it passes both checks.

    @staticmethod
    def sanitize_string(input_string):
        """
        Removes potentially harmful characters from a string to prevent injection attacks.
        
        :param input_string: The string to be sanitized.
        :return: A sanitized string with special characters removed, leaving only word characters and whitespace.
        """
        # Use regular expression to remove any character that is not a word character or whitespace.
        return re.sub(r'[^\w\s]', '', input_string)

    @staticmethod
    def validate_numeric(input_numeric):
        """
        Validates that the input is either an integer or a floating-point number.
        
        :param input_numeric: The numeric value to validate.
        :return: A boolean indicating if the input is a valid numeric type (True) or not (False).
        """
        # Check if the input is an instance of int or float.
        if not isinstance(input_numeric, (int, float)):
            return False  # Return False if it's neither an int nor a float.
        return True  # Return True if it's a valid numeric type.

    @staticmethod
    def validate_file_extension(filename, allowed_extensions):
        """
        Checks if the given filename has an extension that is among the allowed ones.
        
        :param filename: The name of the file to check.
        :param allowed_extensions: A set or list of allowed file extensions (e.g., {'txt', 'csv'}).
        :return: A boolean indicating if the file extension is valid (True) or not (False).
        """
        # Split the filename by '.' and get the last part (extension), then check if it's in the allowed extensions.
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions
