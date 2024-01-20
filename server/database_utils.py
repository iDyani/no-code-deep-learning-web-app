from bson import ObjectId

class MongoDBUtils:
    def __init__(self, db):
        self.db = db

    def insert_document(self, collection_name, document):
        collection = self.db[collection_name]
        result = collection.insert_one(document)
        return str(result.inserted_id)

    def find_document(self, collection_name, query):
        collection = self.db[collection_name]
        document = collection.find_one(query)
        if document:
            document['_id'] = str(document['_id'])
        return document

    def update_document(self, collection_name, query, update_values):
        collection = self.db[collection_name]
        result = collection.update_one(query, {'$set': update_values})
        return result.modified_count > 0

    def delete_document(self, collection_name, query):
        collection = self.db[collection_name]
        result = collection.delete_one(query)
        return result.deleted_count > 0
