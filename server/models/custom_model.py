import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, Dropout

class CustomModel:
    def __init__(self, input_shape, num_classes, dropout_rate=0.5):
        """
        Initialize the custom model.
        :param input_shape: Shape of the input data (excluding the batch size).
        :param num_classes: Number of output classes (for classification tasks).
        :param dropout_rate: Dropout rate for regularization.
        """
        self.input_shape = input_shape
        self.num_classes = num_classes
        self.dropout_rate = dropout_rate
        self.model = self._build_model()

    def _build_model(self):
        """
        Build the custom model architecture.
        """
        inputs = Input(shape=self.input_shape)
        x = Dense(128, activation='relu')(inputs)
        x = Dropout(self.dropout_rate)(x)
        x = Dense(64, activation='relu')(x)
        outputs = Dense(self.num_classes, activation='softmax')(x)  # Use 'sigmoid' for binary classification

        model = Model(inputs=inputs, outputs=outputs)
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])  # Use 'binary_crossentropy' for binary classification
        return model

    def train(self, train_data, train_labels, epochs=10, batch_size=32, validation_data=None):
        """
        Train the model.
        :param train_data: Training data.
        :param train_labels: Training labels.
        :param epochs: Number of epochs for training.
        :param batch_size: Batch size for training.
        :param validation_data: Optional validation data.
        """
        self.model.fit(train_data, train_labels, epochs=epochs, batch_size=batch_size, validation_data=validation_data)

    def evaluate(self, test_data, test_labels):
        """
        Evaluate the model.
        :param test_data: Test data.
        :param test_labels: Test labels.
        """
        return self.model.evaluate(test_data, test_labels)

    def predict(self, data):
        """
        Make predictions with the model.
        :param data: Data to predict on.
        """
        return self.model.predict(data)

    def save(self, file_path):
        """
        Save the model to a file.
        :param file_path: Path to save the model.
        """
        self.model.save(file_path)

    def load(self, file_path):
        """
        Load a model from a file.
        :param file_path: Path to load the model from.
        """
        self.model = tf.keras.models.load_model(file_path)
