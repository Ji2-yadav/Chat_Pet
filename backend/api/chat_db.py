import sqlite3
import json
import os
from pprint import pprint

class ChatDatabase:
    def __init__(self, database_name):
        self.database_name = database_name
        self.conn = sqlite3.connect(self.database_name, check_same_thread=False)
        self.cursor = self.conn.cursor()

    def create_database(self):
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_map (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                chat_id INTEGER,
                chat_name TEXT,
                path TEXT
            )
        ''')

        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_message (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                chat_id INTEGER,
                message_id INTEGER,
                message TEXT,
                graph TEXT,
                sender BINARY
            )
        ''')

        self.conn.commit()
        print(f"Database '{self.database_name}' and tables 'chat_map' and 'chat_message' created successfully.")

    def execute_query(self, query, *args):
        try:
            self.cursor.execute(query, args)
            self.conn.commit()
        except Exception as e:
            print("ERROR",e)

    def insert_chat_message(self, user_id, chat_id, message_id, message, graph_data, sender):
        graph_json = json.dumps(graph_data)
        self.execute_query("INSERT INTO chat_message (user_id, chat_id, message_id, message, graph, sender) VALUES (?, ?, ?, ?, ?, ?)",
                           user_id, chat_id, message_id, message, graph_json, sender)

    def insert_into_chat_map(self, user_id, file_path):
        curr_chat_id = self.get_max_chat_id()
        if curr_chat_id == None:
            curr_chat_id = 0
        chat_id = curr_chat_id + 1
        chat_name = "Untitled" + str(chat_id)
        self.execute_query("INSERT INTO chat_map (user_id, chat_id, chat_name, path) VALUES (?, ?, ?, ?)", user_id, chat_id, chat_name, file_path)

        return chat_id

    def select_chat_map(self, user_id):
        print("user id", user_id)
        self.cursor.execute("SELECT chat_id, chat_name FROM chat_map WHERE user_id = ?", (user_id,))
        rows = self.cursor.fetchall()
        return rows

    def get_file_path(self, user_id, chat_id):
        self.cursor.execute("SELECT path FROM chat_map WHERE user_id = ? AND chat_id  = ?", (user_id,chat_id))
        path = self.cursor.fetchone()[0]
        return path
    
    def get_max_chat_id(self):
        self.cursor.execute("SELECT MAX(chat_id) FROM chat_map")
        max_chat_id = self.cursor.fetchone()[0]
        return max_chat_id

    def select_chat_message(self, user_id, chat_id):
        print(user_id, chat_id)
        self.cursor.execute("SELECT * FROM chat_message WHERE user_id = ? AND chat_id = ?", (user_id, chat_id))
        rows = self.cursor.fetchall()
        return rows

    def clear_database(self):
        self.execute_query("DELETE FROM chat_map")
        self.execute_query("DELETE FROM chat_message")
        print(f"Database '{self.database_name}' cleared successfully.")

    def show_tables(self):
        self.cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        table_names = [row[0] for row in self.cursor.fetchall()]
        return table_names

    def remove_database(self):
        self.conn.close()
        if os.path.exists(self.database_name):
            os.remove(self.database_name)
            print(f"Database '{self.database_name}' removed successfully.")
        else:
            print(f"Database file '{self.database_name}' not found. No action taken.")

    def delete_messages(self, user_id, chat_id, min_message_id):
        self.execute_query("DELETE FROM chat_message WHERE user_id = ? AND chat_id = ? AND message_id >= ?", user_id, chat_id, min_message_id)
    
    def delete_chat_id(self, chat_id):
        self.execute_query("DELETE FROM chat_map WHERE chat_id = ?", chat_id)
        self.execute_query("DELETE FROM chat_message WHERE chat_id = ?", chat_id)

# chat_db = ChatDatabase('chat_pet.db')
# chat_db.create_database()
# chat_db.insert_into_chat_map(1, 1)
# chat_db.insert_chat_message(1, 1, 1, "Hello", None, "User1")
# tables = chat_db.show_tables()
# print("Tables in the database:", tables)
# print(chat_db.select_chat_message(1, 1))
# chat_db.clear_database()
# chat_db.remove_database()
