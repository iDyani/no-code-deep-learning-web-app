import re

class DataValidationUtils:
    @staticmethod
    def validate_string(input_string, max_length=255):
        """
        Validates that the input is a string and not too long.
        :param input_string: The string to validate.
        :param max_length: Maximum allowed length of the string.
        :return: Boolean indicating if the input is valid.
        """
        if not isinstance(input_string, str) or len(input_string) > max_length:
            return False
        return True

    @staticmethod
    def sanitize_string(input_string):
        """
        Sanitizes a string to prevent injection attacks.
        :param input_string: The string to sanitize.
        :return: Sanitized string.
        """
        return re.sub(r'[^\w\s]', '', input_string)

    @staticmethod
    def validate_numeric(input_numeric):
        """
        Validates that the input is a numeric type (int or float).
        :param input_numeric: The numeric value to validate.
        :return: Boolean indicating if the input is valid.
        """
        if not isinstance(input_numeric, (int, float)):
            return False
        return True

    @staticmethod
    def validate_file_extension(filename, allowed_extensions):
        """
        Validates the file extension.
        :param filename: The name of the file.
        :param allowed_extensions: A set of allowed file extensions.
        :return: Boolean indicating if the file extension is valid.
        """
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

# Example usage
# result = DataValidationUtils.validate_string("Test", 100)
# sanitized = DataValidationUtils.sanitize_string("<script>alert('Test')</script>")
# is_valid = DataValidationUtils.validate_numeric(123)
# is_valid_extension = DataValidationUtils.validate_file_extension("test.csv", {'csv', 'txt'})
