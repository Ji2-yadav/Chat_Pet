from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename  # Import secure_filename
import os
from dotenv import load_dotenv
from chat_pet import ChatPet 
from chat_db import ChatDatabase

app = Flask(__name__)
CORS(app)
load_dotenv()
ALLOWED_EXTENSIONS = {'csv'}
app.config['UPLOAD_FOLDER'] = os.getenv("UPLOAD_FOLDER")

# C1 = ChatPet()
Db = ChatDatabase('chat_pet.db')
Db.create_database()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload-data', methods=['POST'])
def upload_file():
    
    user_id = request.form.get('user_id')
    print(user_id)
   
    if 'csvFile' not in request.files:
        return jsonify({'message': 'No file part'}), 400

    file = request.files['csvFile']

    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        chat_id = Db.insert_into_chat_map(user_id, filepath)
        file.save(filepath)
        # C1.read_data(filepath)
        return jsonify({'message': 'File uploaded successfully', 'chat_id': chat_id}), 200
    
@app.route('/api/load-messages', methods=['POST'])
def load_db():
    data = request.get_json()
    user_id = data.get('user_id')
    chat_id = data.get('chat_id')
    all_msg_data = Db.select_chat_message(user_id, chat_id)
    filepath = Db.get_file_path(user_id, chat_id)
    # C1.read_data(filepath)
    return jsonify({'data': all_msg_data}), 200

@app.route('/api/load-chats', methods=['POST'])
def load_chats():
    data = request.get_json()

    user_id = data.get('user_id')
    all_chat_ids = Db.select_chat_map(user_id)
    print(all_chat_ids)
    return jsonify({'data': all_chat_ids}), 200

@app.route('/api/delete-chat', methods=['POST'])
def delete_chat():
    data = request.get_json()
    chat_id = data.get('chat_id')
    Db.delete_chat_id(chat_id)
    return jsonify({'message': "Deleted successfully"}), 200

@app.route('/api/edit-message', methods=['POST'])
def edit_text():
    data = request.get_json()
    user_id = data.get('user_id')
    chat_id = data.get('chat_id')
    index = data.get('index')
    text = data.get('text')

    Db.delete_messages(user_id, chat_id, index)

    Db.insert_chat_message(user_id, chat_id, index, text, None, True)
    # bot_response, graph = C1.get_response_lc(text)
    graph = {'bar': [{'cl_names': ('Campaign Type', 'Spends', 'Clicks'), 'cl_values': [['Brand', 'Brand', 'Competitors', 'Competitors', 'Non-brand', 'Non-brand', 'Reactivation', 'Reactivation', 'Shopping', 'Shopping'], [7723.3, 95890.09, 1083.7, 12121.72, 2570.62, 41669.12, 1664.27, 17004.24, 176.27, 3095.94], [2796, 15902, 712, 743, 1294, 3742, 1416, 1138, 121, 590]]}], 'line': [{'cl_names': ('Campaign Type', 'Spends', 'Clicks'), 'cl_values': [['Brand', 'Brand', 'Competitors', 'Competitors', 'Non-brand', 'Non-brand', 'Reactivation', 'Reactivation', 'Shopping', 'Shopping'], [7723.3, 95890.09, 1083.7, 12121.72, 2570.62, 41669.12, 1664.27, 17004.24, 176.27, 3095.94], [2796, 15902, 712, 743, 1294, 3742, 1416, 1138, 121, 590]]}], 'heat_map': [{'cl_names': ('Spends', 'Clicks', 'Cpc'), 'cl_values': [[7723.3, 95890.09, 1083.7, 12121.72, 2570.62, 41669.12, 1664.27, 17004.24, 176.27, 3095.94], [2796, 15902, 712, 743, 1294, 3742, 1416, 1138, 121, 590], [2.76, 6.03, 1.52, 16.31, 1.99, 11.14, 1.18, 14.94, 1.46, 5.25]]}], 'bubble': [{'cl_names': ('Spends', 'Clicks', 'Cpc'), 'cl_values': [[7723.3, 95890.09, 1083.7, 12121.72, 2570.62, 41669.12, 1664.27, 17004.24, 176.27, 3095.94], [2796, 15902, 712, 743, 1294, 3742, 1416, 1138, 121, 590], [2.76, 6.03, 1.52, 16.31, 1.99, 11.14, 1.18, 14.94, 1.46, 5.25]]}], 'pie': [{'cl_names': ('Campaign Type', 'Spends'), 'cl_values': [['Brand', 'Competitors', 'Non-brand', 'Reactivation', 'Shopping'], [1385374.7100000002, 93871.37, 445671.79000000004, 250480.96000000002, 45735.860000000015]]}]}
    bot_response = 'The underlying reasons for the observed dips in BOB CAC for September month could be due to higher Cpc for Brand campaigns on Google and higher Cvr for Non-brand campaigns on Bing.'
        
    Db.insert_chat_message(user_id, chat_id, index + 1, bot_response, graph, False)
    
    all_msg_data = Db.select_chat_message(user_id, chat_id)
    return jsonify({'data': all_msg_data}), 200
    
@app.route('/api/chat-initiation', methods=['POST'])
def start_chat():
    try:
        bot_response = "Thanks for uploading the data. Now you can start asking questions."
        graph = {}

        return jsonify({'reply': bot_response, 'graph': graph})
    except Exception as e:
        return jsonify({'error': 'An error occurred while processing the request.'})

@app.route('/api/user-question', methods=['POST'])
def receive_user_question():
    try:
        data = request.get_json()
        message_id = data.get('message_id')
        user_id = data.get('user_id')
        chat_id = data.get('chat_id')
        user_message = data.get('message')
        
        Db.insert_chat_message(user_id, chat_id, message_id, user_message, None, True)

        # bot_response, graph = C1.get_response_lc(user_message)
        graph = {'line': [{'cl_names': ('Campaign Type', 'Spends', 'Clicks'), 'cl_values': [['Brand', 'Brand', 'Competitors', 'Competitors', 'Non-brand', 'Non-brand', 'Reactivation', 'Reactivation', 'Shopping', 'Shopping'], [7723.3, 95890.09, 1083.7, 12121.72, 2570.62, 41669.12, 1664.27, 17004.24, 176.27, 3095.94], [2796, 15902, 712, 743, 1294, 3742, 1416, 1138, 121, 590]]}], 'heat_map': [{'cl_names': ('Spends', 'Clicks', 'Cpc'), 'cl_values': [[7723.3, 95890.09, 1083.7, 12121.72, 2570.62, 41669.12, 1664.27, 17004.24, 176.27, 3095.94], [2796, 15902, 712, 743, 1294, 3742, 1416, 1138, 121, 590], [2.76, 6.03, 1.52, 16.31, 1.99, 11.14, 1.18, 14.94, 1.46, 5.25]]}], 'bubble': [{'cl_names': ('Spends', 'Clicks', 'Cpc'), 'cl_values': [[7723.3, 95890.09, 1083.7, 12121.72, 2570.62, 41669.12, 1664.27, 17004.24, 176.27, 3095.94], [2796, 15902, 712, 743, 1294, 3742, 1416, 1138, 121, 590], [2.76, 6.03, 1.52, 16.31, 1.99, 11.14, 1.18, 14.94, 1.46, 5.25]]}], 'pie': [{'cl_names': ('Campaign Type', 'Spends'), 'cl_values': [['Brand', 'Competitors', 'Non-brand', 'Reactivation', 'Shopping'], [1385374.7100000002, 93871.37, 445671.79000000004, 250480.96000000002, 45735.860000000015]]}]}
        bot_response = 'The underlying reasons for the observed dips in BOB CAC for September month could be due to higher Cpc for Brand campaigns on Google and higher Cvr for Non-brand campaigns on Bing.'
        Db.insert_chat_message(user_id, chat_id, message_id + 1, bot_response, graph, False)
        return jsonify({'reply': bot_response, 'graph': graph})
    except Exception as e:
        return jsonify({'error': f'An error occurred while processing the request: {e}'})


if __name__ == '__main__':
    app.run(debug=True, port=5001)
